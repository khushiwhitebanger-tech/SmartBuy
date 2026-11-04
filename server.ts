import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { INITIAL_PRODUCTS } from './src/data/products';
import { INITIAL_COUPONS, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_SETTINGS, INITIAL_USERS } from './src/data/initialData';
import { Order, Product, User, Coupon, Review, StoreSettings } from './src/types';
import { registerAdminRoutes } from './src/server/adminRoutes';
import {
  createSupabaseOrder,
  fetchSupabaseOrders,
  updateSupabaseOrderStatus,
  getSupabaseConfig,
  testSupabaseConnection,
  syncLocalOrdersToSupabase,
  setSupabaseApiKey,
} from './src/server/supabase';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory persistent database store
let products: Product[] = [...INITIAL_PRODUCTS];
let orders: Order[] = [...INITIAL_ORDERS];
let users: User[] = [...INITIAL_USERS];
let coupons: Coupon[] = [...INITIAL_COUPONS];
let reviews: Review[] = [...INITIAL_REVIEWS];
let settings: StoreSettings = { ...INITIAL_SETTINGS };
let newsletterSubscribers: { email: string; subscribedAt: string; code: string }[] = [];

// Optional disk persistence fallback
const DB_FILE = path.join(__dirname, '.smartbuy_db.json');
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (data.products) products = data.products;
    if (data.orders) orders = data.orders;
    if (data.users) users = data.users;
    if (data.coupons) coupons = data.coupons;
    if (data.reviews) reviews = data.reviews;
    if (data.settings) settings = data.settings;
    if (data.subscribers) newsletterSubscribers = data.subscribers;
  }
} catch {
  // Use memory defaults
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({
      products,
      orders,
      users,
      coupons,
      reviews,
      settings,
      subscribers: newsletterSubscribers,
    }, null, 2));
  } catch (err) {
    console.error('Failed to save DB to disk', err);
  }
}

