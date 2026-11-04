import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStore } from '../../context/StoreContext';
import { CollectionItem } from '../../types';
import { Sparkles, Plus, Image, Check, X } from 'lucide-react';

export const AdminCollectionsView: React.FC = () => {
  const { getAuthHeaders, hasPermission } = useAdminAuth();
  const { showToast } = useStore();

  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState('/images/hoodies/hoodie_zipper_black.jpeg');

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/collections', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setCollections(json);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleToggleFeatured = (id: string) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFeatured: !c.isFeatured } : c))
    );
    showToast('Collection featured status updated', 'info');
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const newCol: CollectionItem = {
      id: `col-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description || `Curated ${name} apparel line.`,
      productCount: 0,
      isFeatured: true,
      bannerImage,
    };
    setCollections([...collections, newCol]);
    showToast(`Collection "${name}" created`, 'success');
    setIsAddModalOpen(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E1D9] shadow-xs">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#252522]">Curated Collections</h2>
          <p className="text-xs text-[#77736D] mt-0.5">
            Editorial thematic collections, homepage banners, and seasonal showcases
          </p>
        </div>

        {hasPermission('manage_collections') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-2.5 px-4 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Create Collection</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => (
          <div
            key={col.id}
            className="bg-[#FFFFFF] rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/9 w-full bg-neutral-100 overflow-hidden">
                <img
                  src={col.bannerImage || '/src/assets/images/category_urban_streetwear_1792250236285.jpg'}
                  alt={col.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      col.isFeatured
                        ? 'bg-[#171715] text-white shadow-xs'
                        : 'bg-white/80 text-[#77736D]'
                    }`}
                  >
                    {col.isFeatured ? 'Featured on Home' : 'Standard'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-bold text-lg text-[#252522]">{col.name}</h3>
                  <span className="text-xs font-mono font-bold text-[#30372B]">
                    {col.productCount} styles
                  </span>
                </div>
                <p className="text-xs text-[#77736D] line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-[#E8E1D9]/40 mt-2 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#77736D]">Slug: /{col.slug}</span>
              {hasPermission('manage_collections') && (
                <button
                  onClick={() => handleToggleFeatured(col.id)}
                  className={`text-xs font-bold py-1 px-3 rounded-lg border transition-colors ${
                    col.isFeatured
                      ? 'border-[#171715] text-[#171715] hover:bg-neutral-100'
                      : 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {col.isFeatured ? 'Unpin' : 'Pin to Home'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE COLLECTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C7B5]/40 text-left">
            <h3 className="font-display font-extrabold text-xl text-[#252522] mb-1">New Collection</h3>
            <p className="text-xs text-[#77736D] mb-4">Create an editorial showcase collection</p>

            <form onSubmit={handleCreateCollection} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Collection Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Resort & Summer Linens"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Curated breathable essentials..."
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#77736D] uppercase font-mono mb-1">Banner Image Path</label>
                <input
                  type="text"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 px-4 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-[#171715] hover:bg-[#30372B] text-white rounded-xl font-bold shadow-md"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
