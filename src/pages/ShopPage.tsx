import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { Product, Department } from '../types';
import { SlidersHorizontal, Grid, List, X, Search, RotateCcw } from 'lucide-react';

interface ShopPageProps {
  initialDepartment?: Department | 'all';
  initialCategory?: string;
  initialCollection?: string;
  initialFilter?: string;
  onSelectProduct: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialDepartment = 'all',
  initialCategory = 'all',
  initialCollection = 'all',
  initialFilter = 'all',
  onSelectProduct,
}) => {
  const { products, formatINR } = useStore();

  // Filters state
  const [selectedDept, setSelectedDept] = useState<Department | 'all'>(initialDepartment);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollection);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>(
    initialFilter === 'new_arrivals' ? 'newest' : initialFilter === 'best_sellers' ? 'popularity' : 'featured'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [itemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all categories, collections, sizes, colors from current products
  const availableCategories = useMemo(() => {
    const list = products
      .filter((p) => selectedDept === 'all' || p.department === selectedDept)
      .map((p) => p.category);
    return ['all', ...Array.from(new Set(list))];
  }, [products, selectedDept]);

  const availableCollections = useMemo(() => {
    const list = products.map((p) => p.collection);
    return ['all', ...Array.from(new Set(list))];
  }, [products]);

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return ['all', ...Array.from(set)];
  }, [products]);

  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => map.set(c.name, c.hex)));
    return Array.from(map.entries());
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Department
      if (selectedDept !== 'all' && p.department !== selectedDept) return false;
      // Category
      if (selectedCategory !== 'all') {
        const cat = p.category.toLowerCase();
        const sel = selectedCategory.toLowerCase();
        const matchesCategory =
          cat === sel ||
          (sel === 'pants and joggers' && (cat.includes('cargo') || cat.includes('pant') || cat.includes('jogger'))) ||
          (sel === 'cargo pants' && (cat.includes('cargo') || p.name.toLowerCase().includes('cargo'))) ||
          (sel === 't-shirts' && (cat.includes('t-shirt') || cat.includes('polo') || cat.includes('v-neck') || p.name.toLowerCase().includes('t-shirt') || p.name.toLowerCase().includes('polo') || p.name.toLowerCase().includes('v-neck'))) ||
          (sel === 'v-neck t-shirts' && (cat.includes('v-neck') || p.name.toLowerCase().includes('v-neck') || p.name.toLowerCase().includes('johnny'))) ||
          (sel === 'polo t-shirts' && (cat.includes('polo') || p.name.toLowerCase().includes('polo'))) ||
          (sel === 'checked shirts' && (cat.includes('shirt') && (p.name.toLowerCase().includes('check') || p.name.toLowerCase().includes('plaid')))) ||
          (sel === 'striped shirts' && (cat.includes('shirt') && (p.name.toLowerCase().includes('stripe') || p.name.toLowerCase().includes('pinstripe')))) ||
          (sel === 'co-ord sets' && (cat.includes('co-ord') || cat.includes('coord') || p.name.toLowerCase().includes('co-ord') || p.name.toLowerCase().includes('set'))) ||
          (sel === 'ethnic wear' && (cat.includes('ethnic') || p.name.toLowerCase().includes('kurti') || p.name.toLowerCase().includes('pakistani'))) ||
          ((sel.includes('hoodie') || sel.includes('sweatshirt')) && (cat.includes('hoodie') || cat.includes('sweatshirt') || p.name.toLowerCase().includes('hoodie')));
        if (!matchesCategory) return false;
      }
      // Collection
      if (selectedCollection !== 'all' && p.collection.toLowerCase() !== selectedCollection.toLowerCase()) return false;
      // Special filter
      if (initialFilter === 'offers' && p.discountPercent <= 0) return false;
      if (initialFilter === 'best_sellers' && !p.isBestSeller) return false;
      if (initialFilter === 'new_arrivals' && !p.isNewArrival) return false;
      // Size
      if (selectedSize !== 'all' && !p.sizes.includes(selectedSize)) return false;
      // Color
      if (selectedColor !== 'all' && !p.colors.some((c) => c.name.toLowerCase() === selectedColor.toLowerCase())) return false;
      // Price
      if (p.price > maxPrice) return false;
      // Rating
      if (p.rating < minRating) return false;
      // Stock
      if (inStockOnly && p.totalStock <= 0) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      // popularity default
      return (b.reviewCount * b.rating) - (a.reviewCount * a.rating);
    });
  }, [
    products,
    selectedDept,
    selectedCategory,
    selectedCollection,
    initialFilter,
    selectedSize,
    selectedColor,
    maxPrice,
    minRating,
    inStockOnly,
    searchQuery,
    sortBy,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(0, currentPage * itemsPerPage);

  const handleResetFilters = () => {
    setSelectedDept('all');
    setSelectedCategory('all');
    setSelectedCollection('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setMaxPrice(5000);
    setMinRating(0);
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('featured');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedDept !== 'all' ||
    selectedCategory !== 'all' ||
    selectedCollection !== 'all' ||
    selectedSize !== 'all' ||
    selectedColor !== 'all' ||
    maxPrice < 5000 ||
    minRating > 0 ||
    inStockOnly ||
    searchQuery !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title & Department Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#D8C7B5]/40 gap-6">
        <div>
          <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
            Curated Catalogue
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#171715] mt-1 capitalize">
            {selectedDept === 'all' ? 'All Collections' : `${selectedDept}'s Wardrobe`}
          </h1>
          <p className="text-xs text-[#77736D] mt-1.5">
            Showing <strong className="font-mono text-[#171715]">{filteredProducts.length}</strong> thoughtfully crafted garments
          </p>
        </div>

        {/* Department Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFFFFF] rounded-xl border border-[#D8C7B5]/40 shadow-xs">
          {(['all', 'men', 'women', 'kids'] as const).map((dept) => (
            <button
              key={dept}
              onClick={() => {
                setSelectedDept(dept);
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-colors ${
                selectedDept === dept
                  ? 'bg-[#171715] text-[#FFFFFF] shadow-xs'
                  : 'text-[#77736D] hover:text-[#171715]'
              }`}
            >
              {dept === 'all' ? 'All' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar: Search input, Sort Dropdown, View Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-b border-[#D8C7B5]/30">
        <div className="flex items-center gap-3 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword..."
              className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#D8C7B5] rounded-xl text-xs font-medium focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#77736D]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 py-2 px-3.5 bg-white border border-[#D8C7B5] rounded-xl text-xs font-semibold text-[#171715]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#30372B]" />}
          </button>

          {/* Sort By */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#77736D]">
            <span className="hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-3 bg-white border border-[#D8C7B5] rounded-xl text-xs font-semibold text-[#171715] focus:outline-hidden cursor-pointer"
            >
              <option value="featured">Popularity</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-white border border-[#D8C7B5] rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#171715] text-white' : 'text-[#77736D]'}`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#171715] text-white' : 'text-[#77736D]'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8C7B5]/40">
            <span className="text-xs font-bold uppercase tracking-wider text-[#171715]">Refine By</span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-[#77736D] hover:text-[#171715] flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-[#171715] uppercase tracking-wider mb-2.5">
              Category
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 text-xs">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center justify-between w-full py-1 text-left transition-colors ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'font-bold text-[#171715]'
                      : 'text-[#77736D] hover:text-[#171715]'
                  }`}
                >
                  <span className="capitalize">{cat === 'all' ? 'All Categories' : cat}</span>
                  {selectedCategory.toLowerCase() === cat.toLowerCase() && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#30372B]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Collection Filter */}
          <div className="pt-4 border-t border-[#D8C7B5]/30">
            <label className="block text-xs font-bold text-[#171715] uppercase tracking-wider mb-2.5">
              Collection
            </label>
            <div className="space-y-1.5 text-xs">
              {availableCollections.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedCollection(col)}
                  className={`flex items-center justify-between w-full py-1 text-left transition-colors ${
                    selectedCollection === col ? 'font-bold text-[#171715]' : 'text-[#77736D] hover:text-[#171715]'
                  }`}
                >
                  <span>{col === 'all' ? 'All Collections' : col}</span>
                  {selectedCollection === col && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#30372B]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-4 border-t border-[#D8C7B5]/30">
            <div className="flex items-center justify-between text-xs font-bold text-[#171715] uppercase tracking-wider mb-2">
              <span>Max Price</span>
              <span className="font-mono text-[#30372B]">{formatINR(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="200"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#171715] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#77736D] mt-1">
              <span>₹500</span>
              <span>₹5,000</span>
            </div>
          </div>

          {/* Size Filter */}
          <div className="pt-4 border-t border-[#D8C7B5]/30">
            <label className="block text-xs font-bold text-[#171715] uppercase tracking-wider mb-2.5">
              Size
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`min-w-8 py-1 px-2 text-[11px] font-mono rounded border transition-colors ${
                    selectedSize === s
                      ? 'bg-[#171715] text-white border-[#171715]'
                      : 'bg-white text-[#77736D] border-[#D8C7B5] hover:text-[#171715]'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="pt-4 border-t border-[#D8C7B5]/30">
            <label className="block text-xs font-bold text-[#171715] uppercase tracking-wider mb-2.5">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedColor('all')}
                className={`text-[11px] px-2 py-0.5 rounded border ${
                  selectedColor === 'all' ? 'bg-[#171715] text-white' : 'bg-white text-[#77736D]'
                }`}
              >
                All
              </button>
              {availableColors.map(([name, hex]) => (
                <button
                  key={name}
                  onClick={() => setSelectedColor(name)}
                  className={`w-5 h-5 rounded-full border transition-transform ${
                    selectedColor === name ? 'ring-2 ring-[#171715] ring-offset-1 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: hex }}
                  title={name}
                  aria-label={name}
                />
              ))}
            </div>
          </div>

          {/* Stock Availability Toggle */}
          <div className="pt-4 border-t border-[#D8C7B5]/30">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#171715]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#171715] accent-[#171715]"
              />
              <span>In-Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-9">
          {displayedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#D8C7B5]/30">
              <h3 className="font-display font-bold text-lg text-[#171715]">No garments matched your criteria</h3>
              <p className="text-xs text-[#77736D] mt-1.5 mb-6">
                Try widening your price limit or clearing active size and color filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="py-2.5 px-6 bg-[#171715] text-white text-xs font-semibold rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-2xl border border-[#D8C7B5]/30 hover:border-[#171715]/30 transition-all cursor-pointer group"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full sm:w-44 aspect-4/3 sm:aspect-square object-cover rounded-xl bg-[#F7F3EE]"
                  />
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#77736D] mb-1">
                        <span className="uppercase tracking-wider font-semibold">
                          {product.department} · {product.category}
                        </span>
                        <span className="font-mono text-[11px] text-[#171715]">★ {product.rating} ({product.reviewCount})</span>
                      </div>
                      <h3 className="font-display font-bold text-base text-[#171715] group-hover:text-[#30372B] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#77736D] mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#D8C7B5]/20">
                      <div className="flex items-baseline gap-2 font-mono">
                        <span className="text-lg font-bold text-[#171715]">{formatINR(product.price)}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-[#77736D] line-through">{formatINR(product.originalPrice)}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#171715] group-hover:text-[#30372B]">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Pagination */}
          {displayedProducts.length < filteredProducts.length && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="py-3 px-8 bg-white border border-[#D8C7B5] hover:border-[#171715] text-[#171715] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
              >
                Load More Pieces ({filteredProducts.length - displayedProducts.length} Remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#D8C7B5]">
                <h3 className="font-display font-bold text-base text-[#171715]">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-6 text-left">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#171715] mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 bg-[#F7F3EE] rounded-lg text-xs"
                  >
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase mb-2">
                    <span>Max Price</span>
                    <span className="font-mono">{formatINR(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="200"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#171715]"
                  />
                </div>

                {/* In Stock */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 accent-[#171715]"
                    />
                    <span>In-Stock Only</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#D8C7B5] space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#171715] text-white text-xs font-bold uppercase rounded-xl"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2 text-xs font-semibold text-[#77736D]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
