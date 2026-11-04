import React from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { Heart, ShoppingCart, ArrowRight } from 'lucide-react';

interface WishlistPageProps {
  onSelectProduct: (p: Product) => void;
  onNavigateToShop: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onSelectProduct, onNavigateToShop }) => {
  const { wishlist, products } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-[#D8C7B5]/40 gap-4">
        <div>
          <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
            Saved Garments
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#171715] mt-1">
            My Wishlist
          </h1>
          <p className="text-xs text-[#77736D] mt-1">
            {wishlistedProducts.length} curated {wishlistedProducts.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        <button
          onClick={onNavigateToShop}
          className="text-xs font-bold text-[#171715] hover:text-[#30372B] flex items-center gap-1.5"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-[#D8C7B5]/40 mt-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#F7F3EE] flex items-center justify-center text-[#77736D] mx-auto mb-4">
            <Heart className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="font-display font-bold text-lg text-[#171715]">Your Wishlist is Empty</h3>
          <p className="text-xs text-[#77736D] mt-2 mb-6 max-w-xs mx-auto">
            Save pieces as you explore our minimal everyday essentials and seasonal drops.
          </p>
          <button
            onClick={onNavigateToShop}
            className="py-3 px-8 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase rounded-xl transition-colors"
          >
            Explore Catalogue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {wishlistedProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
