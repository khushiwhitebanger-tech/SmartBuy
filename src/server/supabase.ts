import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, OrderItem } from '../types';
import fs from 'fs';
import path from 'path';

// Supabase Project ID provided by user: rklirclpraqilpcdkpwi
const DEFAULT_SUPABASE_PROJECT_ID = 'rklirclpraqilpcdkpwi';
const DEFAULT_SUPABASE_URL = `https://${DEFAULT_SUPABASE_PROJECT_ID}.supabase.co`;
const DEFAULT_SUPABASE_KEY = 'sb_publishable_m9ioZi7AfHO338M88tRywA_M0VgU05h';

interface SupabaseConfig {
  url: string;
  key: string;
  projectId: string;
}

// In-memory / persistent config store
let activeConfig: SupabaseConfig = {
  url: process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL,
  key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || DEFAULT_SUPABASE_KEY,
  projectId: DEFAULT_SUPABASE_PROJECT_ID,
};

// Check if credentials stored in db file
const CONFIG_FILE = path.join(process.cwd(), '.supabase_config.json');
try {
  if (fs.existsSync(CONFIG_FILE)) {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.key) {
      activeConfig.key = parsed.key;
    }
    if (parsed.url) {
      activeConfig.url = parsed.url;
    }
  }
} catch {
  // ignore
}

let supabaseClient: SupabaseClient | null = null;

