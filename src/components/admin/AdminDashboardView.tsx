import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStore } from '../../context/StoreContext';
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Users,
  DollarSign,
  Package,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Boxes,
} from 'lucide-react';
import { Product, Order } from '../../types';

interface DashboardData {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    pendingFulfillment: number;
    totalCustomers: number;
    avgOrderValue: number;
    totalDiscountsGiven: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalCatalogSKUs: number;
  };
  ordersByStatus: Record<string, number>;
  deptSales: Record<string, number>;
  salesChart: { day: string; revenue: number; orders: number }[];
  recentOrders: Order[];
  lowStockProducts: Product[];
  auditLogs: { id: string; action: string; adminName: string; details: string; timestamp: string }[];
}

interface AdminDashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onSelectOrder?: (order: Order) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigateTab, onSelectOrder }) => {
  const { getAuthHeaders, adminUser, hasPermission } = useAdminAuth();
  const { formatINR } = useStore();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestocking, setIsRestocking] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/analytics', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleQuickRestock = async (productId: string, currentStock: number) => {
    setIsRestocking(productId);
    try {
      const res = await fetch(`/api/admin/inventory/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ newStock: currentStock + 20 }),
      });
      if (res.ok) {
        await fetchAnalytics();
      }
    } finally {
      setIsRestocking(null);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-[#E8E1D9]" />
          ))}
        </div>
        <div className="h-80 bg-white rounded-2xl border border-[#E8E1D9]" />
      </div>
    );
  }

  const { kpis, salesChart, recentOrders, lowStockProducts, auditLogs, ordersByStatus } = data;
  const maxRevenue = Math.max(...salesChart.map((d) => d.revenue), 1);

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E1D9] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#30372B]">
              Store Active · Production Gateway
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-[#252522] mt-1">
            Welcome back, {adminUser?.name.split(' ')[0]}
          </h2>
          <p className="text-xs text-[#77736D] mt-0.5">
            Role: <strong className="text-[#30372B] uppercase">{adminUser?.role.replace('_', ' ')}</strong> · All systems operational at Bengaluru Fulfillment Hub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="p-2.5 bg-[#F7F3EE] hover:bg-[#E8E1D9] text-[#252522] rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {hasPermission('manage_products') && (
            <button
              onClick={() => onNavigateTab('products')}
              className="py-2.5 px-4 bg-[#171715] hover:bg-[#30372B] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Manage Catalog</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sales */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8E1D9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#77736D] uppercase tracking-wider">Gross Sales</span>
            <div className="p-2 bg-[#30372B]/10 text-[#30372B] rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#252522]">
              {formatINR(kpis.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-mono mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last week</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8E1D9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#77736D] uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#252522]">
              {kpis.totalOrders}
            </div>
            <div className="text-[11px] text-[#77736D] font-mono mt-1">
              {kpis.pendingFulfillment} pending fulfillment
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8E1D9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#77736D] uppercase tracking-wider">Avg Order Value</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#252522]">
              {formatINR(kpis.avgOrderValue)}
            </div>
            <div className="text-[11px] text-[#77736D] font-mono mt-1">
              Across {kpis.totalOrders} orders
            </div>
          </div>
        </div>

        {/* Inventory Health */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8E1D9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#77736D] uppercase tracking-wider">Inventory Health</span>
            <div className={`p-2 rounded-xl ${kpis.lowStockCount > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#252522]">
              {kpis.totalCatalogSKUs} <span className="text-xs text-[#77736D] font-normal">Styles</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono mt-1">
              {kpis.lowStockCount > 0 ? (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {kpis.lowStockCount} styles low stock
                </span>
              ) : (
                <span className="text-emerald-700">All stock optimal</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Fulfillment Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Trend Chart (7 days) */}
        <div className="lg:col-span-8 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-[#252522]">Sales Velocity (7 Days)</h3>
              <p className="text-xs text-[#77736D]">Daily gross revenue performance and transaction density</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#30372B] bg-[#F7F3EE] px-3 py-1 rounded-lg">
              INR (₹) Volume
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-[#E8E1D9] pb-4">
            {salesChart.map((col, idx) => {
              const heightPct = Math.max(15, Math.round((col.revenue / maxRevenue) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-[#171715] text-white text-[10px] font-mono px-2 py-1 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    {formatINR(col.revenue)} ({col.orders} orders)
                  </div>
                  <div
                    className="w-full bg-[#171715] hover:bg-[#30372B] rounded-t-lg transition-all duration-300 relative group-hover:shadow-md"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[11px] font-mono text-[#77736D] font-medium">{col.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 text-xs text-[#77736D]">
            <span>Active Discounting Impact: {formatINR(kpis.totalDiscountsGiven)}</span>
            <span className="font-mono text-[#30372B] font-semibold">Total Revenue Tracked: {formatINR(kpis.totalRevenue)}</span>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="lg:col-span-4 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E1D9] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-[#252522]">Order Pipeline</h3>
            <p className="text-xs text-[#77736D] mb-5">Fulfillment status distribution</p>

            <div className="space-y-3.5">
              {[
                { key: 'placed', label: 'Placed / Verification', color: 'bg-amber-500' },
                { key: 'confirmed', label: 'Confirmed by Warehouse', color: 'bg-blue-500' },
                { key: 'processing', label: 'Packed & Picked', color: 'bg-indigo-500' },
                { key: 'shipped', label: 'In Transit (Delhivery)', color: 'bg-purple-500' },
                { key: 'delivered', label: 'Delivered Successfully', color: 'bg-emerald-500' },
                { key: 'return_requested', label: 'Return Initiated', color: 'bg-rose-500' },
              ].map(({ key, label, color }) => {
                const count = ordersByStatus[key] || 0;
                const total = kpis.totalOrders || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-[#252522]">{label}</span>
                      <span className="font-mono font-bold text-[#77736D]">{count}</span>
                    </div>
                    <div className="w-full bg-[#F7F3EE] h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('orders')}
            className="w-full mt-6 py-2.5 px-4 bg-[#F7F3EE] hover:bg-[#E8E1D9] text-[#171715] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View All Orders Pipeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Low Stock Warnings Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-base text-[#252522]">
                Low Stock Threshold Alerts ({lowStockProducts.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-bold text-[#30372B] hover:underline flex items-center gap-1 font-mono"
            >
              <span>Manage Full Inventory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3 bg-[#F7F3EE] rounded-xl border border-[#E8E1D9]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={prod.colors[0]?.image || prod.images[0]}
                    alt={prod.name}
                    className="w-12 h-12 object-cover rounded-lg bg-white border border-[#E8E1D9]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#252522] line-clamp-1">{prod.name}</h4>
                    <span className="text-[11px] font-mono text-red-600 font-semibold">
                      {prod.totalStock === 0 ? 'Out of Stock' : `${prod.totalStock} units left`}
                    </span>
                  </div>
                </div>

                {hasPermission('manage_inventory') && (
                  <button
                    onClick={() => handleQuickRestock(prod.id, prod.totalStock)}
                    disabled={isRestocking === prod.id}
                    className="py-1 px-2.5 bg-[#171715] hover:bg-[#30372B] text-white rounded-lg text-[10px] font-mono font-bold transition-all disabled:opacity-50"
                  >
                    {isRestocking === prod.id ? 'Restocking...' : '+20 Stock'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Row: Recent Orders & Security Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-[#252522]">Recent Orders</h3>
              <p className="text-xs text-[#77736D]">Latest transactions placed on SMART BUY</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#30372B] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F3EE] text-[#77736D] uppercase font-mono text-[10px] tracking-wider border-b border-[#E8E1D9]">
                <tr>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9]">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F7F3EE]/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#252522]">{ord.orderNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#252522]">{ord.customerName}</div>
                      <div className="text-[10px] text-[#77736D]">{ord.shippingAddress.city}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">{formatINR(ord.total)}</td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-100 text-[#171715]">
                        {ord.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          if (onSelectOrder) onSelectOrder(ord);
                          onNavigateTab('orders');
                        }}
                        className="text-[#30372B] hover:text-[#171715] font-semibold text-xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Audit Log Feed */}
        <div className="lg:col-span-4 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-display font-bold text-base text-[#252522]">Security Audit Log</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Immutable
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-2.5 bg-[#F7F3EE] rounded-xl text-xs border border-[#E8E1D9]">
                <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                  <span className="font-bold text-[#30372B]">{log.action}</span>
                  <span className="text-[#77736D]">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[#252522] leading-tight text-[11px]">{log.details}</p>
                <div className="text-[10px] text-[#77736D] mt-1">Initiator: {log.adminName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
