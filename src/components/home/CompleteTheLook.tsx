import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { COMPLETE_THE_LOOK_BUNDLE } from '../../data/products';
import { ShoppingCart, Check, Sparkles } from 'lucide-react';

export const CompleteTheLook: React.FC = () => {
  const { formatINR, addBundleToCart } = useStore();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddBundle = () => {
    addBundleToCart();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 border-t border-[#D8C7B5]/30">
      <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#D8C7B5]/40 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Flatlay Editorial Visual (Left) */}
          <div className="lg:col-span-6 relative aspect-4/3 rounded-2xl overflow-hidden bg-[#F7F3EE] shadow-md border border-[#D8C7B5]/30">
            <img
              src={COMPLETE_THE_LOOK_BUNDLE.image}
              alt="Complete the Look - The Contemporary Minimalist Uniform"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-[#30372B] text-white text-[11px] font-mono font-bold px-3 py-1 rounded-md shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>SAVE {COMPLETE_THE_LOOK_BUNDLE.discountPercent}% BUNDLE</span>
            </div>
          </div>

          {/* Bundle Information & Breakout (Right) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
                Complete the Look · Outfit Builder
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171715] mt-1">
                {COMPLETE_THE_LOOK_BUNDLE.title}
              </h2>
              <p className="text-xs text-[#77736D] mt-2 leading-relaxed">
                {COMPLETE_THE_LOOK_BUNDLE.subtitle}
              </p>

              {/* Items List */}
              <div className="mt-6 space-y-3">
                {COMPLETE_THE_LOOK_BUNDLE.items.map((item, index) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F7F3EE]/60 border border-[#D8C7B5]/30 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-[#77736D] w-4">
                        0{index + 1}
                      </span>
                      <div className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: item.colorHex }} />
                      <div>
                        <p className="font-semibold text-[#171715]">{item.name}</p>
                        <p className="text-[11px] text-[#77736D] font-mono">
                          {item.color} · Size: {item.size}
                        </p>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-[#171715]">
                      {formatINR(item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary and CTA */}
            <div className="mt-8 pt-6 border-t border-[#D8C7B5]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p className="text-xs text-[#77736D]">Individual Total: <span className="line-through font-mono">{formatINR(COMPLETE_THE_LOOK_BUNDLE.individualTotal)}</span></p>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-2xl sm:text-3xl font-bold text-[#171715]">
                    {formatINR(COMPLETE_THE_LOOK_BUNDLE.bundlePrice)}
                  </span>
                  <span className="text-xs font-bold text-[#30372B]">
                    Save {formatINR(COMPLETE_THE_LOOK_BUNDLE.savings)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddBundle}
                className="py-3.5 px-8 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added Complete Look to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add Complete Look to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
