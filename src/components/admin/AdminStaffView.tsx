import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminRole, AdminUser } from '../../types';
import {
  Users,
  ShieldCheck,
  UserPlus,
  KeyRound,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Mail,
  User,
  Phone,
  RefreshCw,
} from 'lucide-react';

export const AdminStaffView: React.FC = () => {
  const { getAuthHeaders, adminUser, hasPermission } = useAdminAuth();

  const [staffList, setStaffList] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AdminUser | null>(null);

  // Form State for New Staff
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('product_manager');
  const [newTempPassword, setNewTempPassword] = useState('');
  const [newMfa, setNewMfa] = useState(false);

  // Reset Password State
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/staff', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          role: newRole,
          temporaryPassword: newTempPassword || undefined,
          mfaEnabled: newMfa,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create staff');

      setNotification({
        type: 'success',
        message: `Staff member ${data.user.name} provisioned! Temporary password: ${data.temporaryPassword || newTempPassword}. Recovery key: ${data.recoveryCode}`,
      });
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewTempPassword('');
      fetchStaff();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (staff: AdminUser) => {
    try {
      const res = await fetch(`/api/admin/staff/${staff.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: staff.isActive === false ? true : false }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update staff');

      setNotification({
        type: 'success',
        message: `Updated account status for ${staff.name}`,
      });
      fetchStaff();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !resetPasswordValue) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/staff/${selectedStaff.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetPassword: resetPasswordValue }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setNotification({
        type: 'success',
        message: `Password reset successfully for ${selectedStaff.name}. They will be prompted to update it on next sign in.`,
      });
      setIsResetModalOpen(false);
      setResetPasswordValue('');
      setSelectedStaff(null);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staff: AdminUser) => {
    if (staff.email === 'khushiwhitebanger@gmail.com') {
      alert('The primary Super Admin account cannot be deleted.');
      return;
    }

    if (!confirm(`Are you sure you want to remove staff member ${staff.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/staff/${staff.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove staff');

      setNotification({ type: 'success', message: data.message });
      fetchStaff();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const roleBadges: Record<AdminRole, { label: string; bg: string; text: string }> = {
    super_admin: { label: 'Super Admin', bg: 'bg-emerald-100', text: 'text-emerald-900 border-emerald-200' },
    product_manager: { label: 'Product Manager', bg: 'bg-blue-100', text: 'text-blue-900 border-blue-200' },
    order_manager: { label: 'Order Manager', bg: 'bg-amber-100', text: 'text-amber-900 border-amber-200' },
    inventory_manager: { label: 'Inventory Lead', bg: 'bg-purple-100', text: 'text-purple-900 border-purple-200' },
    customer_support: { label: 'Customer Support', bg: 'bg-cyan-100', text: 'text-cyan-900 border-cyan-200' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E1D9]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#252522]">Staff Roles & Access Control</h1>
          <p className="text-sm text-[#77736D] mt-1">
            Manage authorized staff administrators, assign role permissions, and enforce enterprise authentication rules.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#30372B] hover:bg-[#252b22] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Staff</span>
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

      {/* Staff Directory Table */}
      <div className="bg-white rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8E1D9] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#30372B]" />
            <h2 className="text-sm font-semibold text-[#252522]">Authorized Administrators ({staffList.length})</h2>
          </div>
          <button
            onClick={fetchStaff}
            className="p-1.5 text-[#77736D] hover:text-[#252522] rounded-lg hover:bg-stone-100 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E1D9] text-[11px] font-semibold text-[#77736D] uppercase tracking-wider bg-stone-50/60">
                <th className="py-3 px-5">Staff Member</th>
                <th className="py-3 px-5">Assigned Role</th>
                <th className="py-3 px-5">2FA Status</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Last Login</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D9] text-xs">
              {staffList.map((member) => {
                const badge = roleBadges[member.role] || roleBadges.customer_support;
                const isPrimary = member.email === 'khushiwhitebanger@gmail.com';

                return (
                  <tr key={member.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#E8E1D9] shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-[#252522] flex items-center gap-2">
                            <span>{member.name}</span>
                            {isPrimary && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                                OWNER
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#77736D] font-mono">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      {member.mfaEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Enforced
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#77736D]">Standard</span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      {member.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-[#77736D] font-mono text-[11px]">
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStaff(member);
                            setResetPasswordValue('');
                            setIsResetModalOpen(true);
                          }}
                          className="p-1.5 text-[#77736D] hover:text-[#252522] rounded-lg hover:bg-stone-100 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {!isPrimary && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(member)}
                              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                                member.isActive !== false
                                  ? 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                              }`}
                            >
                              {member.isActive !== false ? 'Suspend' : 'Activate'}
                            </button>

                            <button
                              onClick={() => handleDeleteStaff(member)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D9]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#F7F3EE] text-[#30372B] flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#252522]">Provision Staff Account</h3>
                  <p className="text-xs text-[#77736D]">Assign credentials and granular permission roles</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-[#252522] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Vikram Sethi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Staff Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="vikram@smartbuy.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98100 00000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Role & Permissions</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm font-medium"
                >
                  <option value="product_manager">Product Manager (Catalog, Categories & Banners)</option>
                  <option value="order_manager">Order Manager (Fulfillment, Tracking & Refunds)</option>
                  <option value="inventory_manager">Inventory Lead (Variant Stock & Restock)</option>
                  <option value="customer_support">Customer Support (Orders & CRM)</option>
                  <option value="super_admin">Super Admin (Full Enterprise Access)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Temporary Password</label>
                <input
                  type="text"
                  value={newTempPassword}
                  onChange={(e) => setNewTempPassword(e.target.value)}
                  placeholder="Leave blank to auto-generate secure password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mfaCheckbox"
                  checked={newMfa}
                  onChange={(e) => setNewMfa(e.target.checked)}
                  className="rounded border-[#E8E1D9] text-[#30372B] focus:ring-[#30372B]"
                />
                <label htmlFor="mfaCheckbox" className="text-xs text-[#252522] font-medium cursor-pointer">
                  Require Two-Factor Authentication (MFA) for this account
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D9]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E1D9] text-[#77736D] hover:text-[#252522]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#30372B] hover:bg-[#252b22] text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Provision Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Staff Password Modal */}
      {isResetModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D9]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#252522]">Reset Password</h3>
                  <p className="text-xs text-[#77736D]">{selectedStaff.email}</p>
                </div>
              </div>
              <button onClick={() => setIsResetModalOpen(false)} className="text-stone-400 hover:text-[#252522] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  required
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D9]">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E1D9] text-[#77736D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#30372B] hover:bg-[#252b22] text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
