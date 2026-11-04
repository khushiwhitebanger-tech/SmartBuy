import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PINCODE_DIRECTORY } from '../data/initialData';
import { ShieldCheck, Lock, CreditCard, Smartphone, Banknote, ArrowRight, Check, Tag } from 'lucide-react';
import { Order } from '../types';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order) => void;
  onNavigateToShop: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderSuccess, onNavigateToShop }) => {
  const { cart, subtotal, discount, shippingFee, total, appliedCoupon, formatINR, currentUser, createOrder, showToast } = useStore();

  // Step state (1: Address & Details, 2: Payment)
  const [step, setStep] = useState<1 | 2>(1);

  // Customer & Shipping Details
  const defaultAddress = currentUser?.savedAddresses?.[0];
  const [fullName, setFullName] = useState(currentUser?.name || defaultAddress?.fullName || 'Rahul Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'rahul.sharma@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || defaultAddress?.phone || '+91 98201 12345');
  const [addressLine1, setAddressLine1] = useState(defaultAddress?.addressLine1 || 'Flat 402, Sunshine Heights, Bandra West');
  const [addressLine2, setAddressLine2] = useState(defaultAddress?.addressLine2 || 'Near Hill Road');
  const [pincode, setPincode] = useState(defaultAddress?.pincode || '400050');
  const [city, setCity] = useState(defaultAddress?.city || 'Mumbai');
  const [state, setState] = useState(defaultAddress?.state || 'Maharashtra');
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'priority'>('standard');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'card' | 'cod'>('razorpay');
  const [upiId, setUpiId] = useState('rahul@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  // Delivery charge calculation
  const priorityFee = deliveryMethod === 'priority' ? 149 : 0;
  const codFee = paymentMethod === 'cod' ? 49 : 0;
  const finalPayable = total + priorityFee + codFee;

  // Auto-fill city and state on 6-digit PIN code entry
  const handlePincodeChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setPincode(cleaned);
    if (cleaned.length === 6 && PINCODE_DIRECTORY[cleaned]) {
      setCity(PINCODE_DIRECTORY[cleaned].city);
      setState(PINCODE_DIRECTORY[cleaned].state);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !addressLine1 || pincode.length !== 6 || !city || !state) {
      showToast('Please fill all required delivery address fields', 'error');
      return;
    }
    setStep(2);
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);

    const orderData = {
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: {
        id: `addr-${Date.now()}`,
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
      },
      paymentMethod,
      paymentId: paymentMethod === 'cod' ? undefined : `pay_rzp_${Date.now()}`,
    };

    const res = await createOrder(orderData);
    setIsProcessing(false);
    setShowRazorpayModal(false);

    if (res.success && res.order) {
      onOrderSuccess(res.order);
    } else {
      showToast(res.error || 'Payment authorization failed', 'error');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="font-display font-bold text-2xl text-[#171715]">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-[#77736D] mt-2 mb-6">Add items to your cart before proceeding to checkout.</p>
        <button
          onClick={onNavigateToShop}
          className="py-3 px-8 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase rounded-xl transition-colors"
        >
          Explore Minimal Essentials
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#D8C7B5]/40 mb-8">
        <div>
          <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
            Encrypted Transaction
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#171715] mt-0.5">
            Checkout
          </h1>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${step === 1 ? 'bg-[#171715] text-white font-bold' : 'bg-[#D8C7B5]/40 text-[#171715]'}`}>
            <span>1</span>
            <span className="hidden sm:inline">Address</span>
          </div>
          <span className="text-[#77736D]">→</span>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${step === 2 ? 'bg-[#171715] text-white font-bold' : 'bg-[#D8C7B5]/40 text-[#171715]'}`}>
            <span>2</span>
            <span className="hidden sm:inline">Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Step 1 or Step 2 */}
        <div className="lg:col-span-7">
          {step === 1 ? (
            /* STEP 1: Address & Shipping Form */
            <form onSubmit={handleProceedToPayment} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#D8C7B5]/40 shadow-xs">
              <div>
                <h3 className="font-display font-bold text-lg text-[#171715] mb-1">
                  1. Contact Information
                </h3>
                <p className="text-xs text-[#77736D]">Order confirmation and live SMS updates will be sent here.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171715] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] text-xs font-medium focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#171715] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] text-xs font-medium focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#171715] mb-1">Mobile Phone (for delivery coordination) *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98201 12345"
                      className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] text-xs font-medium focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="pt-6 border-t border-[#D8C7B5]/30">
                <h3 className="font-display font-bold text-lg text-[#171715] mb-1">
                  2. Indian Delivery Address
                </h3>

                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171715] mb-1">Flat, House No., Building, Street *</label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Flat 402, Sunshine Heights, Bandra West"
                      className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] text-xs font-medium focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171715] mb-1">Landmark / Locality (Optional)</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Near Hill Road / Opposite Metro"
                      className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] text-xs font-medium focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#171715] mb-1">PIN Code *</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="400050"
                        className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] text-xs font-mono font-bold focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#171715] mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] text-xs font-medium focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#171715] mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Maharashtra"
                        className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] text-xs font-medium focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="pt-6 border-t border-[#D8C7B5]/30">
                <h3 className="font-display font-bold text-sm text-[#171715] mb-3">
                  3. Select Delivery Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setDeliveryMethod('standard')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'standard' ? 'border-[#171715] bg-[#F7F3EE]' : 'border-[#D8C7B5]/40 hover:bg-[#F7F3EE]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'standard'}
                      onChange={() => setDeliveryMethod('standard')}
                      className="mt-0.5 accent-[#171715]"
                    />
                    <div>
                      <p className="font-bold text-xs text-[#171715]">Standard Express (3-5 Days)</p>
                      <p className="text-[11px] text-[#77736D] mt-0.5">
                        {subtotal >= 999 ? 'FREE on orders over ₹999' : '₹99 Delivery'}
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setDeliveryMethod('priority')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'priority' ? 'border-[#171715] bg-[#F7F3EE]' : 'border-[#D8C7B5]/40 hover:bg-[#F7F3EE]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'priority'}
                      onChange={() => setDeliveryMethod('priority')}
                      className="mt-0.5 accent-[#171715]"
                    />
                    <div>
                      <p className="font-bold text-xs text-[#171715]">Air Priority (1-2 Days)</p>
                      <p className="text-[11px] text-[#77736D] mt-0.5">+₹149 Expedited Air Dispatch</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Payment Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STEP 2: Payment Selection */
            <div className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#D8C7B5]/40 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#D8C7B5]/30">
                <div>
                  <h3 className="font-display font-bold text-lg text-[#171715]">
                    Select Payment Method
                  </h3>
                  <p className="text-xs text-[#77736D]">All transactions are end-to-end encrypted.</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-[#171715] underline"
                >
                  Edit Address
                </button>
              </div>

              {/* Payment Methods Options */}
              <div className="space-y-3">
                {/* Razorpay Gateway (UPI, Cards, NetBanking) */}
                <label
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'razorpay' ? 'border-[#171715] bg-[#F7F3EE]' : 'border-[#D8C7B5]/40 hover:bg-[#F7F3EE]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="mt-1 accent-[#171715]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#171715]">
                        Razorpay Secure (UPI, Cards, Net Banking)
                      </span>
                      <span className="text-[10px] bg-[#30372B] text-white font-mono px-2 py-0.5 rounded">
                        FASTEST
                      </span>
                    </div>
                    <p className="text-[11px] text-[#77736D] mt-1">
                      Pay via Google Pay, PhonePe, Paytm, RuPay, Visa, Mastercard, or 50+ NetBanking banks.
                    </p>
                  </div>
                </label>

                {/* Instant UPI Direct */}
                <label
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'upi' ? 'border-[#171715] bg-[#F7F3EE]' : 'border-[#D8C7B5]/40 hover:bg-[#F7F3EE]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="mt-1 accent-[#171715]"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-xs text-[#171715]">Direct UPI ID / VPA</span>
                    <p className="text-[11px] text-[#77736D] mt-1">Instant authorization from your UPI app.</p>
                    {paymentMethod === 'upi' && (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          className="w-full p-2 bg-white rounded-lg border border-[#D8C7B5] font-mono text-xs focus:outline-hidden"
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-[#171715] bg-[#F7F3EE]' : 'border-[#D8C7B5]/40 hover:bg-[#F7F3EE]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-[#171715]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#171715]">Cash on Delivery (COD)</span>
                      <span className="text-[10px] font-mono text-[#77736D]">+₹49 Handling</span>
                    </div>
                    <p className="text-[11px] text-[#77736D] mt-1">
                      Pay with cash or scan delivery agent's QR at the doorstep upon package receipt.
                    </p>
                  </div>
                </label>
              </div>

              {/* Pay Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (paymentMethod === 'razorpay') {
                      setShowRazorpayModal(true);
                    } else {
                      handleCompleteOrder();
                    }
                  }}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#171715] hover:bg-[#30372B] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isProcessing
                      ? 'Verifying Order...'
                      : paymentMethod === 'cod'
                      ? `Confirm Cash on Delivery Order (${formatINR(finalPayable)})`
                      : `Pay ${formatINR(finalPayable)} via ${paymentMethod === 'razorpay' ? 'Razorpay' : 'UPI'}`}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#77736D] pt-2">
                <ShieldCheck className="w-4 h-4 text-[#30372B]" />
                <span>Protected by 256-Bit SSL Encryption & Verified Payment Gateway</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary: Order Items & Pricing Breakdown */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-[#D8C7B5]/40 shadow-xs space-y-6">
            <h3 className="font-display font-bold text-base text-[#171715] pb-3 border-b border-[#D8C7B5]/30">
              Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
            </h3>

            {/* Items List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-16 object-cover rounded-lg bg-neutral-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#171715] truncate">{item.name}</p>
                    <p className="text-[11px] text-[#77736D] font-mono mt-0.5">
                      Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                    </p>
                    <p className="font-mono font-bold text-[#171715] mt-1">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Applied Coupon Info */}
            {appliedCoupon && (
              <div className="flex items-center justify-between p-2.5 bg-[#30372B]/10 rounded-xl border border-[#30372B]/20 text-xs">
                <div className="flex items-center gap-2 text-[#30372B]">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Promo <strong>{appliedCoupon.code}</strong> applied</span>
                </div>
                <span className="font-mono font-bold text-[#30372B]">-{formatINR(discount)}</span>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-2 pt-4 border-t border-[#D8C7B5]/30 text-xs font-mono text-[#77736D]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#171715]">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#30372B] font-semibold">
                  <span>Discount & Savings</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({deliveryMethod === 'priority' ? 'Air Priority' : 'Standard'})</span>
                <span>
                  {deliveryMethod === 'priority' ? (
                    formatINR(149)
                  ) : shippingFee === 0 ? (
                    <strong className="text-[#30372B]">FREE</strong>
                  ) : (
                    formatINR(shippingFee)
                  )}
                </span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="flex justify-between">
                  <span>Cash on Delivery Convenience Fee</span>
                  <span>{formatINR(49)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#D8C7B5]/30 flex justify-between text-base font-bold text-[#171715]">
                <span>Total Payable</span>
                <span>{formatINR(finalPayable)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Realistic Razorpay Simulation Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-300 text-[#171715]">
            {/* Razorpay Brand Bar */}
            <div className="bg-[#0C2340] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] tracking-widest font-mono text-cyan-400 font-semibold">RAZORPAY SECURE</span>
                <h4 className="font-bold text-base">SMART BUY Apparel Studio</h4>
                <p className="text-xs text-neutral-300">Order Amount: <strong className="font-mono text-white">{formatINR(finalPayable)}</strong></p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-cyan-400 font-bold font-mono text-sm">
                ₹
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#77736D]">Select an Indian payment instrument to authorize testing:</p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  className="w-full p-3.5 rounded-xl border border-neutral-300 hover:border-[#0C2340] hover:bg-neutral-50 flex items-center justify-between text-xs font-semibold text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>UPI (Google Pay / PhonePe / Paytm / BHIM)</span>
                  </div>
                  <Check className="w-4 h-4 text-[#30372B]" />
                </button>

                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  className="w-full p-3.5 rounded-xl border border-neutral-300 hover:border-[#0C2340] hover:bg-neutral-50 flex items-center justify-between text-xs font-semibold text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Credit / Debit Card (Visa, RuPay, Mastercard)</span>
                  </div>
                  <Check className="w-4 h-4 text-[#30372B]" />
                </button>

                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  className="w-full p-3.5 rounded-xl border border-neutral-300 hover:border-[#0C2340] hover:bg-neutral-50 flex items-center justify-between text-xs font-semibold text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-4 h-4 text-purple-600" />
                    <span>Net Banking (HDFC, ICICI, SBI, Axis)</span>
                  </div>
                  <Check className="w-4 h-4 text-[#30372B]" />
                </button>
              </div>

              <div className="pt-2 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold rounded-xl text-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  className="flex-1 py-2.5 px-4 bg-[#0C2340] hover:bg-black text-xs font-bold text-white rounded-xl shadow-md transition-colors"
                >
                  Authorize Payment ({formatINR(finalPayable)})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
