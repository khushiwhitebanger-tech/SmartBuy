import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../common/ProductCard';
import { Product } from '../../types';
import { ArrowRight } from 'lucide-react';

interface BestSellersProps {
  onSelectProduct: (product: Product) => void;
  onViewAll: () => void;
}

export const BestSellers: React.FC<BestSellersProps> = ({ onSelectProduct, onViewAll }) => {
  const { products } = useStore();

  // Grab best sellers or first 8 products
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8);
  const displayItems = bestSellers.length >= 8 ? bestSellers : products.slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 border-t border-[#D8C7B5]/30">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
            Signature Pieces
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171715] mt-1">
            Shop Best Sellers.
          </h2>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-bold uppercase tracking-wider text-[#171715] hover:text-[#30372B] flex items-center gap-1.5 transition-colors group"
        >
          <span>View All Products</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* 8 Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={onSelectProduct}
          />
        ))}
      </div>
    </section>
  );
};
