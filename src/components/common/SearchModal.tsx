import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToCategory: (cat: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onNavigateToCategory,
}) => {
  const { products, formatINR } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase().trim();
    const matched = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
    setResults(matched);
  }, [query, products]);

  if (!isOpen) return null;

  const popularSearches = ['Heavyweight Tee', 'Linen Shirt', 'Pleated Trousers', 'Sneakers', 'Hoodie', 'Kurta'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#D8C7B5]/40 overflow-hidden text-[#171715]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#D8C7B5]/30 bg-[#F7F3EE]/40">
          <Search className="w-5 h-5 text-[#77736D]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product, category, or fabric (e.g. Linen, Chino, Hoodie)..."
            className="flex-1 bg-transparent border-none text-sm sm:text-base font-medium text-[#171715] placeholder-[#77736D] focus:outline-hidden"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#77736D] hover:text-[#171715] font-semibold px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-[#77736D] hover:text-[#171715] rounded-full"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {!query.trim() ? (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#77736D] uppercase tracking-wider mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-[#30372B]" />
                <span>Popular Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-[#F7F3EE] hover:bg-[#D8C7B5]/40 text-xs font-medium text-[#171715] rounded-lg transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[#D8C7B5]/30">
                <h4 className="text-xs font-bold text-[#77736D] uppercase tracking-wider mb-3">
                  Browse by Department
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Men's Shop", dept: 'men' },
                    { label: "Women's Shop", dept: 'women' },
                    { label: "Kids' Collection", dept: 'kids' },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => {
                        onClose();
                        onNavigateToCategory(cat.dept);
                      }}
                      className="p-3 bg-[#F7F3EE] hover:bg-[#171715] hover:text-white rounded-xl text-xs font-semibold text-center transition-all group"
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-[#77736D] mb-2 font-mono">
                Found {results.length} item{results.length > 1 ? 's' : ''} for "{query}"
              </p>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onClose();
                    onSelectProduct(product);
                  }}
                  className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-[#F7F3EE] transition-colors cursor-pointer group"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-cover rounded-lg bg-neutral-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#77736D] uppercase tracking-wider font-semibold">
                      {product.department} · {product.category}
                    </p>
                    <h5 className="text-sm font-semibold text-[#171715] group-hover:text-[#30372B] truncate">
                      {product.name}
                    </h5>
                    <p className="text-xs font-mono font-bold text-[#171715] mt-0.5">
                      {formatINR(product.price)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#77736D] group-hover:text-[#171715] -translate-x-1 group-hover:translate-x-0 transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-[#171715]">No products found for "{query}"</p>
              <p className="text-xs text-[#77736D] mt-1">Try checking for typos or searching with broader keywords.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
