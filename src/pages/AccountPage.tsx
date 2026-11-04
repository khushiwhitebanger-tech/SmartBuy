import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { Package, MapPin, User, Heart, LogOut, Truck, AlertCircle, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface AccountPageProps {
  initialTab?: string;
  onNavigateToWishlist: () => void;
  onNavigateToShop: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  initialTab = 'orders',
  onNavigateToWishlist,
  onNavigateToShop,
}) => {
  const { currentUser, logout, orders, cancelOrder, requestReturn, formatINR, showToast, quickSwitchUser } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>(
    initialTab === 'profile' ? 'profile' : initialTab === 'addresses' ? 'addresses' : 'orders'
  );

  // Return modal state
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('Size/Fit adjustment');

  // Cancel order modal
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Changed my mind');

  const userOrders = currentUser
    ? orders.filter((o) => o.userId === currentUser.id || o.customerEmail === currentUser.email)
    : orders;

  const handleCancelSubmit = async () => {
    if (!cancelOrderId) return;
    await cancelOrder(cancelOrderId, cancelReason);
    setCancelOrderId(null);
  };

  const handleReturnSubmit = async () => {
    if (!returnOrderId) return;
    await requestReturn(returnOrderId, returnReason);
    setReturnOrderId(null);
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="font-display font-bold text-2xl text-[#171715]">Account Access Required</h2>
        <p className="text-xs text-[#77736D] mt-2 mb-6">Please log in to view your profile, orders, and addresses.</p>
        <button
          onClick={() => quickSwitchUser('customer')}
          className="py-3 px-6 bg-[#171715] text-white text-xs font-bold uppercase rounded-xl"
        >
          Sign In with Demo Customer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      {/* Header Profile Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-[#D8C7B5]/40 gap-4">
        <div>
          <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
            Customer Dashboard
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#171715] mt-0.5">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-[#77736D] mt-1 font-mono">
            {currentUser.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="py-2 px-3.5 bg-white border border-[#D8C7B5] hover:bg-neutral-50 text-[#77736D] hover:text-[#171715] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        {/* Left Navigation Tabs */}
        <aside className="lg:col-span-3 space-y-1 text-xs font-semibold text-[#77736D]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${
              activeTab === 'orders' ? 'bg-[#171715] text-white shadow-xs' : 'hover:bg-white text-[#171715]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Orders & Tracking</span>
            </div>
            <span className="font-mono text-[11px] opacity-80">{userOrders.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 w-full p-3 rounded-xl transition-all ${
              activeTab === 'profile' ? 'bg-[#171715] text-white shadow-xs' : 'hover:bg-white text-[#171715]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2.5 w-full p-3 rounded-xl transition-all ${
              activeTab === 'addresses' ? 'bg-[#171715] text-white shadow-xs' : 'hover:bg-white text-[#171715]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
          </button>

          <button
            onClick={onNavigateToWishlist}
            className="flex items-center gap-2.5 w-full p-3 rounded-xl hover:bg-white text-[#171715] transition-all"
          >
            <Heart className="w-4 h-4" />
            <span>My Wishlist</span>
          </button>
        </aside>

        {/* Right Content Panels */}
        <main className="lg:col-span-9">
          {/* TAB 1: ORDERS & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-[#171715]">
                  Order History & Live Delivery Status
                </h2>
                <button
                  onClick={onNavigateToShop}
                  className="text-xs font-bold text-[#171715] hover:underline"
                >
                  Shop More Pieces →
                </button>
              </div>

              {userOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-[#D8C7B5]/40">
                  <Package className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                  <h3 className="font-bold text-sm text-[#171715]">No orders found yet</h3>
                  <p className="text-xs text-[#77736D] mt-1 mb-4">When you place an order, live tracking will appear here.</p>
                  <button onClick={onNavigateToShop} className="py-2.5 px-6 bg-[#171715] text-white text-xs font-bold rounded-xl">
                    Discover Collection
                  </button>
                </div>
              ) : (
                userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl border border-[#D8C7B5]/40 overflow-hidden shadow-xs text-xs"
                  >
                    {/* Order Top Bar */}
                    <div className="p-4 sm:p-5 bg-[#F7F3EE]/60 border-b border-[#D8C7B5]/30 flex flex-wrap items-center justify-between gap-4 font-mono">
                      <div>
                        <span className="text-[10px] text-[#77736D] uppercase tracking-wider">ORDER NUMBER</span>
                        <p className="font-bold text-sm text-[#171715]">{ord.orderNumber}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#77736D] uppercase tracking-wider">DATE PLACED</span>
                        <p className="text-[#171715] font-medium">{new Date(ord.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#77736D] uppercase tracking-wider">TOTAL AMOUNT</span>
                        <p className="font-bold text-sm text-[#171715]">{formatINR(ord.total)}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#77736D] uppercase tracking-wider">STATUS</span>
                        <div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'shipped' || ord.status === 'out_for_delivery'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : ord.status === 'return_requested'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-[#D8C7B5]/40 text-[#171715]'
                            }`}
                          >
                            {ord.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-5 divide-y divide-[#D8C7B5]/20">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img src={it.image} alt={it.name} className="w-12 h-14 object-cover rounded-lg bg-neutral-100" />
                            <div>
                              <p className="font-semibold text-xs text-[#171715]">{it.name}</p>
                              <p className="text-[11px] text-[#77736D] font-mono">
                                Size: {it.size} · Color: {it.color} · Qty: {it.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-[#171715]">
                            {formatINR(it.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Timeline */}
                    <div className="px-5 py-4 bg-[#F7F3EE]/30 border-t border-[#D8C7B5]/30">
                      <div className="flex items-center justify-between text-xs mb-3 font-mono">
                        <div className="flex items-center gap-1.5 text-[#30372B] font-bold">
                          <Truck className="w-4 h-4" />
                          <span>Carrier: {ord.carrier} (AWB: {ord.trackingNumber})</span>
                        </div>
                        <span className="text-[#77736D]">Est. Delivery: {ord.estimatedDelivery}</span>
                      </div>

                      <div className="space-y-2 border-l-2 border-[#D8C7B5] pl-4 text-xs">
                        {ord.trackingHistory.slice(-3).map((event, eIdx) => (
                          <div key={eIdx} className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#30372B]" />
                            <p className="font-bold text-[#171715]">{event.title}</p>
                            <p className="text-[#77736D] text-[11px]">{event.description} · <span className="font-mono">{event.timestamp}</span></p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons for Order: Cancel or Return */}
                    <div className="p-4 bg-white border-t border-[#D8C7B5]/30 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-[#77736D] font-mono">
                        Shipping to {ord.shippingAddress.city}, {ord.shippingAddress.state} - {ord.shippingAddress.pincode}
                      </div>

                      <div className="flex items-center gap-2">
                        {ord.status === 'confirmed' && (
                          <button
                            onClick={() => setCancelOrderId(ord.id)}
                            className="py-1.5 px-3 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}

                        {ord.status === 'delivered' && (
                          <button
                            onClick={() => setReturnOrderId(ord.id)}
                            className="py-1.5 px-3 rounded-lg border border-[#D8C7B5] hover:bg-[#F7F3EE] text-[#171715] text-xs font-semibold transition-colors"
                          >
                            Request Return / Exchange
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D8C7B5]/40 space-y-6">
              <h2 className="font-display font-bold text-lg text-[#171715]">
                Personal Profile
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#171715] mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171715] mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    defaultValue={currentUser.email}
                    className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] font-medium opacity-70"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171715] mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    defaultValue={currentUser.phone || '+91 98201 12345'}
                    className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#D8C7B5]/30">
                <button
                  onClick={() => showToast('Profile details updated successfully', 'success')}
                  className="py-2.5 px-6 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase rounded-xl transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D8C7B5]/40 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-[#171715]">
                  Saved Indian Delivery Addresses
                </h2>
                <button
                  onClick={() => showToast('Address manager ready', 'info')}
                  className="py-1.5 px-3 bg-[#171715] text-white text-xs font-semibold rounded-lg"
                >
                  + Add New Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentUser.savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-xl border border-[#D8C7B5]/50 bg-[#F7F3EE]/40 text-xs space-y-1 relative"
                  >
                    {addr.isDefault && (
                      <span className="text-[10px] bg-[#30372B] text-white font-mono px-2 py-0.5 rounded font-bold uppercase mb-2 inline-block">
                        Default Delivery Address
                      </span>
                    )}
                    <p className="font-bold text-[#171715]">{addr.fullName}</p>
                    <p className="text-[#77736D]">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-[#77736D]">{addr.addressLine2}</p>}
                    <p className="text-[#77736D]">{addr.city}, {addr.state} - <span className="font-mono font-bold text-[#171715]">{addr.pincode}</span></p>
                    <p className="text-[#77736D] font-mono">Mobile: {addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Cancellation Modal */}
      {cancelOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 text-xs text-[#171715] shadow-2xl">
            <h3 className="font-display font-bold text-base mb-2">Cancel Order</h3>
            <p className="text-[#77736D] mb-4">Please specify the reason for cancelling this order.</p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] mb-4"
            >
              <option value="Changed my mind">Changed my mind</option>
              <option value="Incorrect size selected">Incorrect size selected</option>
              <option value="Need to change shipping address">Need to change shipping address</option>
              <option value="Found a better price">Found a better price</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCancelOrderId(null)}
                className="py-2 px-4 rounded-xl border border-[#D8C7B5] font-semibold"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelSubmit}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return & Refund Modal */}
      {returnOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 text-xs text-[#171715] shadow-2xl">
            <h3 className="font-display font-bold text-base mb-2">Initiate 14-Day Return / Exchange</h3>
            <p className="text-[#77736D] mb-4">
              Our courier will arrive for doorstep inspection and pickup. Refunds are issued within 24 hours of package collection.
            </p>

            <label className="block font-semibold mb-1">Reason for Return</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] mb-4"
            >
              <option value="Size/Fit too large">Size/Fit too large (Request size exchange)</option>
              <option value="Size/Fit too small">Size/Fit too small (Request size exchange)</option>
              <option value="Fabric/Color preference">Fabric/Color preference</option>
              <option value="Manufacturing defect">Manufacturing defect</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReturnOrderId(null)}
                className="py-2 px-4 rounded-xl border border-[#D8C7B5] font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnSubmit}
                className="py-2 px-4 rounded-xl bg-[#171715] text-white font-bold"
              >
                Schedule Doorstep Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
