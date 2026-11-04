import React from 'react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Package, Truck, ArrowRight, Printer, ShieldCheck } from 'lucide-react';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigateToShop: () => void;
  onNavigateToAccount: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onNavigateToShop,
  onNavigateToAccount,
}) => {
  const { formatINR } = useStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left">
      {/* Success Notification Banner */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-10 border border-[#D8C7B5]/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-[#D8C7B5]/30 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#30372B] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
                Order Confirmed
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#171715] mt-0.5">
                Thank You, {order.customerName}!
              </h1>
              <p className="text-xs text-[#77736D] mt-1">
                Order ID: <strong className="font-mono text-[#171715]">{order.orderNumber}</strong> · A confirmation email has been sent to {order.customerEmail}.
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="self-start sm:self-auto py-2 px-4 bg-[#F7F3EE] hover:bg-[#D8C7B5]/40 text-[#171715] rounded-xl text-xs font-semibold flex items-center gap-2 border border-[#D8C7B5] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Invoice</span>
          </button>
        </div>

        {/* Live Timeline Tracker */}
        <div className="py-8 border-b border-[#D8C7B5]/30">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-[#171715] mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#30372B]" />
              <span>Courier: {order.carrier}</span>
            </div>
            <span className="text-[#30372B]">AWB: {order.trackingNumber}</span>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-[#30372B] text-white flex items-center justify-center text-xs font-bold mb-1.5">
                ✓
              </div>
              <span className="font-bold text-[#171715]">Placed</span>
              <span className="text-[10px] text-[#77736D]">Payment Verified</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-[#30372B] text-white flex items-center justify-center text-xs font-bold mb-1.5">
                ✓
              </div>
              <span className="font-bold text-[#171715]">Confirmed</span>
              <span className="text-[10px] text-[#77736D]">Bengaluru Hub</span>
            </div>

            <div className="flex flex-col items-center opacity-40">
              <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-xs font-bold mb-1.5">
                3
              </div>
              <span>Dispatched</span>
              <span className="text-[10px] text-[#77736D]">In Transit</span>
            </div>

            <div className="flex flex-col items-center opacity-40">
              <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-xs font-bold mb-1.5">
                4
              </div>
              <span>Delivered</span>
              <span className="text-[10px] text-[#77736D]">Est. {order.estimatedDelivery}</span>
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-[#D8C7B5]/30 text-xs">
          {/* Shipping Address */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#171715] mb-2 font-mono">
              Delivery Address
            </h4>
            <div className="text-[#77736D] space-y-1">
              <p className="font-semibold text-[#171715]">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment & Status */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#171715] mb-2 font-mono">
              Payment Summary
            </h4>
            <div className="text-[#77736D] space-y-1 font-mono">
              <p>Method: <strong className="uppercase text-[#171715]">{order.paymentMethod}</strong></p>
              <p>Status: <strong className="text-emerald-700 uppercase">{order.paymentStatus}</strong></p>
              {order.paymentId && <p>Transaction ID: {order.paymentId}</p>}
              <p>Estimated Delivery: <strong className="text-[#30372B]">{order.estimatedDelivery}</strong></p>
            </div>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="py-8 border-b border-[#D8C7B5]/30">
          <h4 className="font-bold uppercase tracking-wider text-xs text-[#171715] mb-4 font-mono">
            Purchased Garments
          </h4>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F3EE]/50 text-xs">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg bg-neutral-200" />
                  <div>
                    <h5 className="font-semibold text-[#171715]">{item.name}</h5>
                    <p className="text-[11px] text-[#77736D] font-mono">
                      Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-[#171715]">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t border-[#D8C7B5]/20 flex justify-between font-mono text-sm font-bold text-[#171715]">
            <span>Total Paid (incl. Taxes)</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>

        {/* Next Actions */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onNavigateToAccount}
            className="text-xs font-bold text-[#171715] hover:text-[#30372B] underline"
          >
            View in My Orders & Track Live →
          </button>

          <button
            onClick={onNavigateToShop}
            className="w-full sm:w-auto py-3 px-8 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
