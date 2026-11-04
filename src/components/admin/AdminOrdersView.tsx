import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import {
  ShoppingBag,
  Search,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Printer,
  X,
  CreditCard,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  FileText,
  Database,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface AdminOrdersViewProps {
  initialSelectedOrder?: Order | null;
}

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({ initialSelectedOrder }) => {
  const { getAuthHeaders, hasPermission } = useAdminAuth();
  const { formatINR, showToast } = useStore();

  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(initialSelectedOrder || null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<OrderStatus>('shipped');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [statusNoteInput, setStatusNoteInput] = useState('');
  const [refundAmountInput, setRefundAmountInput] = useState('');
  const [refundReasonInput, setRefundReasonInput] = useState('Customer Return Approved');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Supabase Sync States
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [sqlContent, setSqlContent] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/orders', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setOrdersList(json);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupabaseStatus = async () => {
    try {
      const res = await fetch('/api/admin/supabase/status', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(data);
      }
    } catch {
      // ignore
    }
  };

  const handleSyncToSupabase = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/admin/supabase/sync', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully synchronized ${data.syncedCount} orders to Supabase!`, 'success');
        await fetchOrders();
        await fetchSupabaseStatus();
      } else {
        showToast(data.errors?.[0] || 'Sync incomplete. Please check API Key in Settings.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadSql = async () => {
    try {
      const res = await fetch('/api/admin/supabase/sql', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSqlContent(data.sql);
      }
    } catch {
      // ignore
    }
    setShowSqlModal(true);
  };

  useEffect(() => {
    fetchOrders();
    fetchSupabaseStatus();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          status: targetStatus,
          trackingNumber: trackingNumberInput || selectedOrder.trackingNumber,
          note: statusNoteInput || undefined,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        showToast(`Order ${updated.orderNumber} updated to ${targetStatus}`, 'success');
        setSelectedOrder(updated);
        setIsUpdateModalOpen(false);
        await fetchOrders();
      } else {
        showToast('Failed to update order status', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          refundAmount: Number(refundAmountInput) || selectedOrder.total,
          reason: refundReasonInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.message, 'success');
        setSelectedOrder(data.order);
        setIsRefundModalOpen(false);
        await fetchOrders();
      } else {
        showToast('Failed to process refund', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = ordersList.filter((o) => {
    const matchesSearch =
      !searchQuery ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);

    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = o.status === 'placed' || o.status === 'confirmed';
    } else if (statusFilter === 'transit') {
      matchesStatus = o.status === 'processing' || o.status === 'shipped' || o.status === 'out_for_delivery';
    } else if (statusFilter === 'delivered') {
      matchesStatus = o.status === 'delivered';
    } else if (statusFilter === 'returns') {
      matchesStatus = o.status === 'return_requested' || o.status === 'returned';
    } else if (statusFilter === 'cancelled') {
      matchesStatus = o.status === 'cancelled';
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E1D9] shadow-xs">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#252522]">Order Management</h2>
          <p className="text-xs text-[#77736D] mt-0.5">
            Real-time fulfillment tracking, carrier dispatches, status workflow, and customer returns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncToSupabase}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#30372B] text-white hover:bg-[#252b22] transition-colors cursor-pointer shadow-xs disabled:opacity-60"
            title="Push local orders and pull latest orders from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Supabase'}</span>
          </button>

          <div className="flex items-center gap-2 font-mono text-xs text-[#77736D] bg-[#F7F3EE] px-3.5 py-1.5 rounded-xl border border-[#E8E1D9]">
            <span>Orders Tracked:</span>
            <strong className="text-[#252522]">{ordersList.length}</strong>
          </div>
        </div>
      </div>

      {/* Supabase Synchronization Status Strip */}
      <div className="bg-[#171715] text-stone-200 p-4 rounded-2xl border border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Supabase Cloud Database</span>
              <span className="font-mono text-[11px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-md border border-stone-700">
                rklirclpraqilpcdkpwi
              </span>
              {supabaseStatus?.test?.success ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active & Synced
                </span>
              ) : supabaseStatus?.config?.hasKey ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Connecting / Table check
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-medium bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Key Required in Settings
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Every checkout order is mirrored directly to your Supabase tables (<code className="text-emerald-400">public.orders</code> and <code className="text-emerald-400">public.order_items</code>).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadSql}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-[#D8C7B5]" />
            <span>SQL Script</span>
          </button>
          <a
            href="https://supabase.com/dashboard/project/rklirclpraqilpcdkpwi"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors flex items-center gap-1.5"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-4 bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8E1D9] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending Fulfillment' },
            { id: 'transit', label: 'In Transit' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'returns', label: 'Returns & Refunds' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#171715] text-white shadow-xs'
                  : 'bg-[#F7F3EE] text-[#77736D] hover:text-[#171715]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#77736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order # (e.g. SB-2026-1042), Customer name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F3EE]/60 border border-[#D8C7B5] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#30372B]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#77736D] animate-pulse">Loading orders pipeline...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736D]">No orders match the selected filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F3EE] text-[#77736D] uppercase font-mono text-[10px] tracking-wider border-b border-[#E8E1D9]">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9]">
                {filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="hover:bg-[#F7F3EE]/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#252522]">{ord.orderNumber}</td>
                    <td className="py-3 px-4 text-[#77736D] font-mono text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#252522]">{ord.customerName}</div>
                      <div className="text-[10px] text-[#77736D] truncate max-w-[140px]">{ord.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#77736D]">
                      {ord.items.length} item{ord.items.length > 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#252522]">{formatINR(ord.total)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          ord.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.paymentStatus === 'refunded'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.paymentStatus} ({ord.paymentMethod})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`capitalize px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : ord.status === 'shipped' || ord.status === 'processing'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : ord.status === 'cancelled'
                            ? 'bg-neutral-100 text-neutral-600'
                            : ord.status === 'return_requested' || ord.status === 'returned'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {ord.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        className="py-1 px-3 bg-[#F7F3EE] hover:bg-[#E8E1D9] text-[#252522] font-semibold rounded-lg text-xs"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER DETAILS MODAL / DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C7B5]/40 text-left max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E8E1D9] mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-2xl text-[#252522]">
                    {selectedOrder.orderNumber}
                  </h3>
                  <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F7F3EE] text-[#30372B]">
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-[#77736D] mt-1 font-mono">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="p-2 text-[#77736D] hover:text-[#252522] hover:bg-neutral-100 rounded-xl transition-colors"
                  title="Print Packing Slip / Tax Invoice"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-neutral-100">
                  <X className="w-5 h-5 text-[#77736D]" />
                </button>
              </div>
            </div>

            {/* Quick Action Ribbon */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-[#F7F3EE] rounded-2xl mb-6 border border-[#E8E1D9]">
              {hasPermission('manage_orders') && (
                <button
                  onClick={() => {
                    setTargetStatus(selectedOrder.status);
                    setTrackingNumberInput(selectedOrder.trackingNumber || '');
                    setIsUpdateModalOpen(true);
                  }}
                  className="py-2 px-4 bg-[#171715] hover:bg-[#30372B] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Update Fulfillment Status</span>
                </button>
              )}

              {hasPermission('refund_orders') && selectedOrder.paymentStatus !== 'refunded' && (
                <button
                  onClick={() => {
                    setRefundAmountInput(String(selectedOrder.total));
                    setIsRefundModalOpen(true);
                  }}
                  className="py-2 px-4 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Process Refund</span>
                </button>
              )}

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="py-2 px-4 bg-white hover:bg-neutral-50 text-[#252522] border border-[#E8E1D9] rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#77736D]" />
                <span>Invoice / Slip</span>
              </button>
            </div>

            {/* Order Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
              {/* Customer & Shipping */}
              <div className="p-4 bg-[#F7F3EE]/50 rounded-2xl border border-[#E8E1D9] space-y-2">
                <div className="font-bold text-[#77736D] uppercase font-mono text-[10px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Shipping Address & Contact</span>
                </div>
                <div className="font-bold text-sm text-[#252522]">{selectedOrder.customerName}</div>
                <div className="text-[#77736D]">{selectedOrder.customerEmail} · {selectedOrder.customerPhone}</div>
                <div className="text-[#252522] mt-2 leading-relaxed">
                  {selectedOrder.shippingAddress.addressLine1}
                  {selectedOrder.shippingAddress.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                  <br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </div>
              </div>

              {/* Logistics & Payment */}
              <div className="p-4 bg-[#F7F3EE]/50 rounded-2xl border border-[#E8E1D9] space-y-2">
                <div className="font-bold text-[#77736D] uppercase font-mono text-[10px] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payment & Carrier Info</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#77736D]">Payment Gateway:</span>
                  <span className="font-mono font-bold capitalize text-[#252522]">
                    {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                  </span>
                </div>
                {selectedOrder.paymentId && (
                  <div className="flex justify-between">
                    <span className="text-[#77736D]">Transaction ID:</span>
                    <span className="font-mono text-[#252522]">{selectedOrder.paymentId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#77736D]">Carrier:</span>
                  <span className="font-semibold text-[#252522]">{selectedOrder.carrier || 'Delhivery Express'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#77736D]">AWB Tracking:</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {selectedOrder.trackingNumber || 'Pending AWB'}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items List */}
            <div className="mb-6">
              <h4 className="font-mono uppercase font-bold text-[11px] text-[#77736D] mb-3">
                Purchased Apparel ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-[#E8E1D9] border border-[#E8E1D9] rounded-2xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-white text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg bg-neutral-100 border border-[#E8E1D9]" />
                      <div>
                        <div className="font-bold text-[#252522]">{item.name}</div>
                        <div className="text-[#77736D] font-mono text-[11px] mt-0.5">
                          Size: <strong className="text-[#252522]">{item.size}</strong> · Color: <strong className="text-[#252522]">{item.color}</strong> · Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-[#252522]">
                      {formatINR(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-[#F7F3EE] rounded-2xl border border-[#E8E1D9] text-xs space-y-2 mb-6">
              <div className="flex justify-between text-[#77736D]">
                <span>Subtotal</span>
                <span className="font-mono">{formatINR(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({selectedOrder.couponCode || 'PROMO'})</span>
                  <span className="font-mono">- {formatINR(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#77736D]">
                <span>Shipping Fee</span>
                <span className="font-mono">{selectedOrder.shippingFee === 0 ? 'FREE' : formatINR(selectedOrder.shippingFee)}</span>
              </div>
              {selectedOrder.codFee > 0 && (
                <div className="flex justify-between text-[#77736D]">
                  <span>COD Handling</span>
                  <span className="font-mono">{formatINR(selectedOrder.codFee)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E8E1D9] flex justify-between font-bold text-sm text-[#252522]">
                <span>Total Amount Paid</span>
                <span className="font-mono text-base">{formatINR(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Tracking Events Timeline */}
            <div>
              <h4 className="font-mono uppercase font-bold text-[11px] text-[#77736D] mb-3">
                Tracking History & Audit Events
              </h4>
              <div className="space-y-3">
                {selectedOrder.trackingHistory.map((evt, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#171715] mt-1 shrink-0" />
                    <div className="flex-1 bg-[#F7F3EE]/60 p-2.5 rounded-xl border border-[#E8E1D9]">
                      <div className="flex items-center justify-between font-mono text-[10px] text-[#77736D]">
                        <span className="font-bold text-[#252522]">{evt.title}</span>
                        <span>{evt.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#77736D] mt-0.5">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {isUpdateModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C7B5]/40 text-left">
            <h3 className="font-display font-extrabold text-xl text-[#252522] mb-1">
              Update Order Status
            </h3>
            <p className="text-xs text-[#77736D] mb-4">Order: {selectedOrder.orderNumber}</p>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">New Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as OrderStatus)}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl font-medium"
                >
                  <option value="confirmed">Confirmed by Fulfillment</option>
                  <option value="processing">Packed & Ready to Dispatch</option>
                  <option value="shipped">In Transit (Shipped)</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered to Customer</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned & Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Carrier Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. DEL-IND-94829182"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Fulfillment Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Handed over to Delhivery logistics rider"
                  value={statusNoteInput}
                  onChange={(e) => setStatusNoteInput(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="flex-1 py-2 px-4 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 bg-[#171715] hover:bg-[#30372B] text-white rounded-xl font-bold shadow-md"
                >
                  {isSubmitting ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROCESS REFUND MODAL */}
      {isRefundModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C7B5]/40 text-left">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="font-display font-extrabold text-xl text-[#252522]">
              Issue Customer Refund
            </h3>
            <p className="text-xs text-[#77736D] mt-1 mb-4">
              Order {selectedOrder.orderNumber} · Customer: {selectedOrder.customerName}
            </p>

            <form onSubmit={handleProcessRefund} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={refundAmountInput}
                  onChange={(e) => setRefundAmountInput(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl font-mono text-base font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Refund Reason</label>
                <select
                  value={refundReasonInput}
                  onChange={(e) => setRefundReasonInput(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl font-medium"
                >
                  <option value="Customer Return Approved">Customer Return Approved</option>
                  <option value="Size/Fit Exchange Adjustment">Size/Fit Exchange Adjustment</option>
                  <option value="Order Cancelled Prior to Dispatch">Order Cancelled Prior to Dispatch</option>
                  <option value="Damaged in Transit Reimbursement">Damaged in Transit Reimbursement</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="flex-1 py-2 px-4 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md"
                >
                  {isSubmitting ? 'Refunding...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE PACKING SLIP / TAX INVOICE MODAL */}
      {isPrintModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl border border-[#D8C7B5]/40 text-left max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-center pb-4 border-b border-[#E8E1D9] mb-6">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#171715]">SMART BUY</h2>
                <div className="text-[11px] font-mono text-[#77736D]">TAX INVOICE & DISPATCH SLIP</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-1.5 px-3.5 bg-[#171715] text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button onClick={() => setIsPrintModalOpen(false)} className="p-1 rounded-lg hover:bg-neutral-100">
                  <X className="w-5 h-5 text-[#77736D]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs mb-6">
              <div>
                <strong className="text-[10px] font-mono uppercase text-[#77736D] block mb-1">Billed & Shipped To:</strong>
                <div className="font-bold text-[#171715]">{selectedOrder.customerName}</div>
                <div>{selectedOrder.shippingAddress.addressLine1}</div>
                <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</div>
                <div>Phone: {selectedOrder.customerPhone}</div>
              </div>
              <div className="text-right">
                <strong className="text-[10px] font-mono uppercase text-[#77736D] block mb-1">Invoice Details:</strong>
                <div className="font-mono font-bold text-[#171715]">{selectedOrder.orderNumber}</div>
                <div className="text-[#77736D] font-mono">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}</div>
                <div className="text-[#77736D]">Delhivery AWB: {selectedOrder.trackingNumber || 'PENDING'}</div>
                <div className="text-[#77736D]">Payment: {selectedOrder.paymentMethod.toUpperCase()} ({selectedOrder.paymentStatus.toUpperCase()})</div>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse mb-6">
              <thead>
                <tr className="bg-[#F7F3EE] border-y border-[#E8E1D9] font-mono text-[10px] uppercase text-[#77736D]">
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-3 text-center">Variant</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Price</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9]">
                {selectedOrder.items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-medium">{it.name}</td>
                    <td className="py-2 px-3 text-center font-mono">{it.size} / {it.color}</td>
                    <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatINR(it.price)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">{formatINR(it.price * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end text-xs mb-6">
              <div className="w-64 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatINR(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>- {formatINR(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{selectedOrder.shippingFee === 0 ? 'FREE' : formatINR(selectedOrder.shippingFee)}</span>
                </div>
                <div className="pt-2 border-t border-[#E8E1D9] flex justify-between font-bold text-sm text-[#171715]">
                  <span>Total Payable:</span>
                  <span>{formatINR(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E1D9] text-[10px] text-[#77736D] text-center font-mono">
              Thank you for choosing SMART BUY. For support, email care@smartbuy.in or call +91 1800-209-8899.
            </div>
          </div>
        </div>
      )}

      {/* Supabase SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-[#E8E1D9] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D9]">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#30372B]" />
                <h3 className="font-semibold text-base text-[#252522]">Supabase SQL Schema</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1 rounded-lg text-[#77736D] hover:text-[#252522] hover:bg-[#F7F3EE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#77736D] leading-relaxed">
              If your Supabase project (<strong>rklirclpraqilpcdkpwi</strong>) does not have the <code className="bg-[#F7F3EE] px-1 py-0.5 rounded text-[#252522]">orders</code> and <code className="bg-[#F7F3EE] px-1 py-0.5 rounded text-[#252522]">order_items</code> tables yet, paste and run this SQL query once in your <strong>Supabase SQL Editor</strong>:
            </p>

            <div className="relative">
              <pre className="p-4 bg-[#171715] text-[#D8C7B5] rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed border border-stone-800">
                {sqlContent || 'Loading SQL schema...'}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sqlContent);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2500);
                }}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium border border-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-300" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://supabase.com/dashboard/project/rklirclpraqilpcdkpwi/sql"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#30372B] hover:underline flex items-center gap-1"
              >
                <span>Open Supabase SQL Editor</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2 rounded-xl bg-[#30372B] text-white text-xs font-semibold hover:bg-[#252b22] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
