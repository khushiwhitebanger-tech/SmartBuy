import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStore } from '../../context/StoreContext';
import { Coupon } from '../../types';
import { Percent, Plus, Trash2, Check, X, Tag, AlertCircle } from 'lucide-react';

export const AdminCouponsView: React.FC = () => {
  const { getAuthHeaders, hasPermission } = useAdminAuth();
  const { formatINR, showToast } = useStore();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [value, setValue] = useState('15');
  const [minOrderAmount, setMinOrderAmount] = useState('1499');
  const [description, setDescription] = useState('Exclusive seasonal discount');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/coupons', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setCoupons(json);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (couponCode: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${couponCode}/toggle`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons((prev) =>
          prev.map((c) => (c.code === couponCode ? data.coupon : c))
        );
        showToast(`Coupon ${couponCode} status updated`, 'info');
      }
    } catch {
      showToast('Failed to toggle coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (couponCode: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${couponCode}?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${couponCode}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.code !== couponCode));
        showToast(`Coupon ${couponCode} deleted`, 'info');
      }
    } catch {
      showToast('Failed to delete coupon', 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          code,
          discountType,
          value: Number(value),
          minOrderAmount: Number(minOrderAmount),
          description,
        }),
      });

      if (res.ok) {
        showToast(`Coupon code ${code.toUpperCase()} published!`, 'success');
        setIsAddModalOpen(false);
        setCode('');
        await fetchCoupons();
      } else {
        showToast('Failed to create coupon', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E1D9] shadow-xs">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#252522]">Promotions & Coupon Codes</h2>
          <p className="text-xs text-[#77736D] mt-0.5">
            Configure checkout discount vouchers, min-order thresholds, and seasonal sales campaigns
          </p>
        </div>

        {hasPermission('manage_coupons') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-2.5 px-4 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Create Coupon</span>
          </button>
        )}
      </div>

      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#77736D] animate-pulse">Loading active promotions...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736D]">No coupons created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F3EE] text-[#77736D] uppercase font-mono text-[10px] tracking-wider border-b border-[#E8E1D9]">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Benefit</th>
                  <th className="py-3 px-4">Minimum Cart</th>
                  <th className="py-3 px-4">Terms / Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9]">
                {coupons.map((coupon) => (
                  <tr key={coupon.code} className="hover:bg-[#F7F3EE]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#30372B]" />
                        <span className="font-mono font-bold text-sm text-[#171715] tracking-wider">
                          {coupon.code}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {coupon.discountType === 'percentage' ? `${coupon.value}% OFF` : `Flat ${formatINR(coupon.value)} OFF`}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#252522]">
                      {coupon.minOrderAmount > 0 ? formatINR(coupon.minOrderAmount) : 'None'}
                    </td>
                    <td className="py-3.5 px-4 text-[#77736D] max-w-xs truncate">{coupon.description}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          coupon.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasPermission('manage_coupons') && (
                          <button
                            onClick={() => handleToggleActive(coupon.code)}
                            className={`py-1 px-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                              coupon.isActive
                                ? 'border-amber-300 text-amber-800 hover:bg-amber-50'
                                : 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                            }`}
                          >
                            {coupon.isActive ? 'Pause' : 'Activate'}
                          </button>
                        )}
                        {hasPermission('manage_coupons') && (
                          <button
                            onClick={() => handleDeleteCoupon(coupon.code)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE COUPON MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C7B5]/40 text-left">
            <h3 className="font-display font-extrabold text-xl text-[#252522] mb-1">Create Promo Code</h3>
            <p className="text-xs text-[#77736D] mb-4">Set up a voucher for customer checkout</p>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE25"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl font-mono uppercase text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl font-medium"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Minimum Cart Amount (₹)</label>
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Description / Customer Banner</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 15% off on orders above ₹1,499"
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 px-4 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 bg-[#171715] hover:bg-[#30372B] text-white rounded-xl font-bold shadow-md"
                >
                  {isSubmitting ? 'Creating...' : 'Activate Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
