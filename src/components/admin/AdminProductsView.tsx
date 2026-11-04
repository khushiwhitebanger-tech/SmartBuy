import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  Tag,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AdminProductsView: React.FC = () => {
  const { getAuthHeaders, hasPermission } = useAdminAuth();
  const { formatINR, refreshProducts, showToast } = useStore();

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Modal States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdDept, setNewProdDept] = useState<'men' | 'women' | 'kids'>('men');
  const [newProdCategory, setNewProdCategory] = useState('Hoodies and Sweatshirts');
  const [newProdCollection, setNewProdCollection] = useState('Urban Streetwear');
  const [newProdPrice, setNewProdPrice] = useState('1499');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('2299');
  const [newProdStock, setNewProdStock] = useState('60');
  const [newProdDescription, setNewProdDescription] = useState('Engineered for supreme comfort with heavy brushed fleece cotton.');
  const [newProdColors, setNewProdColors] = useState('Jet Black (#171715), Forest Green (#1C3F2B)');
  const [newProdSizes, setNewProdSizes] = useState('S, M, L, XL, XXL');
  const [newProdImageUrl, setNewProdImageUrl] = useState('/images/hoodies/hoodie_zipper_black.jpeg');

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/products', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setProductsList(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;
    setIsSubmitting(true);

    // Parse colors
    const colorsParsed = newProdColors.split(',').map((c) => {
      const match = c.match(/([^(]+)\s*(?:\(([^)]+)\))?/);
      const name = match ? match[1].trim() : c.trim();
      const hex = match && match[2] ? match[2].trim() : '#171715';
      return { name, hex, image: newProdImageUrl };
    });

    // Parse sizes
    const sizesParsed = newProdSizes.split(',').map((s) => s.trim()).filter(Boolean);

    // Variant stock
    const stockPerVariant = Math.max(5, Math.floor(Number(newProdStock) / Math.max(1, sizesParsed.length * colorsParsed.length)));
    const stockByVariant: Record<string, number> = {};
    sizesParsed.forEach((sz) => {
      colorsParsed.forEach((col) => {
        stockByVariant[`${sz}_${col.name}`] = stockPerVariant;
      });
    });

    const priceNum = Number(newProdPrice);
    const origPriceNum = Number(newProdOriginalPrice) || priceNum;
    const discount = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0;

    const payload = {
      name: newProdName,
      department: newProdDept,
      category: newProdCategory,
      collection: newProdCollection,
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercent: discount,
      totalStock: Number(newProdStock),
      description: newProdDescription,
      colors: colorsParsed,
      sizes: sizesParsed,
      stockByVariant,
      images: [newProdImageUrl],
      features: ['Heavyweight premium fabric', 'Reinforced stitching for durability', 'Comfort stretch fit'],
      fabricCare: '100% Cotton Fleece. Machine wash cold with similar colors.',
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(`Created product: "${newProdName}"`, 'success');
        setIsAddModalOpen(false);
        setNewProdName('');
        await fetchProducts();
        await refreshProducts();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create product', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        showToast(`Updated "${editingProduct.name}"`, 'success');
        setEditingProduct(null);
        await fetchProducts();
        await refreshProducts();
      } else {
        showToast('Failed to update product', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/products/${deleteConfirmProduct.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        showToast(`Product removed from catalog`, 'info');
        setDeleteConfirmProduct(null);
        await fetchProducts();
        await refreshProducts();
      } else {
        showToast('Failed to delete product', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered list
  const filteredProducts = productsList.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || p.department === deptFilter;
    const matchesStock =
      stockFilter === 'all'
        ? true
        : stockFilter === 'low'
        ? p.totalStock <= 25 && p.totalStock > 0
        : stockFilter === 'out'
        ? p.totalStock === 0
        : p.totalStock > 25;

    return matchesSearch && matchesDept && matchesStock;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E1D9] shadow-xs">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#252522]">Product Catalog</h2>
          <p className="text-xs text-[#77736D] mt-0.5">
            Manage apparel SKUs, pricing, variant stocks, and catalog visibility ({productsList.length} total styles)
          </p>
        </div>

        {hasPermission('manage_products') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-2.5 px-4 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add New Style</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8E1D9] shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#77736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, category, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F3EE]/60 border border-[#D8C7B5] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#30372B]"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-[#77736D] font-mono">Dept:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-2 px-3 bg-[#F7F3EE]/60 border border-[#D8C7B5] rounded-xl text-xs font-medium focus:outline-hidden"
          >
            <option value="all">All Departments</option>
            <option value="men">Men's Apparel</option>
            <option value="women">Women's Apparel</option>
            <option value="kids">Kids</option>
          </select>
        </div>

        {/* Stock Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-[#77736D] font-mono">Stock:</span>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="py-2 px-3 bg-[#F7F3EE]/60 border border-[#D8C7B5] rounded-xl text-xs font-medium focus:outline-hidden"
          >
            <option value="all">All Inventory</option>
            <option value="in">In Stock (&gt; 25)</option>
            <option value="low">Low Stock (≤ 25)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#77736D] animate-pulse">Loading product directory...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736D]">
            No products match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F3EE] text-[#77736D] uppercase font-mono text-[10px] tracking-wider border-b border-[#E8E1D9]">
                <tr>
                  <th className="py-3 px-4">Item & Style</th>
                  <th className="py-3 px-4">Department & Category</th>
                  <th className="py-3 px-4">Price / MSRP</th>
                  <th className="py-3 px-4">Variants</th>
                  <th className="py-3 px-4">Total Units</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9]">
                {filteredProducts.map((p) => {
                  const isLow = p.totalStock <= 25 && p.totalStock > 0;
                  const isOut = p.totalStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#F7F3EE]/40 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.colors[0]?.image || p.images[0]}
                            alt={p.name}
                            className="w-12 h-14 object-cover rounded-xl bg-neutral-100 border border-[#E8E1D9] shrink-0"
                          />
                          <div className="max-w-[240px]">
                            <div className="font-bold text-[#252522] line-clamp-1">{p.name}</div>
                            <div className="text-[10px] font-mono text-[#77736D] truncate">{p.id}</div>
                            {p.video && (
                              <span className="inline-block mt-0.5 text-[9px] font-mono bg-emerald-50 text-emerald-800 px-1.5 rounded">
                                ▶ Video Reel
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Dept & Category */}
                      <td className="py-3.5 px-4">
                        <span className="uppercase font-mono text-[10px] font-bold text-[#30372B] bg-[#F7F3EE] px-2 py-0.5 rounded">
                          {p.department}
                        </span>
                        <div className="text-[11px] text-[#77736D] mt-1">{p.category}</div>
                      </td>

                      {/* Price & Discount */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-[#252522]">{formatINR(p.price)}</div>
                        {p.originalPrice > p.price && (
                          <div className="text-[10px] text-[#77736D] line-through">
                            {formatINR(p.originalPrice)}
                          </div>
                        )}
                      </td>

                      {/* Variants: Colors & Sizes */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 mb-1">
                          {p.colors.slice(0, 4).map((c, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                          {p.colors.length > 4 && (
                            <span className="text-[9px] font-mono text-[#77736D]">+{p.colors.length - 4}</span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-[#77736D]">
                          {p.sizes.slice(0, 4).join(', ')}
                        </div>
                      </td>

                      {/* Total Stock */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={isOut ? 'text-red-600' : isLow ? 'text-amber-700' : 'text-[#252522]'}>
                          {p.totalStock} units
                        </span>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isOut
                              ? 'bg-red-100 text-red-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Healthy'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasPermission('manage_products') && (
                            <button
                              onClick={() => setEditingProduct({ ...p })}
                              className="p-1.5 text-[#30372B] hover:bg-[#F7F3EE] rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('manage_products') && (
                            <button
                              onClick={() => setDeleteConfirmProduct(p)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C7B5]/40 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D9] mb-5">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display font-extrabold text-xl text-[#252522]">Add New Apparel Style</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100">
                <X className="w-5 h-5 text-[#77736D]" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavyweight Full-Zip Thermal Fleece Hoodie"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Department</label>
                  <select
                    value={newProdDept}
                    onChange={(e) => setNewProdDept(e.target.value as any)}
                    className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-xs"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Collection</label>
                  <input
                    type="text"
                    required
                    value={newProdCollection}
                    onChange={(e) => setNewProdCollection(e.target.value)}
                    className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">MSRP Price (₹)</label>
                  <input
                    type="number"
                    value={newProdOriginalPrice}
                    onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                    className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Total Stock</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Image URL or Local Path</label>
                <input
                  type="text"
                  value={newProdImageUrl}
                  onChange={(e) => setNewProdImageUrl(e.target.value)}
                  placeholder="/images/hoodies/hoodie_zipper_black.jpeg"
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Colors (Format: Name (#Hex))</label>
                <input
                  type="text"
                  value={newProdColors}
                  onChange={(e) => setNewProdColors(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Sizes (Comma-separated)</label>
                <input
                  type="text"
                  value={newProdSizes}
                  onChange={(e) => setNewProdSizes(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-xs"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E8E1D9]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-5 bg-neutral-100 hover:bg-neutral-200 text-[#171715] rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 bg-[#171715] hover:bg-[#30372B] text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C7B5]/40 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D9] mb-5">
              <h3 className="font-display font-extrabold text-xl text-[#252522]">Edit Apparel Details</h3>
              <button onClick={() => setEditingProduct(null)} className="p-1.5 rounded-lg hover:bg-neutral-100">
                <X className="w-5 h-5 text-[#77736D]" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Total Stock</label>
                  <input
                    type="number"
                    value={editingProduct.totalStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, totalStock: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Category</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E8E1D9]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="py-2 px-4 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-5 bg-[#30372B] hover:bg-[#252522] text-white rounded-xl font-bold shadow-md"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C7B5]/40 text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-display font-extrabold text-xl text-[#252522]">
              Delete "{deleteConfirmProduct.name}"?
            </h3>
            <p className="text-xs text-[#77736D] mt-2 leading-relaxed">
              This action will permanently delete this product and its variants from the live store catalog and database.
            </p>

            <div className="pt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-[#171715] text-xs font-semibold rounded-xl"
              >
                Keep Style
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
