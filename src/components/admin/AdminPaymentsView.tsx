import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStore } from '../../context/StoreContext';
import { PaymentTransaction } from '../../types';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  X,
  FileText,
} from 'lucide-react';

export const AdminPaymentsView: React.FC = () => {
  const { getAuthHeaders, hasPermission } = useAdminAuth();
  const { formatINR } = useStore();

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [refundReason, setRefundReason] = useState('Customer returned unworn merchandise within 14-day window');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/payments', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleReconcile = async (tx: PaymentTransaction) => {
    try {
      const res = await fetch(`/api/admin/payments/${tx.id}/reconcile`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Razorpay signature & payment status verified for ${tx.orderNumber}.`,
        });
        fetchPayments();
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleExecuteRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/orders/${selectedTx.orderId}/refund`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedTx.amount,
          reason: refundReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute refund');

      setNotification({
        type: 'success',
        message: `₹${selectedTx.amount} refund processed via Razorpay for ${selectedTx.orderNumber}. Audit log updated.`,
      });
      setIsRefundModalOpen(false);
      setSelectedTx(null);
      fetchPayments();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = transactions.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      return (
        t.orderNumber.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerEmail.toLowerCase().includes(q) ||
        (t.gatewayTransactionId && t.gatewayTransactionId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalCaptured = transactions
    .filter((t) => t.status === 'captured')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = transactions
    .filter((t) => t.status === 'refunded')
    .reduce((sum, t) => sum + (t.refundAmount || t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E1D9]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#252522]">Payment Reconciliation & Gateway Logs</h1>
          <p className="text-sm text-[#77736D] mt-1">
            Real-time Razorpay, UPI, Cards, and Cash-on-Delivery payment verifications and authorized refund audit trails.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E8E1D9] bg-white hover:bg-stone-50 text-[#252522] text-xs font-semibold shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Gateway</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#77736D] uppercase font-semibold">
            <span>Total Captured Volume</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-[#252522]">
            {formatINR(totalCaptured)}
          </div>
          <div className="mt-1 text-[11px] text-[#77736D]">
            Settled via Razorpay & verified orders
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#77736D] uppercase font-semibold">
            <span>Authorized Refunds</span>
            <RotateCcw className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-[#252522]">
            {formatINR(totalRefunded)}
          </div>
          <div className="mt-1 text-[11px] text-[#77736D]">
            Reverse settlement with verified audit log
          </div>
        </div>

        <div className="p-5 bg-[#171715] text-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#D8C7B5] uppercase font-semibold">
            <span>PCI-DSS & Security</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-sm font-semibold text-white">
            Server Signature Validated
          </div>
          <div className="mt-1 text-[11px] text-stone-400">
            No raw card details stored in accordance with RBI guidelines
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E8E1D9] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-[#FDFBF7]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#77736D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Razorpay Tx ID, or customer..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8E1D9] text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-[#30372B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#77736D]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E8E1D9] text-xs font-semibold bg-white text-[#252522]"
            >
              <option value="all">All Payment States</option>
              <option value="captured">Captured / Paid</option>
              <option value="pending">Pending (COD / Auth)</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E1D9] text-[11px] font-semibold text-[#77736D] uppercase tracking-wider bg-stone-50/60">
                <th className="py-3 px-5">Transaction / Order</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Method</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Gateway Reference</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D9] text-xs">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-[#252522] font-mono">{tx.orderNumber}</div>
                    <div className="text-[10px] text-[#77736D]">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="font-medium text-[#252522]">{tx.customerName}</div>
                    <div className="text-[11px] text-[#77736D] truncate">{tx.customerEmail}</div>
                  </td>

                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1 font-mono uppercase font-semibold text-[10px] px-2 py-0.5 rounded bg-stone-100 text-[#252522]">
                      <CreditCard className="w-3 h-3 text-[#77736D]" />
                      {tx.method}
                    </span>
                  </td>

                  <td className="py-4 px-5 font-bold text-[#252522]">
                    {formatINR(tx.amount)}
                  </td>

                  <td className="py-4 px-5 font-mono text-[11px] text-[#77736D] max-w-xs truncate">
                    {tx.gatewayTransactionId || 'N/A'}
                  </td>

                  <td className="py-4 px-5">
                    {tx.status === 'captured' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Captured
                      </span>
                    )}
                    {tx.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        Pending COD
                      </span>
                    )}
                    {tx.status === 'refunded' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        <RotateCcw className="w-3.5 h-3.5" />
                        Refunded
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleReconcile(tx)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#30372B] bg-[#F7F3EE] hover:bg-stone-200 rounded-lg transition-colors border border-[#E8E1D9]"
                        title="Verify Gateway Signature"
                      >
                        Reconcile
                      </button>

                      {tx.status === 'captured' && (
                        <button
                          onClick={() => {
                            setSelectedTx(tx);
                            setIsRefundModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authorized Refund Modal */}
      {isRefundModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D9]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#252522]">Authorize Refund</h3>
                  <p className="text-xs text-[#77736D]">Order: {selectedTx.orderNumber}</p>
                </div>
              </div>
              <button onClick={() => setIsRefundModalOpen(false)} className="text-stone-400 hover:text-[#252522] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteRefund} className="mt-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-[#E8E1D9] flex items-center justify-between">
                <span className="text-[#77736D]">Refund Amount</span>
                <span className="text-base font-bold text-[#252522]">{formatINR(selectedTx.amount)}</span>
              </div>

              <div>
                <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">
                  Reason for Refund (Recorded to Audit Trail)
                </label>
                <textarea
                  rows={3}
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D9]">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E1D9] text-[#77736D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Authorize Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
