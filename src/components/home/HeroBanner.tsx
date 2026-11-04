import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HomepageBanner } from '../../types';

interface HeroBannerProps {
  onShopMen: () => void;
  onShopWomen: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopMen, onShopWomen }) => {
  const [activeBanner, setActiveBanner] = useState<HomepageBanner | null>(null);

  useEffect(() => {
    fetch('/api/homepage-banners')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: HomepageBanner[]) => {
        if (data && data.length > 0) {
          setActiveBanner(data[0]);
        }
      })
      .catch(() => {});
  }, []);

  // If a custom active banner is defined in Admin Panel
  if (activeBanner && activeBanner.title !== 'Style That Speaks') {
    return (
      <section className="relative w-full aspect-16/9 sm:min-h-[540px] md:min-h-[620px] lg:min-h-[720px] bg-[#171715] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={activeBanner.desktopImage}
            alt={activeBanner.title}
            className="w-full h-full object-cover object-center scale-100 animate-in fade-in duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full h-full flex flex-col justify-center py-12 sm:py-20 text-white text-left">
          <div className="max-w-xl">
            {activeBanner.promoBadge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#30372B] text-[#D8C7B5] border border-[#D8C7B5]/30 mb-4 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D8C7B5]" />
                {activeBanner.promoBadge}
              </span>
            )}
            <div className="text-xs font-mono tracking-widest text-[#D8C7B5] uppercase mb-2">
              {activeBanner.tagline}
            </div>
            <h1 className="font-serif font-bold text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight mb-4">
              {activeBanner.title}
            </h1>
            <p className="text-sm sm:text-base text-stone-300 mb-8 leading-relaxed">
              {activeBanner.subtitle}
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
              <button
                onClick={onShopMen}
                className="py-3 px-6 sm:py-3.5 sm:px-8 bg-[#30372B] hover:bg-[#232920] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-103 flex items-center gap-2 border border-white/10 cursor-pointer"
              >
                <span>{activeBanner.primaryButtonText || 'Shop Men'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onShopWomen}
                className="py-3 px-6 sm:py-3.5 sm:px-8 bg-[#E6DACD]/95 hover:bg-[#F2ECE3] text-[#171715] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-103 flex items-center gap-2 border border-[#171715]/10 cursor-pointer"
              >
                <span>{activeBanner.secondaryButtonText || 'Shop Women'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default Editorial Hero Graphic
  return (
    <section className="relative w-full aspect-16/9 sm:min-h-[540px] md:min-h-[620px] lg:min-h-[720px] bg-[#171715] flex items-center overflow-hidden">
      {/* Background Campaign Editorial Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/HeroImage/Style That Speaks.png"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/hero/hero_banner_elevated_style.png';
          }}
          alt="SMART BUY - Style That Speaks. Everyday essentials. Elevated style."
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-100 animate-in fade-in duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full h-full flex flex-col justify-end sm:justify-center py-10 sm:py-20">
        <div className="max-w-xl text-left">
          <h1 className="sr-only">
            STYLE THAT SPEAKS - Everyday essentials. Elevated style. Prices you'll love.
          </h1>

          <div className="mt-auto sm:mt-44 md:mt-52 lg:mt-64 flex flex-wrap gap-3 sm:gap-4 items-center">
            <button
              onClick={onShopMen}
              className="py-3 px-6 sm:py-3.5 sm:px-8 bg-[#2A342B]/90 hover:bg-[#1D251E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-103 flex items-center gap-2 backdrop-blur-xs border border-white/10 cursor-pointer"
              aria-label="Shop Men Collection"
            >
              <span>Shop Men</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onShopWomen}
              className="py-3 px-6 sm:py-3.5 sm:px-8 bg-[#E6DACD]/95 hover:bg-[#F2ECE3] text-[#171715] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-103 flex items-center gap-2 backdrop-blur-xs border border-[#171715]/10 cursor-pointer"
              aria-label="Shop Women Collection"
            >
              <span>Shop Women</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
