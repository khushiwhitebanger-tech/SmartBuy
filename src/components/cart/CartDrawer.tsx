import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, Truck } from 'lucide-react';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onNavigateToShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToCheckout,
  onNavigateToShop,
}) => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateCartQuantity,
    subtotal,
    discount,
    shippingFee,
    total,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    formatINR,
    settings,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartDrawerOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError('');
    const res = await applyCouponCode(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
    setIsApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl flex flex-col justify-between text-[#171715] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#D8C7B5]/40 flex items-center justify-between bg-[#F7F3EE]">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-lg text-[#171715]">Shopping Cart</h3>
            <span className="font-mono text-xs bg-[#171715] text-white px-2 py-0.5 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 text-[#77736D] hover:text-[#171715] rounded-full hover:bg-[#D8C7B5]/30 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#F7F3EE] px-6 py-3 border-b border-[#D8C7B5]/30 text-xs">
          <div className="flex items-center gap-2 font-medium text-[#171715] mb-1.5">
            <Truck className="w-3.5 h-3.5 text-[#30372B]" />
            {amountNeededForFreeShipping === 0 ? (
              <span className="text-[#30372B] font-bold">You unlocked FREE All-India Shipping!</span>
            ) : (
              <span>
                Add <strong className="font-mono">{formatINR(amountNeededForFreeShipping)}</strong> more for <strong>FREE Delivery</strong>
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-[#D8C7B5]/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#30372B] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#F7F3EE] flex items-center justify-center text-[#77736D] mb-4">
                <Truck className="w-8 h-8 opacity-40" />
              </div>
              <h4 className="font-display font-bold text-base text-[#171715]">Your cart is empty</h4>
              <p className="text-xs text-[#77736D] max-w-xs mt-1.5 mb-6">
                Explore our curated minimal essentials and elevated daily silhouettes.
              </p>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  onNavigateToShop();
                }}
                className="py-2.5 px-6 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 rounded-xl bg-[#F7F3EE]/50 border border-[#D8C7B5]/30"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-24 object-cover rounded-lg bg-neutral-200 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-sans font-semibold text-xs text-[#171715] line-clamp-1">
                        {item.name}
                      </h5>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#77736D] hover:text-rose-600 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#77736D] mt-1">
                      <span>Size: <strong className="text-[#171715] font-mono">{item.size}</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: item.colorHex }} />
                        {item.color}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-[#D8C7B5] bg-white rounded-lg">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-[#77736D] hover:text-[#171715]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-mono text-xs font-bold text-[#171715]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-[#77736D] hover:text-[#171715]"
                        disabled={item.quantity >= item.maxStock}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-[#171715]">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-[#D8C7B5]/40 bg-[#FFFFFF] space-y-4">
            {/* Coupon Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-[#30372B]/10 rounded-xl border border-[#30372B]/20 text-xs">
                  <div className="flex items-center gap-2 text-[#30372B]">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-{formatINR(discount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-[#30372B] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter code (e.g. SMART10)"
                    className="flex-1 py-2 px-3 text-xs bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] uppercase font-mono placeholder:normal-case placeholder:text-[#77736D] focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={isApplying || !couponInput.trim()}
                    className="py-2 px-4 bg-[#171715] hover:bg-[#30372B] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#77736D] font-mono">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#171715]">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#30372B] font-semibold">
                  <span>Savings & Discount</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-[#30372B] uppercase">FREE</strong> : formatINR(shippingFee)}</span>
              </div>
              <div className="pt-2 border-t border-[#D8C7B5]/30 flex justify-between text-base font-bold text-[#171715]">
                <span>Total Amount</span>
                <span>{formatINR(total)}</span>
              </div>
              <p className="text-[10px] text-[#77736D] font-sans">Includes all Indian GST & Taxes</p>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                setIsCartDrawerOpen(false);
                onNavigateToCheckout();
              }}
              className="w-full py-3.5 px-6 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#77736D] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#30372B]" />
              <span>Razorpay 256-bit Secure Checkout & Free Returns</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
