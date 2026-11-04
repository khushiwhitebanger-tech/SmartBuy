import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { Play, Pause, Volume2, VolumeX, ArrowRight, ShoppingBag, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface HoodieVideoShowcaseProps {
  onSelectProduct: (product: Product) => void;
}

export const HoodieVideoShowcase: React.FC<HoodieVideoShowcaseProps> = ({ onSelectProduct }) => {
  const { products, addToCart, formatINR, showToast } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState('Forest Green');

  // Locate the hoodie product
  const hoodieProduct = products.find(
    (p) => p.id === 'sb-men-hoodie-zip-01' || p.slug === 'heavyweight-full-zip-thermal-fleece-hoodie'
  );

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleQuickAdd = () => {
    if (!hoodieProduct) return;
    const colorObj = hoodieProduct.colors.find((c) => c.name === selectedColor) || hoodieProduct.colors[1];
    addToCart(hoodieProduct, selectedSize, selectedColor, colorObj?.hex || '#1C3F2B', 1);
    showToast(`Added Heavyweight Full-Zip Hoodie (${selectedColor}, ${selectedSize}) to bag!`, 'success');
  };

  const currentColorObj = hoodieProduct?.colors.find((c) => c.name === selectedColor) || hoodieProduct?.colors[1];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#D8C7B5]/30">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 text-left">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
              Campaign In Motion · Men's Winter Wear
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#171715] mt-1.5">
            The Full-Zip Fleece Hoodie in Action.
          </h2>
          <p className="text-xs sm:text-sm text-[#77736D] mt-1 max-w-xl">
            Watch the real unboxing, hand-feel, and on-body fit experience of our 320 GSM brushed thermal fleece hoodie.
          </p>
        </div>

        {hoodieProduct && (
          <button
            onClick={() => onSelectProduct(hoodieProduct)}
            className="text-xs font-bold uppercase tracking-wider text-[#171715] hover:text-[#30372B] flex items-center gap-1.5 transition-colors group shrink-0"
          >
            <span>Explore Hoodie Details</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>

      {/* Main Grid: Video Reel + Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#F7F3EE] rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#D8C7B5]/40 shadow-xs">
        {/* Left Column: Vertical 9:16 Video Player Reel */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[340px] aspect-9/16 rounded-2xl overflow-hidden shadow-2xl bg-black border-2 border-black/10 group">
            <video
              ref={videoRef}
              src="/assets/aistudio/HOODIES_c6466ee2.MP4"
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover cursor-pointer"
              onClick={togglePlay}
            />

            {/* Video Overlays */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
              <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Try-On</span>
              </span>
              <span className="bg-black/60 backdrop-blur-xs text-neutral-300 text-[10px] font-mono px-2 py-0.5 rounded">
                0:10
              </span>
            </div>

            {/* Video Control Bar on Bottom */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-20 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
              <button
                onClick={togglePlay}
                className="p-1.5 text-white hover:text-emerald-400 transition-colors cursor-pointer"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <div className="text-[11px] font-mono text-white/90 font-medium">
                Unboxing: Forest Green (L)
              </div>

              <button
                onClick={toggleMute}
                className="p-1.5 text-white hover:text-emerald-400 transition-colors cursor-pointer"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Product Card & Buy Flow */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6 text-left">
          {hoodieProduct ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#30372B] bg-[#30372B]/10 px-2.5 py-0.5 rounded-sm">
                    Featured As Seen In Video
                  </span>
                  <span className="text-[11px] font-mono text-[#77736D]">
                    Heavyweight Fleece Collection
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#171715] leading-tight">
                  {hoodieProduct.name}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-[#77736D] leading-relaxed max-w-xl">
                  {hoodieProduct.description}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-4 font-mono">
                  <span className="text-3xl font-extrabold text-[#171715]">
                    {formatINR(hoodieProduct.price)}
                  </span>
                  <span className="text-sm text-[#77736D] line-through">
                    {formatINR(hoodieProduct.originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-sm">
                    {hoodieProduct.discountPercent}% OFF · Winter Deal
                  </span>
                </div>
              </div>

              {/* Colorway Selection */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#171715] mb-2">
                  <span>Color: <strong className="text-[#30372B]">{selectedColor}</strong></span>
                  {selectedColor === 'Forest Green' && (
                    <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Worn in video
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {hoodieProduct.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                        selectedColor === c.name
                          ? 'border-[#171715] bg-[#FFFFFF] shadow-sm font-bold ring-1 ring-[#171715]'
                          : 'border-[#D8C7B5] bg-white/60 hover:bg-white text-[#77736D]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#171715] mb-2">
                  <span>Size (Model is 6'1" wearing size L)</span>
                  <span className="text-[11px] font-mono text-[#77736D]">Regular Fit</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hoodieProduct.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-11 h-10 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                        selectedSize === s
                          ? 'bg-[#171715] text-white shadow-xs'
                          : 'bg-white border border-[#D8C7B5] text-[#171715] hover:border-[#171715]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleQuickAdd}
                  className="flex-1 py-3.5 px-6 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add To Bag · {formatINR(hoodieProduct.price)}</span>
                </button>

                <button
                  onClick={() => onSelectProduct(hoodieProduct)}
                  className="py-3.5 px-6 bg-white hover:bg-neutral-50 text-[#171715] border border-[#D8C7B5] hover:border-[#171715] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>View Full Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Verified Features */}
              <div className="pt-4 border-t border-[#D8C7B5]/40 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] font-mono text-[#77736D]">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>320 GSM Brushed Fleece</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Heavy-Duty Metal Zip</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Split Kangaroo Pockets</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#77736D]">Loading featured hoodie details...</p>
          )}
        </div>
      </div>
    </section>
  );
};
