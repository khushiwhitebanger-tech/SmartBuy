import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, Star, Eye, Trash2, Play } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { isInWishlist, toggleWishlist, addToCart, formatINR, openQuickView, deleteProduct } = useStore();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [isHovered, setIsHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isFavorited = isInWishlist(product.id);

  const currentColorHex = product.colors.find((c) => c.name === selectedColor)?.hex || '#D8C7B5';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize, selectedColor, currentColorHex, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickView(product);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      deleteProduct(product.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const currentColorImage = product.colors.find((c) => c.name === selectedColor)?.image || product.images[0];

  return (
    <div
      onClick={() => onSelect(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setConfirmDelete(false);
      }}
      className="group relative flex flex-col bg-[#FFFFFF] rounded-2xl overflow-hidden border border-[#D8C7B5]/30 hover:border-[#171715]/20 hover:shadow-lg transition-all duration-300 cursor-pointer text-left"
    >
      {/* Image Container with Fallback */}
      <div className="relative aspect-4/5 w-full bg-[#F7F3EE] overflow-hidden">
        <img
          src={currentColorImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
          onError={(e) => {
            // Elegant fallback container
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Fallback styling placeholder if image fails */}
        <div className="absolute inset-0 -z-10 bg-[#D8C7B5]/20 flex flex-col items-center justify-center p-4 text-center">
          <span className="font-display font-bold text-sm text-[#171715]">{product.name}</span>
          <span className="text-xs text-[#77736D] mt-1">{product.category}</span>
        </div>

        {/* Subtle Tag Badges (Discount + Video) */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-10 pointer-events-none">
          {product.discountPercent > 0 && (
            <div className="bg-[#171715] text-[#FFFFFF] text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs">
              {product.discountPercent}% OFF
            </div>
          )}
          {product.video && (
            <div className="flex items-center gap-1 bg-[#1C3F2B] text-white text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>Video</span>
            </div>
          )}
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full backdrop-blur-xs transition-colors shadow-xs ${
              isFavorited
                ? 'bg-[#171715] text-white'
                : 'bg-white/80 text-[#171715] hover:bg-white hover:text-[#30372B]'
            }`}
            aria-label="Wishlist toggle"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleQuickPreview}
            className="p-2 rounded-full bg-white/80 hover:bg-white text-[#171715] hover:text-[#30372B] backdrop-blur-xs transition-colors shadow-xs opacity-0 group-hover:opacity-100 duration-200"
            aria-label="Quick Preview"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={handleRemove}
            className={`p-2 rounded-full backdrop-blur-xs transition-all shadow-xs duration-200 ${
              confirmDelete
                ? 'bg-red-600 text-white scale-110 opacity-100'
                : 'bg-white/80 hover:bg-red-50 text-[#77736D] hover:text-red-600 opacity-0 group-hover:opacity-100'
            }`}
            title={confirmDelete ? 'Click again to confirm removal' : 'Remove from Catalog'}
            aria-label="Remove product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add Overlay on Hover */}
        <div
          className={`absolute bottom-3 inset-x-3 transition-all duration-200 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={handleQuickAdd}
            className="w-full py-2.5 px-4 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>Quick Add to Cart</span>
            <span className="text-[11px] text-[#D8C7B5] font-mono">({selectedSize})</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-[#77736D] mb-1">
            <span className="uppercase tracking-wider text-[11px] font-medium">{product.category}</span>
            <div className="flex items-center gap-1 font-mono text-[11px] text-[#171715]">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{product.rating}</span>
              <span className="text-[#77736D]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h4 className="font-sans font-semibold text-sm text-[#171715] group-hover:text-[#30372B] transition-colors line-clamp-1">
            {product.name}
          </h4>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-1.5 font-mono">
            <span className="text-base font-bold text-[#171715]">
              {formatINR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#77736D] line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Color and Size Selector */}
        <div className="pt-2 border-t border-[#D8C7B5]/20 flex items-center justify-between gap-2">
          {/* Color Dots */}
          <div className="flex items-center gap-1.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(c.name);
                }}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  selectedColor === c.name
                    ? 'ring-2 ring-[#171715] ring-offset-1 scale-110'
                    : 'border-black/20 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                aria-label={`Select color ${c.name}`}
              />
            ))}
          </div>

          {/* Size Pills */}
          <div className="flex items-center gap-1">
            {product.sizes.slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSize(s);
                }}
                className={`px-1.5 py-0.5 text-[10px] font-mono font-medium rounded transition-colors ${
                  selectedSize === s
                    ? 'bg-[#171715] text-white'
                    : 'bg-[#F7F3EE] text-[#77736D] hover:text-[#171715]'
                }`}
              >
                {s}
              </button>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-[10px] font-mono text-[#77736D]">
                +{product.sizes.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