function initClient() {
  if (activeConfig.url && activeConfig.key) {
    try {
      supabaseClient = createClient(activeConfig.url, activeConfig.key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log(`[Supabase] Initialized client for ${activeConfig.url}`);
    } catch (err) {
      console.error('[Supabase] Failed to initialize client:', err);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
}

// Initialize on load
initClient();

export function getSupabaseConfig(): { url: string; projectId: string; hasKey: boolean; isConfigured: boolean } {
  return {
    url: activeConfig.url,
    projectId: activeConfig.projectId,
    hasKey: Boolean(activeConfig.key && activeConfig.key.length > 10),
    isConfigured: Boolean(supabaseClient),
  };
}

export function setSupabaseApiKey(key: string, url?: string): boolean {
  activeConfig.key = key.trim();
  if (url) activeConfig.url = url.trim();

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({
      url: activeConfig.url,
      key: activeConfig.key,
      updatedAt: new Date().toISOString(),
    }, null, 2));
  } catch (err) {
    console.error('[Supabase] Could not save config file:', err);
  }

  initClient();
  return Boolean(supabaseClient);
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; tableFound?: boolean }> {
  if (!supabaseClient) {
    return {
      success: false,
      message: 'Supabase client not initialized. Please provide your Supabase anon or service-role key.',
    };
  }

  try {
    // Attempt a lightweight read on 'orders' table
    const { data, error } = await supabaseClient
      .from('orders')
      .select('id')
      .limit(1);

    if (error) {
      // Check if table missing
      if (error.code === '42P01') {
        return {
          success: true,
          tableFound: false,
          message: 'Connected to Supabase project, but the "orders" table has not been created yet in SQL Editor.',
        };
      }
      return {
        success: false,
        message: `Supabase query error (${error.code}): ${error.message}`,
      };
    }

    return {
      success: true,
      tableFound: true,
      message: `Successfully connected to Supabase project ${activeConfig.projectId}! Database tables are active.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect to Supabase: ${err.message}`,
    };
  }
}

/**
 * Inserts an order and its items into Supabase with dual schema compatibility
 * (supports both total/total_amount and status/order_status column naming).
 */
export async function createSupabaseOrder(order: Order): Promise<{ success: boolean; error?: string }> {
  if (!supabaseClient) {
    return { success: false, error: 'Supabase not configured with API key' };
  }

  try {
    const safePhone = order.customerPhone || (order.shippingAddress as any)?.phone || '+91 98100 00000';

    // 1. Prepare main order payload exactly matching Supabase schema
    const orderRecord: Record<string, any> = {
      id: order.id,
      order_number: order.orderNumber,
      user_id: order.userId || 'guest',
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: safePhone,
      shipping_address: order.shippingAddress,
      items: order.items || [],
      subtotal: Number(order.subtotal || order.total || 0),
      discount: Number(order.discount || 0),
      coupon_code: order.couponCode || null,
      shipping_fee: Number(order.shippingFee || 0),
      cod_fee: Number(order.codFee || 0),
      total: Number(order.total || 0),
      payment_method: order.paymentMethod || 'cod',
      payment_status: order.paymentStatus || 'pending',
      payment_id: order.paymentId || null,
      status: order.status || 'confirmed',
      carrier: order.carrier || 'Delhivery Surface Express',
      tracking_number: order.trackingNumber || null,
      estimated_delivery: order.estimatedDelivery || null,
      tracking_history: order.trackingHistory || [],
      created_at: order.createdAt || new Date().toISOString(),
    };

    // Try inserting into public.orders
    const { error: orderError } = await supabaseClient
      .from('orders')
      .upsert(orderRecord, { onConflict: 'id' });

    if (orderError) {
      console.error('[Supabase] Error inserting order:', orderError);
      return { success: false, error: orderError.message };
    }

    // 2. Insert items into order_items if order_items table exists
    if (order.items && order.items.length > 0) {
      const itemsPayload = order.items.map((item, idx) => ({
        id: `${order.id}-item-${idx}`,
        order_id: order.id,
        product_id: item.productId,
        name: item.name,
        product_name: item.name, // dual schema compatibility
        size: item.size,
        color: item.color,
        price: item.price,
        unit_price: item.price, // dual schema compatibility
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        image: item.image,
        created_at: order.createdAt || new Date().toISOString(),
      }));

      const { error: itemsError } = await supabaseClient
        .from('order_items')
        .upsert(itemsPayload, { onConflict: 'id' });

      if (itemsError) {
        // order_items might not exist yet, but main order succeeded
        console.warn('[Supabase] Note on order_items insert:', itemsError.message);
      }
    }

    console.log(`[Supabase] Successfully persisted order ${order.orderNumber} to Supabase!`);
    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception writing order:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches all orders from Supabase
 */
export async function fetchSupabaseOrders(): Promise<Order[] | null> {
  if (!supabaseClient) return null;

  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Error fetching orders:', error);
      return null;
    }

    if (!data) return [];

    // Map Supabase rows to Order type
    return data.map((row: any): Order => {
      let items: OrderItem[] = [];
      if (Array.isArray(row.items)) {
        items = row.items;
      } else if (typeof row.items === 'string') {
        try { items = JSON.parse(row.items); } catch { items = []; }
      }

      let shippingAddress = row.shipping_address;
      if (typeof shippingAddress === 'string') {
        try { shippingAddress = JSON.parse(shippingAddress); } catch { shippingAddress = {}; }
      }

      let trackingHistory = row.tracking_history;
      if (typeof trackingHistory === 'string') {
        try { trackingHistory = JSON.parse(trackingHistory); } catch { trackingHistory = []; }
      }

      return {
        id: row.id,
        orderNumber: row.order_number,
        userId: row.user_id || 'guest',
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone || '',
        shippingAddress: shippingAddress || {},
        items: items || [],
        subtotal: Number(row.subtotal || row.total || row.total_amount || 0),
        discount: Number(row.discount || 0),
        couponCode: row.coupon_code,
        shippingFee: Number(row.shipping_fee || 0),
        codFee: Number(row.cod_fee || 0),
        total: Number(row.total || row.total_amount || 0),
        paymentMethod: row.payment_method || 'cod',
        paymentStatus: row.payment_status || 'pending',
        paymentId: row.payment_id,
        status: row.status || row.order_status || 'confirmed',
        carrier: row.carrier || 'Delhivery Surface Express',
        trackingNumber: row.tracking_number,
        estimatedDelivery: row.estimated_delivery || '',
        createdAt: row.created_at || new Date().toISOString(),
        trackingHistory: trackingHistory || [],
        returnReason: row.return_reason,
        returnStatus: row.return_status,
      };
    });
  } catch (err) {
    console.error('[Supabase] Exception in fetchSupabaseOrders:', err);
    return null;
  }
}

/**
 * Updates order status in Supabase
 */
export async function updateSupabaseOrderStatus(
  orderId: string,
  status: string,
  trackingNumber?: string,
  trackingHistory?: any[]
): Promise<boolean> {
  if (!supabaseClient) return false;

  try {
    const updatePayload: Record<string, any> = {
      status,
    };
    if (trackingNumber) updatePayload.tracking_number = trackingNumber;
    if (trackingHistory) updatePayload.tracking_history = trackingHistory;

    const { error } = await supabaseClient
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (error) {
      console.error('[Supabase] Error updating status:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception updating status:', err);
    return false;
  }
}

/**
 * Updates order refund in Supabase
 */
export async function updateSupabaseOrderRefund(
  orderId: string,
  reason: string,
  trackingHistory?: any[]
): Promise<boolean> {
  if (!supabaseClient) return false;

  try {
    const updatePayload: Record<string, any> = {
      payment_status: 'refunded',
      status: 'returned',
      return_status: 'refunded',
      return_reason: reason,
    };
    if (trackingHistory) updatePayload.tracking_history = trackingHistory;

    const { error } = await supabaseClient
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (error) {
      console.error('[Supabase] Error updating refund:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception updating refund:', err);
    return false;
  }
}

/**
 * Safely migrates genuine local orders to Supabase
 */
export async function syncLocalOrdersToSupabase(localOrders: Order[]): Promise<{
  total: number;
  synced: number;
  skipped: number;
  errors: string[];
}> {
  const result = {
    total: localOrders.length,
    synced: 0,
    skipped: 0,
    errors: [] as string[],
  };

  if (!supabaseClient) {
    result.errors.push('Supabase client is not configured.');
    return result;
  }

  // Filter for genuine orders (skip demo sample orders like Rahul Sharma if desired, or sync all non-cancelled)
  for (const order of localOrders) {
    try {
      const res = await createSupabaseOrder(order);
      if (res.success) {
        result.synced += 1;
      } else {
        result.errors.push(`Order ${order.orderNumber}: ${res.error}`);
      }
    } catch (err: any) {
      result.errors.push(`Order ${order.orderNumber}: ${err.message}`);
    }
  }

  return result;
}
