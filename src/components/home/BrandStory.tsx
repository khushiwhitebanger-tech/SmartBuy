import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BrandStoryProps {
  onDiscoverStory: () => void;
}

export const BrandStory: React.FC<BrandStoryProps> = ({ onDiscoverStory }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 border-t border-[#D8C7B5]/30">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Story Text */}
        <div className="lg:col-span-7">
          <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
            The Philosophy
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171715] mt-2 leading-tight">
            GOOD STYLE. SMART PRICES.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#77736D] leading-relaxed max-w-xl">
            At SMART BUY, we believe great style should be accessible to everyone. Discover versatile essentials, modern designs, and everyday comfort without compromising on quality.
          </p>
          <p className="mt-3 text-xs sm:text-sm text-[#77736D] leading-relaxed max-w-xl">
            By eliminating traditional retailer middle-markups and partnering directly with master textile weavers across India and Europe, we deliver heavyweight combed organic cotton, French flax linen, and tailored fits at prices that make sense for daily living.
          </p>

          <div className="mt-8">
            <button
              onClick={onDiscoverStory}
              className="py-3 px-6 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>Discover Our Story</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editorial Photo */}
        <div className="lg:col-span-5 relative aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden shadow-lg border border-[#D8C7B5]/30">
          <img
            src="/src/assets/images/category_urban_streetwear_1792250236285.jpg"
            alt="SMART BUY Brand Story Editorial"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};
