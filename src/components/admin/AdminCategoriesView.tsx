import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStore } from '../../context/StoreContext';
import { CategoryItem, Department } from '../../types';
import {
  Layers,
  Plus,
  Package,
  Tag,
  X,
  Edit3,
  Trash2,
  Archive,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const AdminCategoriesView: React.FC = () => {
  const { getAuthHeaders, hasPermission } = useAdminAuth();
  const { showToast } = useStore();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<Department | 'all'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<Department>('men');
  const [subcategoriesStr, setSubcategoriesStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/categories', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setCategories(json);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDepartment(selectedDept === 'all' ? 'men' : selectedDept);
    setSubcategoriesStr('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDepartment(cat.department);
    setSubcategoriesStr((cat.subcategories || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department) return;

    try {
      setIsSubmitting(true);
      const subcategories = subcategoriesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          department,
          subcategories,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save category');

      showToast(
        editingCategory ? `Category "${name}" updated` : `Category "${name}" added to ${department}`,
        'success'
      );
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'Error saving category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleArchive = async (cat: CategoryItem) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived: !cat.isArchived }),
      });
      if (res.ok) {
        showToast(`Category ${cat.isArchived ? 'restored' : 'archived'}`, 'info');
        fetchCategories();
      }
    } catch {
      showToast('Error modifying category state', 'error');
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        showToast(`Category "${cat.name}" removed`, 'info');
        fetchCategories();
      }
    } catch {
      showToast('Error removing category', 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const list = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setCategories(list);

    try {
      await fetch('/api/admin/categories/reorder', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderedIds: list.map((c) => c.id) }),
      });
    } catch {
      // ignore
    }
  };

  const departmentsList: { key: Department | 'all'; label: string }[] = [
    { key: 'all', label: 'All Departments' },
    { key: 'men', label: 'Men' },
    { key: 'women', label: 'Women' },
    { key: 'kids', label: 'Kids' },
    { key: 'other', label: 'Other' },
  ];

  const filteredCategories = categories.filter((c) => {
    if (selectedDept !== 'all' && c.department !== selectedDept) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E1D9] shadow-xs">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#252522]">Categories Architecture & Taxonomy</h2>
          <p className="text-xs text-[#77736D] mt-0.5">
            Organize catalog departments (Men, Women, Kids, Other), subcategories, navigation sequence, and visibility.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#30372B] hover:bg-[#252522] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Department Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {departmentsList.map((d) => (
          <button
            key={d.key}
            onClick={() => setSelectedDept(d.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedDept === d.key
                ? 'bg-[#30372B] text-white shadow-2xs'
                : 'bg-white text-[#77736D] hover:text-[#252522] border border-[#E8E1D9]'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat, idx) => (
          <div
            key={cat.id}
            className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
              cat.isArchived ? 'border-dashed border-stone-300 opacity-60' : 'border-[#E8E1D9]'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F7F3EE] flex items-center justify-center text-[#30372B]">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#252522] flex items-center gap-1.5">
                      <span>{cat.name}</span>
                      {cat.isArchived && (
                        <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded bg-stone-100 text-[#77736D]">
                          Archived
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#D8C7B5]">
                      {cat.department}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveOrder(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-stone-400 hover:text-[#252522] disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(idx, 'down')}
                    disabled={idx === filteredCategories.length - 1}
                    className="p-1 text-stone-400 hover:text-[#252522] disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subcategories tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(cat.subcategories && cat.subcategories.length > 0) ? (
                  cat.subcategories.map((sub, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F7F3EE] text-[#77736D] border border-[#E8E1D9]"
                    >
                      {sub}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-stone-400 italic">No subcategories defined</span>
                )}
              </div>
            </div>

            {/* Bottom count & Actions */}
            <div className="mt-5 pt-3 border-t border-[#E8E1D9] flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#77736D]">
                <Package className="w-3.5 h-3.5" />
                {cat.productCount} Active SKU{cat.productCount === 1 ? '' : 's'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 text-[#77736D] hover:text-[#252522] rounded-lg hover:bg-stone-100"
                  title="Edit Category"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggleArchive(cat)}
                  className="p-1.5 text-[#77736D] hover:text-amber-800 rounded-lg hover:bg-amber-50"
                  title={cat.isArchived ? 'Restore Category' : 'Archive Category'}
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D9]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#F7F3EE] text-[#30372B] flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#252522]">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <p className="text-xs text-[#77736D]">Catalog navigation and product grouping</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-[#252522] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Linen Shirts or Ethnic Wear"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm font-semibold"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="kids">Kids</option>
                  <option value="other">Other (Accessories, Makeup, Kitchen, Garden, Drops)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">
                  Subcategories (Comma separated)
                </label>
                <textarea
                  rows={2}
                  value={subcategoriesStr}
                  onChange={(e) => setSubcategoriesStr(e.target.value)}
                  placeholder="e.g. Slim Fit, Casual, Formal, Linen"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E1D9] text-[#77736D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#30372B] hover:bg-[#252b22] text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
