import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, User, Coupon, Order, Address } from '../types';
import { INITIAL_PRODUCTS, COMPLETE_THE_LOOK_BUNDLE } from '../data/products';
import { INITIAL_COUPONS, INITIAL_ORDERS, INITIAL_SETTINGS, INITIAL_USERS } from '../data/initialData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  products: Product[];
  isLoadingProducts: boolean;
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  codFee: number;
  total: number;
  appliedCoupon: Coupon | null;
  addToCart: (product: Product, size: string, color: string, colorHex: string, quantity?: number) => void;
  addBundleToCart: () => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickSwitchUser: (type?: 'customer') => void;
  orders: Order[];
  createOrder: (orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: Address;
    paymentMethod: 'razorpay' | 'cod' | 'upi' | 'card' | 'netbanking';
    paymentId?: string;
  }) => Promise<{ success: boolean; order?: Order; error?: string }>;
  cancelOrder: (orderId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  requestReturn: (orderId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  formatINR: (amount: number) => string;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  isSizeGuideOpen: boolean;
  openSizeGuide: (category?: string) => void;
  closeSizeGuide: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  settings: typeof INITIAL_SETTINGS;
  refreshProducts: () => Promise<void>;
  deleteProduct: (productId: string) => Promise<boolean>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('smartbuy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smartbuy_wishlist');
      return saved ? JSON.parse(saved) : ['sb-men-01', 'sb-women-01'];
    } catch {
      return ['sb-men-01', 'sb-women-01'];
    }
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('smartbuy_user');
      return saved ? JSON.parse(saved) : INITIAL_USERS[1]; // default demo customer Rahul
    } catch {
      return INITIAL_USERS[1];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const settings = INITIAL_SETTINGS;

  // Persist cart & wishlist
  useEffect(() => {
    try {
      localStorage.setItem('smartbuy_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('smartbuy_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('smartbuy_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('smartbuy_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Load products from API
  const refreshProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      }
    } catch {
      // Fallback to memory
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Cart operations
  const addToCart = (product: Product, size: string, color: string, colorHex: string, quantity = 1) => {
    const cartItemId = `${product.id}_${size}_${color}`;
    const variantStockKey = `${size}_${color}`;
    const maxStock = product.stockByVariant[variantStockKey] ?? product.totalStock ?? 10;

    if (maxStock <= 0) {
      showToast('Selected variant is currently out of stock', 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        const updatedQty = Math.min(existing.quantity + quantity, maxStock);
        if (existing.quantity >= maxStock) {
          showToast(`Maximum available stock (${maxStock}) reached for this item`, 'info');
          return prev;
        }
        showToast(`Updated quantity in your shopping cart`, 'success');
        return prev.map((item) => (item.id === cartItemId ? { ...item, quantity: updatedQty } : item));
      }

      showToast(`Added ${product.name} to your cart`, 'success');
      return [
        ...prev,
        {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          size,
          color,
          colorHex,
          image: product.images[0],
          quantity: Math.min(quantity, maxStock),
          maxStock,
        },
      ];
    });

    setIsCartDrawerOpen(true);
  };

  const addBundleToCart = () => {
    COMPLETE_THE_LOOK_BUNDLE.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        // Calculate discounted bundle price per item proportion
        const itemDiscountPrice = Math.round((item.price / COMPLETE_THE_LOOK_BUNDLE.individualTotal) * COMPLETE_THE_LOOK_BUNDLE.bundlePrice);
        const cartItemId = `${item.productId}_${item.size}_${item.color}`;

        setCart((prev) => {
          const exists = prev.find((i) => i.id === cartItemId);
          if (exists) {
            return prev.map((i) => (i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i));
          }
          return [
            ...prev,
            {
              id: cartItemId,
              productId: item.productId,
              name: item.name,
              slug: prod.slug,
              price: itemDiscountPrice,
              originalPrice: item.originalPrice,
              size: item.size,
              color: item.color,
              colorHex: item.colorHex,
              image: item.image,
              quantity: 1,
              maxStock: 10,
            },
          ];
        });
      }
    });
    showToast('The Complete Minimalist Uniform added to cart with 23% savings!', 'success');
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const qty = Math.min(newQty, item.maxStock);
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discount = appliedCoupon.value;
    }
  }

  const shippingFee = subtotal >= settings.freeShippingThreshold || subtotal === 0 ? 0 : settings.standardShippingFee;
  const codFee = 0; // will be dynamic on checkout
  const total = Math.max(0, subtotal - discount + shippingFee);

  const applyCouponCode = async (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    // Validate locally first
    const found = INITIAL_COUPONS.find((c) => c.code === cleanCode && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or inactive promo code' };
    }
    if (subtotal < found.minOrderAmount) {
      return {
        success: false,
        message: `Cart total must be at least ₹${found.minOrderAmount} to apply ${cleanCode}`,
      };
    }
    setAppliedCoupon(found);
    showToast(`Code ${cleanCode} applied!`, 'success');
    return { success: true, message: `Coupon ${cleanCode} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Auth
  const login = async (email: string, pass: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const user = INITIAL_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: 'Account not found with this email' };
    }
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}`, 'success');
    return { success: true };
  };

  const register = async (name: string, email: string, phone?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: cleanEmail,
      phone,
      role: 'customer',
      savedAddresses: [],
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    showToast(`Account created! Welcome to SMART BUY, ${name}`, 'success');
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('You have been signed out', 'info');
  };

  const quickSwitchUser = (_type?: 'customer') => {
    setCurrentUser(INITIAL_USERS[1] || INITIAL_USERS[0]);
    showToast('Signed in as Demo Customer (Rahul Sharma)', 'info');
  };

  // Orders
  const createOrder = async (orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: Address;
    paymentMethod: 'razorpay' | 'cod' | 'upi' | 'card' | 'netbanking';
    paymentId?: string;
  }) => {
    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty' };
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          userId: currentUser?.id || 'guest',
          items: cart.map((item) => ({
            productId: item.productId,
            name: item.name,
            size: item.size,
            color: item.color,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          couponCode: appliedCoupon?.code,
        }),
      });

      if (response.ok) {
        const newOrder: Order = await response.json();
        setOrders((prev) => [newOrder, ...prev]);
        clearCart();
        showToast(`Order ${newOrder.orderNumber} confirmed!`, 'success');
        return { success: true, order: newOrder };
      }
    } catch {
      // Offline fallback
    }

    // Client-side fallback if server fetch is unavailable
    const fallbackOrderId = `ord-${Date.now().toString().slice(-6)}`;
    const fallbackOrderNumber = `SB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFallbackOrder: Order = {
      id: fallbackOrderId,
      orderNumber: fallbackOrderNumber,
      userId: currentUser?.id || 'guest',
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      shippingAddress: orderData.shippingAddress,
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        size: item.size,
        color: item.color,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      subtotal,
      discount,
      couponCode: appliedCoupon?.code,
      shippingFee,
      codFee: orderData.paymentMethod === 'cod' ? settings.codFee : 0,
      total: total + (orderData.paymentMethod === 'cod' ? settings.codFee : 0),
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentId: orderData.paymentId || `pay_sim_${Date.now()}`,
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
          description: 'Payment authorized and verified.',
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
        },
        {
          status: 'confirmed',
          title: 'Confirmed by Fulfillment Team',
          description: 'Allocated at Bengaluru Hub.',
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
        },
      ],
    };

    setOrders((prev) => [newFallbackOrder, ...prev]);
    clearCart();
    showToast(`Order ${newFallbackOrder.orderNumber} confirmed!`, 'success');
    return { success: true, order: newFallbackOrder };
  };

  const cancelOrder = async (orderId: string, reason?: string) => {
    try {
      await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    } catch {
      // continue
    }
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'cancelled',
            trackingHistory: [
              ...o.trackingHistory,
              {
                status: 'cancelled',
                title: 'Order Cancelled',
                description: reason || 'Customer requested cancellation.',
                timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
              },
            ],
          };
        }
        return o;
      })
    );
    showToast('Order has been cancelled', 'info');
    return { success: true };
  };

  const requestReturn = async (orderId: string, reason: string) => {
    try {
      await fetch(`/api/orders/${orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    } catch {
      // continue
    }
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'return_requested',
            returnReason: reason,
            returnStatus: 'pending',
            trackingHistory: [
              ...o.trackingHistory,
              {
                status: 'return_requested',
                title: 'Return Request Received',
                description: `Reason: ${reason}. Doorstep reverse pickup will be scheduled.`,
                timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
              },
            ],
          };
        }
        return o;
      })
    );
    showToast('Return request submitted for processing', 'success');
    return { success: true };
  };

  const openQuickView = (product: Product) => setQuickViewProduct(product);
  const closeQuickView = () => setQuickViewProduct(null);

  const openSizeGuide = () => setIsSizeGuideOpen(true);
  const closeSizeGuide = () => setIsSizeGuideOpen(false);

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showToast('Product removed from catalog', 'info');
        return true;
      }
    } catch {
      // client-side fallback
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Product removed from catalog', 'info');
    return true;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        isLoadingProducts,
        cart,
        cartCount,
        subtotal,
        discount,
        shippingFee,
        codFee,
        total,
        appliedCoupon,
        addToCart,
        addBundleToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyCouponCode,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        currentUser,
        login,
        register,
        logout,
        quickSwitchUser,
        orders,
        createOrder,
        cancelOrder,
        requestReturn,
        formatINR,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        isSizeGuideOpen,
        openSizeGuide,
        closeSizeGuide,
        toasts,
        showToast,
        settings,
        refreshProducts,
        deleteProduct,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
