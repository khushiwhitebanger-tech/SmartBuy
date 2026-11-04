import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Star, Heart, Check, ArrowRight, Play } from 'lucide-react';

interface QuickViewModalProps {
  onNavigateToDetail: (slug: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ onNavigateToDetail }) => {
  const { quickViewProduct, closeQuickView, addToCart, formatINR, isInWishlist, toggleWishlist, openSizeGuide } = useStore();
  const [selectedColor, setSelectedColor] = useState(quickViewProduct?.colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(quickViewProduct?.sizes[0] || 'M');
  const [qty, setQty] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  if (!quickViewProduct) return null;

  const currentColorObj = quickViewProduct.colors.find((c) => c.name === selectedColor) || quickViewProduct.colors[0];
  const isFavorited = isInWishlist(quickViewProduct.id);

  const handleAdd = () => {
    addToCart(quickViewProduct, selectedSize, selectedColor, currentColorObj?.hex || '#D8C7B5', qty);
    closeQuickView();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#D8C7B5]/40 overflow-hidden text-[#171715] flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 p-2 text-[#171715] hover:text-[#30372B] bg-white/80 hover:bg-white rounded-full transition-colors shadow-xs"
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Media Column */}
        <div className="w-full md:w-1/2 bg-[#F7F3EE] p-6 flex flex-col justify-between">
          <div className="aspect-4/3 md:aspect-square w-full rounded-xl overflow-hidden bg-white shadow-xs relative">
            {showVideo && quickViewProduct.video ? (
              <video
                src={quickViewProduct.video}
                autoPlay
                loop
                playsInline
                muted
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={quickViewProduct.images[activeImageIdx] || quickViewProduct.images[0]}
                alt={quickViewProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {(quickViewProduct.images.length > 1 || quickViewProduct.video) && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {quickViewProduct.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setShowVideo(false);
                    setActiveImageIdx(i);
                  }}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    !showVideo && activeImageIdx === i ? 'border-[#171715]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}

              {quickViewProduct.video && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-black flex flex-col items-center justify-center text-white ${
                    showVideo ? 'border-[#1C3F2B] ring-2 ring-[#1C3F2B]/40' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                  title="Watch Video Reel"
                >
                  <video src={quickViewProduct.video} muted className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Product Info Column */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between text-xs text-[#77736D] mb-1">
              <span className="uppercase tracking-wider font-semibold">{quickViewProduct.department} · {quickViewProduct.category}</span>
              <div className="flex items-center gap-1 font-mono text-[#171715]">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{quickViewProduct.rating}</span>
                <span className="text-[#77736D]">({quickViewProduct.reviewCount})</span>
              </div>
            </div>

            <h3 className="font-display font-bold text-xl text-[#171715] mt-1">
              {quickViewProduct.name}
            </h3>

            {/* Price */}
            <div className="flex items-baseline gap-2.5 mt-3 font-mono">
              <span className="text-2xl font-bold text-[#171715]">{formatINR(quickViewProduct.price)}</span>
              {quickViewProduct.originalPrice > quickViewProduct.price && (
                <>
                  <span className="text-sm text-[#77736D] line-through">{formatINR(quickViewProduct.originalPrice)}</span>
                  <span className="text-xs font-bold text-[#30372B] bg-[#30372B]/10 px-2 py-0.5 rounded">
                    {quickViewProduct.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-[#77736D] mt-3 line-clamp-3 leading-relaxed">
              {quickViewProduct.description}
            </p>

            {/* Color Selection */}
            <div className="mt-5">
              <label className="block text-xs font-semibold text-[#171715] mb-2">
                Color: <span className="font-normal text-[#77736D]">{selectedColor}</span>
              </label>
              <div className="flex gap-2">
                {quickViewProduct.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedColor(c.name);
                      if (c.image) {
                        const idx = quickViewProduct.images.findIndex((img) => img === c.image);
                        if (idx !== -1) {
                          setActiveImageIdx(idx);
                        }
                      }
                    }}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                      selectedColor === c.name ? 'ring-2 ring-[#171715] ring-offset-2' : 'border-neutral-300'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor === c.name && <Check className="w-3.5 h-3.5 text-white stroke-[3] mix-blend-difference" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#171715]">Select Size</label>
                <button
                  onClick={() => openSizeGuide(quickViewProduct.category)}
                  className="text-[11px] text-[#77736D] hover:text-[#171715] underline decoration-dotted"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickViewProduct.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-10 py-1.5 px-3 text-xs font-mono font-medium rounded-lg border transition-all ${
                      selectedSize === s
                        ? 'bg-[#171715] text-white border-[#171715]'
                        : 'bg-white text-[#171715] border-[#D8C7B5] hover:border-[#171715]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 mt-6 border-t border-[#D8C7B5]/30 flex flex-col gap-2.5">
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                className="flex-1 py-3 px-6 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(quickViewProduct.id)}
                className={`p-3 rounded-xl border border-[#D8C7B5] transition-colors ${
                  isFavorited ? 'bg-[#171715] text-white border-[#171715]' : 'hover:bg-[#F7F3EE]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={() => {
                closeQuickView();
                onNavigateToDetail(quickViewProduct.slug);
              }}
              className="text-xs text-center font-semibold text-[#77736D] hover:text-[#171715] flex items-center justify-center gap-1.5 py-1"
            >
              <span>View Full Product Specifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
