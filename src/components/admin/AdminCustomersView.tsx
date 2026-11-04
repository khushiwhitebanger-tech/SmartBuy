import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStore } from '../../context/StoreContext';
import { Users, Search, Mail, Phone, MapPin, Calendar, ShoppingBag, DollarSign, X } from 'lucide-react';

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  totalOrders: number;
  totalSpent: number;
  city: string;
  lastOrderDate: string;
  memberSince: string;
}

export const AdminCustomersView: React.FC = () => {
  const { getAuthHeaders } = useAdminAuth();
  const { formatINR } = useStore();

  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/customers', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setCustomers(json);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E1D9] shadow-xs">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#252522]">Customer Intelligence</h2>
          <p className="text-xs text-[#77736D] mt-0.5">
            Profiles, order frequency, total lifetime value (LTV), and contact directories
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#77736D] bg-[#F7F3EE] px-3.5 py-1.5 rounded-xl border border-[#E8E1D9]">
          <span>Verified Accounts:</span>
          <strong className="text-[#252522]">{customers.length}</strong>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8E1D9] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-[#77736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F3EE]/60 border border-[#D8C7B5] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#30372B]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#77736D] animate-pulse">Loading customer profiles...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736D]">No customer accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F3EE] text-[#77736D] uppercase font-mono text-[10px] tracking-wider border-b border-[#E8E1D9]">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Orders Placed</th>
                  <th className="py-3 px-4">Total Spend (LTV)</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9]">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-[#F7F3EE]/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#252522]">{c.name}</div>
                      <div className="text-[10px] font-mono text-[#77736D]">{c.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#252522]">{c.email}</div>
                      <div className="text-[10px] font-mono text-[#77736D]">{c.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#252522]">{c.city}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#30372B]">
                      {c.totalOrders} order{c.totalOrders === 1 ? '' : 's'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {formatINR(c.totalSpent)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#77736D]">
                      {new Date(c.memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c);
                        }}
                        className="py-1 px-3 bg-[#F7F3EE] hover:bg-[#E8E1D9] text-[#252522] rounded-lg font-semibold text-xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C7B5]/40 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D9] mb-4">
              <h3 className="font-display font-extrabold text-xl text-[#252522]">Customer Profile</h3>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded-lg hover:bg-neutral-100">
                <X className="w-5 h-5 text-[#77736D]" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F7F3EE] rounded-2xl border border-[#E8E1D9]">
                <div className="text-lg font-bold text-[#252522]">{selectedCustomer.name}</div>
                <div className="text-[#77736D] mt-1">{selectedCustomer.email}</div>
                <div className="text-[#77736D] font-mono">{selectedCustomer.phone}</div>
                <div className="text-[#30372B] font-semibold mt-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedCustomer.city}, India</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-[#E8E1D9]">
                  <div className="text-[10px] font-mono text-[#77736D] uppercase">Orders Placed</div>
                  <div className="text-xl font-bold font-mono text-[#252522] mt-1">{selectedCustomer.totalOrders}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E8E1D9]">
                  <div className="text-[10px] font-mono text-[#77736D] uppercase">Lifetime Value</div>
                  <div className="text-xl font-bold font-mono text-emerald-800 mt-1">{formatINR(selectedCustomer.totalSpent)}</div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[#77736D] font-mono">
                Member Since: {new Date(selectedCustomer.memberSince).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