async function createServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());
  app.use(express.static(path.resolve(__dirname, 'public')));
  app.use('/images', express.static(path.resolve(__dirname, 'images')));
  app.use('/Shirts', express.static(path.resolve(__dirname, 'Shirts')));
  app.use('/Cargopants', express.static(path.resolve(__dirname, 'Cargopants')));
  app.use('/stripedshirts', express.static(path.resolve(__dirname, 'stripedshirts')));
  app.use('/T-shirtsVneck', express.static(path.resolve(__dirname, 'T-shirtsVneck')));
  app.use('/CheckedShirts', express.static(path.resolve(__dirname, 'CheckedShirts')));
  app.use('/Co-ordSets', express.static(path.resolve(__dirname, 'Co-ordSets')));
  app.use('/MenHoodies', express.static(path.resolve(__dirname, 'MenHoodies')));
  app.use('/HeroImage', express.static(path.resolve(__dirname, 'HeroImage')));
  app.use('/Men Sweatshirts', express.static(path.resolve(__dirname, 'Men Sweatshirts')));
  app.use('/MenSweatshirts', express.static(path.resolve(__dirname, 'Men Sweatshirts')));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'healthy', brand: 'SMART BUY', timestamp: new Date().toISOString() });
  });

  // Settings
  app.get('/api/settings', (_req: Request, res: Response) => {
    res.json(settings);
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    settings = { ...settings, ...req.body };
    saveDb();
    res.json(settings);
  });

  // Products
  app.get('/api/products', (req: Request, res: Response) => {
    const { department, category, collection, search, sort, minPrice, maxPrice, inStock } = req.query;
    let filtered = [...products];

    if (department && department !== 'all') {
      filtered = filtered.filter(p => p.department === department);
    }
    if (category && category !== 'all') {
      const catQuery = (category as string).toLowerCase();
      filtered = filtered.filter(p => {
        const cat = p.category.toLowerCase();
        if (cat === catQuery) return true;
        if (catQuery === 'v-neck t-shirts' && (cat.includes('t-shirt') || cat.includes('polo')) && (p.name.toLowerCase().includes('v-neck') || p.name.toLowerCase().includes('waffle') || p.name.toLowerCase().includes('johnny'))) return true;
        if (catQuery === 'cargo pants' && (cat.includes('cargo') || p.name.toLowerCase().includes('cargo'))) return true;
        if (catQuery === 'pants and joggers' && (cat.includes('cargo') || cat.includes('pant') || cat.includes('jogger'))) return true;
        if ((catQuery === 'checked shirts' || catQuery === 'check shirts') && (cat.includes('shirt') && (p.name.toLowerCase().includes('check') || p.name.toLowerCase().includes('plaid')))) return true;
        if ((catQuery === 'striped shirts' || catQuery === 'stripe shirts') && (cat.includes('shirt') && (p.name.toLowerCase().includes('stripe') || p.name.toLowerCase().includes('pinstripe')))) return true;
        if ((catQuery === 'co-ord sets' || catQuery === 'coord sets') && (cat.includes('co-ord') || cat.includes('coord') || p.name.toLowerCase().includes('co-ord') || p.name.toLowerCase().includes('set'))) return true;
        if ((catQuery === 'ethnic wear' || catQuery === 'ethnic') && (cat.includes('ethnic') || p.name.toLowerCase().includes('kurti') || p.name.toLowerCase().includes('pakistani'))) return true;
        if ((catQuery.includes('hoodie') || catQuery.includes('sweatshirt')) && (cat.includes('hoodie') || cat.includes('sweatshirt') || p.name.toLowerCase().includes('hoodie'))) return true;
        return false;
      });
    }
    if (collection && collection !== 'all') {
      filtered = filtered.filter(p => p.collection.toLowerCase() === (collection as string).toLowerCase());
    }
    if (search) {
      const q = (search as string).toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= Number(maxPrice));
    }
    if (inStock === 'true') {
      filtered = filtered.filter(p => p.totalStock > 0);
    }

    // Sort
    if (sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Popularity default
      filtered.sort((a, b) => (b.reviewCount * b.rating) - (a.reviewCount * a.rating));
    }

    res.json(filtered);
  });

  app.get('/api/products/:id', (req: Request, res: Response) => {
    const product = products.find(p => p.id === req.params.id || p.slug === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  // Admin Product Create
  app.post('/api/products', (req: Request, res: Response) => {
    const newProduct: Product = {
      ...req.body,
      id: req.body.id || `sb-custom-${Date.now()}`,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date().toISOString(),
      rating: req.body.rating || 5.0,
      reviewCount: req.body.reviewCount || 0,
      totalStock: req.body.totalStock || 50,
    };
    products.unshift(newProduct);
    saveDb();
    res.status(201).json(newProduct);
  });

  // Admin Product Update
  app.put('/api/products/:id', (req: Request, res: Response) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    products[idx] = { ...products[idx], ...req.body };
    saveDb();
    res.json(products[idx]);
  });

  // Admin Product Delete
  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    products.splice(idx, 1);
    saveDb();
    res.json({ success: true, message: 'Product removed' });
  });

  // Coupons
  app.get('/api/coupons', (_req: Request, res: Response) => {
    res.json(coupons);
  });

  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ valid: false, error: 'Coupon code is required' });

    const found = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
    if (!found) {
      return res.status(404).json({ valid: false, error: 'Invalid or expired coupon code' });
    }

    if (cartTotal < found.minOrderAmount) {
      return res.status(400).json({
        valid: false,
        error: `Minimum order amount of ₹${found.minOrderAmount} required for this coupon`,
      });
    }

    const discountAmount = found.discountType === 'percentage'
      ? Math.round((cartTotal * found.value) / 100)
      : found.value;

    res.json({
      valid: true,
      coupon: found,
      discountAmount,
    });
  });

  app.post('/api/coupons', (req: Request, res: Response) => {
    const newCoupon: Coupon = {
      code: req.body.code.toUpperCase().trim(),
      discountType: req.body.discountType || 'percentage',
      value: Number(req.body.value) || 10,
      minOrderAmount: Number(req.body.minOrderAmount) || 0,
      description: req.body.description || '',
      isActive: true,
    };
    coupons.push(newCoupon);
    saveDb();
    res.status(201).json(newCoupon);
  });

  // Orders (Synced with Supabase Backend)
  app.get('/api/orders', async (req: Request, res: Response) => {
    const { userId } = req.query;

    // Try live Supabase fetch first
    try {
      const supabaseOrders = await fetchSupabaseOrders();
      if (supabaseOrders && supabaseOrders.length > 0) {
        // Merge with any un-synced local orders
        const mergedMap = new Map<string, Order>();
        supabaseOrders.forEach((o) => mergedMap.set(o.id, o));
        orders.forEach((o) => {
          if (!mergedMap.has(o.id)) mergedMap.set(o.id, o);
        });
        const combined = Array.from(mergedMap.values());
        if (userId) {
          return res.json(combined.filter((o) => o.userId === userId));
        }
        return res.json(combined);
      }
    } catch {
      // fallback to memory
    }

    if (userId) {
      return res.json(orders.filter((o) => o.userId === userId));
    }
    res.json(orders);
  });

  app.get('/api/orders/:id', async (req: Request, res: Response) => {
    const order = orders.find(o => o.id === req.params.id || o.orderNumber === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  // Place Order (with server-side stock check, deduction & atomic Supabase persistence)
  app.post('/api/orders', async (req: Request, res: Response) => {
    const { customerName, customerEmail, customerPhone, shippingAddress, items, couponCode, paymentMethod, paymentId } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    if (!shippingAddress || (!shippingAddress.pincode && !shippingAddress.postalCode)) {
      return res.status(400).json({ error: 'Valid Indian delivery address and PIN code are required' });
    }

    // Server-side inventory & price verification
    let calculatedSubtotal = 0;
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${item.name}` });
      }
      calculatedSubtotal += prod.price * item.quantity;

      // Deduct stock
      const variantKey = `${item.size}_${item.color}`;
      if (prod.stockByVariant && prod.stockByVariant[variantKey] !== undefined) {
        prod.stockByVariant[variantKey] = Math.max(0, prod.stockByVariant[variantKey] - item.quantity);
      }
      prod.totalStock = Math.max(0, prod.totalStock - item.quantity);
    }

    // Apply Coupon
    let discount = 0;
    if (couponCode) {
      const validCoupon = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive);
      if (validCoupon && calculatedSubtotal >= validCoupon.minOrderAmount) {
        discount = validCoupon.discountType === 'percentage'
          ? Math.round((calculatedSubtotal * validCoupon.value) / 100)
          : validCoupon.value;
      }
    }

    // Shipping & COD
    const shippingFee = calculatedSubtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
    const codFee = paymentMethod === 'cod' ? settings.codFee : 0;
    const finalTotal = Math.max(0, calculatedSubtotal - discount + shippingFee + codFee);

    const orderId = `ord-${Date.now().toString().slice(-6)}`;
    const orderNumber = `SB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: req.body.userId || 'guest',
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      subtotal: calculatedSubtotal,
      discount,
      couponCode,
      shippingFee,
      codFee,
      total: finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentId: paymentId || (paymentMethod === 'cod' ? undefined : `pay_rzp_${Date.now()}`),
      status: 'confirmed',
      carrier: 'Delhivery Surface Express',
      trackingNumber: `DEL-IND-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      createdAt: new Date().toISOString(),
      trackingHistory: [
        {
          status: 'placed',
          title: 'Order Placed',
          description: paymentMethod === 'cod'
            ? 'Order placed with Cash on Delivery verification.'
            : 'Payment authorized and verified securely.',
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
          location: 'Online Store',
        },
        {
          status: 'confirmed',
          title: 'Confirmed by Fulfillment Team',
          description: 'Ready to be picked and packaged at Bengaluru Fulfillment Center.',
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
          location: 'Bengaluru Fulfillment Center',
        },
      ],
    };

    // 1. Persist to Supabase Database
    try {
      const supaRes = await createSupabaseOrder(newOrder);
      if (!supaRes.success) {
        console.warn(`[Supabase Note] Order saved locally, Supabase note: ${supaRes.error}`);
      }
    } catch (supaErr) {
      console.error('[Supabase Write Warning]', supaErr);
    }

    // 2. Persist to local verified store
    orders.unshift(newOrder);
    saveDb();

    res.status(201).json(newOrder);
  });

  // Update order status (Admin & Storefront)
  app.put('/api/orders/:id/status', async (req: Request, res: Response) => {
    const { status, trackingNumber, note } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.trackingHistory.push({
      status,
      title: `Status: ${status.toUpperCase()}`,
      description: note || `Order status updated to ${status}.`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      location: 'Central Fulfillment Facility, Gurugram',
    });

    saveDb();

    // Sync to Supabase
    await updateSupabaseOrderStatus(order.id, status, trackingNumber, order.trackingHistory);

    res.json(order);
  });

  // Supabase Status & Sync Endpoints
  app.get('/api/supabase/status', async (_req: Request, res: Response) => {
    const config = getSupabaseConfig();
    const connection = await testSupabaseConnection();
    res.json({
      config,
      connection,
      localOrdersCount: orders.length,
      genuineOrdersCount: orders.filter(o => o.userId !== 'demo-customer').length,
    });
  });

  app.post('/api/supabase/config', async (req: Request, res: Response) => {
    const { key, url } = req.body;
    if (!key) return res.status(400).json({ error: 'API key is required' });
    const success = setSupabaseApiKey(key, url);
    const connection = await testSupabaseConnection();

    // Auto-sync existing orders if connected
    let syncResult = null;
    if (connection.success && connection.tableFound) {
      syncResult = await syncLocalOrdersToSupabase(orders);
    }

    res.json({ success, connection, syncResult });
  });

  app.post('/api/supabase/sync', async (_req: Request, res: Response) => {
    const syncResult = await syncLocalOrdersToSupabase(orders);
    res.json({ success: true, ...syncResult });
  });

  // Cancel Order (Customer)
  app.post('/api/orders/:id/cancel', (req: Request, res: Response) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status === 'delivered' || order.status === 'shipped') {
      return res.status(400).json({ error: 'Cannot cancel order that is already shipped or delivered' });
    }
    order.status = 'cancelled';
    order.trackingHistory.push({
      status: 'cancelled',
      title: 'Order Cancelled',
      description: req.body.reason || 'Cancelled by customer.',
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
    });
    saveDb();
    res.json({ success: true, order });
  });

  // Return Request (Customer)
  app.post('/api/orders/:id/return', (req: Request, res: Response) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = 'return_requested';
    order.returnReason = req.body.reason || 'Size/Fit adjustment';
    order.returnStatus = 'pending';
    order.trackingHistory.push({
      status: 'return_requested',
      title: 'Return Request Received',
      description: `Reason: ${order.returnReason}. Pick-up executive will be scheduled.`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
    });
    saveDb();
    res.json({ success: true, order });
  });

  // Auth: Mock Authentication Routes
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ success: true, user, token: `smartbuy_token_${user.id}` });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      phone: phone || '',
      role: 'customer',
      savedAddresses: [],
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveDb();
    res.status(201).json({ success: true, user: newUser, token: `smartbuy_token_${newUser.id}` });
  });

  // Newsletter
  app.post('/api/newsletter', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    const promoCode = 'SMART10';
    newsletterSubscribers.push({
      email,
      subscribedAt: new Date().toISOString(),
      code: promoCode,
    });
    saveDb();
    res.json({
      success: true,
      message: 'Welcome to the SMART BUY Club! Use code SMART10 for 10% off your first order.',
      code: promoCode,
    });
  });

  // Reviews
  app.get('/api/reviews/:productId', (req: Request, res: Response) => {
    const list = reviews.filter(r => r.productId === req.params.productId);
    res.json(list);
  });

  app.post('/api/reviews', (req: Request, res: Response) => {
    const { productId, author, city, rating, comment } = req.body;
    if (!productId || !comment) return res.status(400).json({ error: 'Product and comment are required' });

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId,
      author: author || 'SMART BUY Customer',
      city: city || 'India',
      rating: Number(rating) || 5,
      comment,
      date: new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
      verifiedPurchase: true,
    };
    reviews.unshift(newRev);

    // Update product rating and reviewCount
    const prod = products.find(p => p.id === productId);
    if (prod) {
      prod.reviewCount = (prod.reviewCount || 0) + 1;
      prod.rating = Number(((prod.rating * (prod.reviewCount - 1) + newRev.rating) / prod.reviewCount).toFixed(1));
    }

    saveDb();
    res.status(201).json(newRev);
  });

  // Admin Enterprise Engine
  registerAdminRoutes(app, {
    getProducts: () => products,
    setProducts: (fn) => { products = fn(products); },
    getOrders: () => orders,
    setOrders: (fn) => { orders = fn(orders); },
    getUsers: () => users,
    setUsers: (fn) => { users = fn(users); },
    getCoupons: () => coupons,
    setCoupons: (fn) => { coupons = fn(coupons); },
    getSettings: () => settings,
    setSettings: (s) => { settings = s; },
    saveDb,
  });

  // --- VITE MIDDLEWARE INTEGRATION ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SMART BUY Server active on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
