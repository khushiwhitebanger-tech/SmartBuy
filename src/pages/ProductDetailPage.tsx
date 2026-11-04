import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { PINCODE_DIRECTORY } from '../data/initialData';
import { Star, Heart, Check, Truck, ShieldCheck, RefreshCw, ChevronDown, ChevronUp, MapPin, Sparkles, Play, Volume2, VolumeX } from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  onNavigateToCheckout: () => void;
  onSelectProduct: (p: Product) => void;
  onNavigateBack: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onNavigateToCheckout,
  onSelectProduct,
  onNavigateBack,
}) => {
  const { addToCart, isInWishlist, toggleWishlist, formatINR, openSizeGuide, products, showToast } = useStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Pincode Checker
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{ city: string; state: string; days: number; dateStr: string } | null>(null);
  const [pincodeError, setPincodeError] = useState('');

  // Accordions
  const [openAccordion, setOpenAccordion] = useState<string | null>('specs');

  // New review form
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState([
    {
      author: 'Sameer Kapoor',
      rating: 5,
      date: 'February 14, 2026',
      city: 'Gurugram',
      comment: 'Exceptional craftsmanship. The fit is clean and the fabric has that crisp structured weight without overheating.',
    },
    {
      author: 'Ananya Deshmukh',
      rating: 5,
      date: 'February 02, 2026',
      city: 'Pune',
      comment: 'Color matches the photography exactly. Really appreciate the transparent sustainable packaging.',
    },
  ]);

  const currentColorObj = product.colors.find((c) => c.name === selectedColor) || product.colors[0];
  const variantKey = `${selectedSize}_${selectedColor}`;
  const availableStock = product.stockByVariant[variantKey] ?? product.totalStock ?? 12;
  const isFavorited = isInWishlist(product.id);

  // Check pincode
  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    setPincodeError('');
    setPincodeResult(null);

    const clean = pincodeInput.trim();
    if (!/^\d{6}$/.test(clean)) {
      setPincodeError('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    const match = PINCODE_DIRECTORY[clean];
    const days = match ? match.days : 3;
    const estDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const dateStr = estDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    setPincodeResult({
      city: match ? match.city : 'Your City',
      state: match ? match.state : 'India',
      days,
      dateStr,
    });
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, currentColorObj?.hex || '#D8C7B5', quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, currentColorObj?.hex || '#D8C7B5', quantity);
    onNavigateToCheckout();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;
    setReviewsList([
      {
        author: reviewAuthor,
        rating: reviewRating,
        date: 'Today',
        city: 'Verified Buyer',
        comment: reviewComment,
      },
      ...reviewsList,
    ]);
    setReviewAuthor('');
    setReviewComment('');
    showToast('Thank you! Your review has been published.', 'success');
  };

  // Related products
  const relatedProducts = products
    .filter((p) => p.department === product.department && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#77736D] mb-6 font-mono">
        <button onClick={onNavigateBack} className="hover:text-[#171715]">Shop</button>
        <span>/</span>
        <span className="capitalize">{product.department}</span>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="text-[#171715] truncate font-sans font-medium">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery with Zoom / Video Player */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          {(product.images.length > 1 || product.video) && (
            <div className="flex md:flex-col gap-3 overflow-x-auto shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShowVideo(false);
                    setActiveImageIdx(idx);
                  }}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    !showVideo && activeImageIdx === idx
                      ? 'border-[#171715] shadow-xs'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}

              {/* Video Reel Thumbnail Button */}
              {product.video && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-black flex flex-col items-center justify-center text-white ${
                    showVideo
                      ? 'border-[#1C3F2B] ring-2 ring-[#1C3F2B]/40 shadow-xs'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                  title="Watch Try-On Video Reel"
                  aria-label="Watch Try-On Video Reel"
                >
                  <video src={product.video} muted className="w-full h-full object-cover opacity-60 pointer-events-none" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                    <div className="w-6 h-6 rounded-full bg-white/90 text-[#171715] flex items-center justify-center shadow-xs">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                    <span className="text-[9px] font-mono font-bold mt-1 uppercase tracking-tight text-white drop-shadow">Reel</span>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Primary Viewport: Video Reel OR Image Zoom */}
          {showVideo && product.video ? (
            <div className="relative flex-1 aspect-4/5 rounded-2xl overflow-hidden bg-black border border-[#D8C7B5]/40 shadow-sm flex items-center justify-center group">
              <video
                src={product.video}
                autoPlay
                loop
                playsInline
                muted={isVideoMuted}
                controls
                className="w-full h-full object-cover"
              />

              {/* Top Banner Tag */}
              <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono px-3 py-1 rounded-full flex items-center gap-2 font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Try-On & Unboxing Reel</span>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVideoMuted(!isVideoMuted);
                }}
                className="absolute bottom-4 right-4 z-20 p-2.5 bg-black/75 hover:bg-black text-white rounded-full backdrop-blur-xs transition-all shadow-md hover:scale-105"
                title={isVideoMuted ? 'Unmute Audio' : 'Mute Audio'}
                aria-label="Toggle Video Audio"
              >
                {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          ) : (
            <div
              className="relative flex-1 aspect-4/5 rounded-2xl overflow-hidden bg-[#F7F3EE] border border-[#D8C7B5]/40 shadow-sm cursor-crosshair"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-200 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                    : undefined
                }
              />

              {/* Video Quick Switch Badge */}
              {product.video && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-[#1C3F2B] hover:bg-[#152e20] text-white text-xs font-mono font-semibold px-3 py-1.5 rounded-xl shadow-md transition-all hover:scale-103 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Fit Reel (0:10)</span>
                </button>
              )}

              {/* Discount Badge */}
              {product.discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-[#171715] text-white text-xs font-mono font-bold px-2.5 py-1 rounded">
                  SAVE {product.discountPercent}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-[#77736D] mb-2 font-mono">
              <span className="uppercase tracking-widest">{product.collection}</span>
              <div className="flex items-center gap-1.5 text-[#171715]">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-neutral-300'}`}
                    />
                  ))}
                </div>
                <span className="font-bold">{product.rating}</span>
                <span className="text-[#77736D]">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#171715] leading-tight">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 mt-3 font-mono">
              <span className="text-3xl font-extrabold text-[#171715]">
                {formatINR(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-base text-[#77736D] line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-[#30372B] bg-[#30372B]/10 px-2 py-0.5 rounded">
                    Save {formatINR(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[#77736D] font-mono mt-1">Inclusive of all Indian taxes and GST</p>
          </div>

          {/* Color Selector */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-[#171715] uppercase tracking-wider mb-2.5">
              Color: <span className="text-[#77736D] font-normal normal-case">{selectedColor}</span>
            </label>
            <div className="flex gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedColor(c.name);
                    if (c.image) {
                      const idx = product.images.findIndex((img) => img === c.image);
                      if (idx !== -1) {
                        setActiveImageIdx(idx);
                      }
                    }
                  }}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    selectedColor === c.name ? 'ring-2 ring-[#171715] ring-offset-2 scale-105' : 'border-neutral-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColor === c.name && <Check className="w-4 h-4 text-white stroke-[3] mix-blend-difference" />}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector & Stock Badge */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-[#171715] uppercase tracking-wider">
                Size
              </label>
              <button
                onClick={() => openSizeGuide(product.category)}
                className="text-xs font-medium text-[#77736D] hover:text-[#171715] underline decoration-dotted"
              >
                Size Guide
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`min-w-12 py-2 px-3 text-xs font-mono font-semibold rounded-xl border transition-all ${
                    selectedSize === s
                      ? 'bg-[#171715] text-white border-[#171715]'
                      : 'bg-white text-[#171715] border-[#D8C7B5] hover:border-[#171715]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Live Stock Notification */}
            <div className="mt-2.5 text-xs font-mono">
              {availableStock <= 5 && availableStock > 0 ? (
                <span className="text-amber-700 font-semibold">⚠️ Only {availableStock} left in stock — order soon!</span>
              ) : availableStock > 5 ? (
                <span className="text-[#30372B] font-semibold">✓ In Stock ({availableStock} units ready for immediate dispatch)</span>
              ) : (
                <span className="text-rose-600 font-semibold">Currently Out of Stock in this variant</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={availableStock <= 0}
                className="flex-1 py-3.5 px-6 bg-[#171715] hover:bg-[#30372B] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all"
              >
                Add to Cart
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border border-[#D8C7B5] transition-colors ${
                  isFavorited ? 'bg-[#171715] text-white border-[#171715]' : 'bg-white text-[#171715] hover:bg-[#F7F3EE]'
                }`}
                aria-label="Wishlist toggle"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={availableStock <= 0}
              className="w-full py-3.5 px-6 bg-[#30372B] hover:bg-[#171715] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              Buy Now (Express Checkout)
            </button>
          </div>

          {/* Interactive PIN Code Delivery Estimator */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#D8C7B5]/40 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#171715] mb-2">
              <MapPin className="w-4 h-4 text-[#30372B]" />
              <span>Check Delivery & Cash on Delivery Availability</span>
            </div>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit PIN code (e.g. 110001, 560001)"
                className="flex-1 py-2 px-3 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] font-mono text-xs focus:outline-hidden"
              />
              <button
                type="submit"
                className="py-2 px-4 bg-[#171715] text-white font-semibold rounded-xl hover:bg-[#30372B] transition-colors"
              >
                Check
              </button>
            </form>

            {pincodeError && <p className="text-rose-600 mt-2 font-medium">{pincodeError}</p>}

            {pincodeResult && (
              <div className="mt-3 p-3 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5]/30 space-y-1">
                <div className="flex items-center gap-1.5 text-[#30372B] font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Delivering to {pincodeResult.city}, {pincodeResult.state}</span>
                </div>
                <p className="text-[#171715]">
                  Expected Delivery by: <strong className="font-mono text-[#30372B]">{pincodeResult.dateStr}</strong>
                </p>
                <p className="text-[#77736D] text-[11px]">
                  ✓ Free delivery on orders over ₹999 · Cash on Delivery available
                </p>
              </div>
            )}
          </div>

          {/* Expandable Accordions: Specs, Fabric Care, Shipping */}
          <div className="border-t border-[#D8C7B5]/30 pt-4 space-y-3">
            {/* Description & Features */}
            <div className="border border-[#D8C7B5]/30 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'specs' ? null : 'specs')}
                className="w-full p-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#171715]"
              >
                <span>Product Specifications & Details</span>
                {openAccordion === 'specs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'specs' && (
                <div className="p-4 pt-0 text-xs text-[#77736D] space-y-2 leading-relaxed">
                  <p>{product.description}</p>
                  <ul className="list-disc pl-4 space-y-1 text-[#171715] pt-2">
                    {product.features.map((feat, i) => (
                      <li key={i}>{feat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Material & Care */}
            <div className="border border-[#D8C7B5]/30 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'care' ? null : 'care')}
                className="w-full p-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#171715]"
              >
                <span>Material & Fabric Care</span>
                {openAccordion === 'care' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'care' && (
                <div className="p-4 pt-0 text-xs text-[#77736D] leading-relaxed">
                  <p>{product.fabricCare}</p>
                </div>
              )}
            </div>

            {/* Shipping & 14-Day Returns */}
            <div className="border border-[#D8C7B5]/30 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                className="w-full p-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#171715]"
              >
                <span>Shipping & 14-Day Return Guarantee</span>
                {openAccordion === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'shipping' && (
                <div className="p-4 pt-0 text-xs text-[#77736D] space-y-2 leading-relaxed">
                  <p>All items dispatch within 24 hours from our Bengaluru fulfillment hub.</p>
                  <p>Hassle-free 14-day doorstep exchange or instant refund to original payment method or UPI.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-16 pt-12 border-t border-[#D8C7B5]/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="font-display font-bold text-2xl text-[#171715]">
              Customer Reviews ({reviewsList.length + 2})
            </h3>
            <p className="text-xs text-[#77736D] mt-1">
              Verified feedback from real customers across India.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Reviews List (Left) */}
          <div className="lg:col-span-7 space-y-4">
            {reviewsList.map((rev, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-[#D8C7B5]/30 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#171715]">{rev.author}</span>
                    <span className="text-[11px] text-[#77736D] font-mono">({rev.city})</span>
                  </div>
                  <div className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, r) => (
                      <Star key={r} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#77736D] leading-relaxed">{rev.comment}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-[#30372B] font-mono">
                  <Check className="w-3 h-3" />
                  <span>Verified Purchase</span>
                  <span>·</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Write a Review Box (Right) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#D8C7B5]/40">
            <h4 className="font-display font-bold text-base text-[#171715] mb-1">
              Write a Review
            </h4>
            <p className="text-xs text-[#77736D] mb-4">Share your thoughts on the fit, fabric, and drape.</p>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#171715] mb-1">Your Rating</label>
                <div className="flex gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-hidden"
                    >
                      <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171715] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  placeholder="e.g. Varun K."
                  className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171715] mb-1">Your Review</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How does this item fit and feel?"
                  className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] text-xs font-medium focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase rounded-xl transition-colors"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#D8C7B5]/40">
          <div className="mb-8">
            <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
              Curated Recommendations
            </span>
            <h3 className="font-display font-bold text-2xl text-[#171715] mt-1">
              Complete Your Wardrobe
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="cursor-pointer group bg-white rounded-2xl overflow-hidden border border-[#D8C7B5]/30 hover:shadow-md transition-all p-3"
              >
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#F7F3EE]">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                </div>
                <div className="mt-3">
                  <span className="text-[10px] font-mono uppercase text-[#77736D]">{p.category}</span>
                  <h4 className="font-semibold text-xs text-[#171715] truncate group-hover:text-[#30372B]">{p.name}</h4>
                  <p className="font-mono text-xs font-bold text-[#171715] mt-1">{formatINR(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
