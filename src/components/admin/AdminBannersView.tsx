import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { HomepageBanner } from '../../types';
import {
  Layers,
  Image as ImageIcon,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const AdminBannersView: React.FC = () => {
  const { getAuthHeaders, hasPermission } = useAdminAuth();

  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HomepageBanner | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [promoBadge, setPromoBadge] = useState('');
  const [desktopImage, setDesktopImage] = useState('');
  const [primaryButtonText, setPrimaryButtonText] = useState('Shop Men');
  const [primaryButtonLink, setPrimaryButtonLink] = useState('/shop?department=men');
  const [secondaryButtonText, setSecondaryButtonText] = useState('Shop Women');
  const [secondaryButtonLink, setSecondaryButtonLink] = useState('/shop?department=women');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/homepage-banners', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setTagline('SPRING EDIT 2026');
    setPromoBadge('FEATURED DROP');
    setDesktopImage('/src/assets/images/hero_fashion_editorial_1792250234088.jpg');
    setPrimaryButtonText('Shop Men');
    setPrimaryButtonLink('/shop?department=men');
    setSecondaryButtonText('Shop Women');
    setSecondaryButtonLink('/shop?department=women');
    setIsModalOpen(true);
  };

  const openEditModal = (banner: HomepageBanner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setTagline(banner.tagline);
    setPromoBadge(banner.promoBadge || '');
    setDesktopImage(banner.desktopImage);
    setPrimaryButtonText(banner.primaryButtonText);
    setPrimaryButtonLink(banner.primaryButtonLink);
    setSecondaryButtonText(banner.secondaryButtonText);
    setSecondaryButtonLink(banner.secondaryButtonLink);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        title,
        subtitle,
        tagline,
        promoBadge,
        desktopImage,
        primaryButtonText,
        primaryButtonLink,
        secondaryButtonText,
        secondaryButtonLink,
      };

      const url = editingBanner
        ? `/api/admin/homepage-banners/${editingBanner.id}`
        : '/api/admin/homepage-banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save banner');

      setNotification({
        type: 'success',
        message: editingBanner ? 'Hero banner updated successfully!' : 'New hero banner published to homepage!',
      });
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (banner: HomepageBanner) => {
    try {
      const res = await fetch(`/api/admin/homepage-banners/${banner.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (res.ok) {
        setNotification({ type: 'success', message: `Banner visibility toggled.` });
        fetchBanners();
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (banner: HomepageBanner) => {
    if (!confirm(`Delete banner "${banner.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/homepage-banners/${banner.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setNotification({ type: 'success', message: 'Banner removed.' });
        fetchBanners();
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E1D9]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#252522]">Homepage & Hero Campaign Banners</h1>
          <p className="text-sm text-[#77736D] mt-1">
            Configure visual marketing banners, headlines, seasonal campaigns, and call-to-action destinations.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#30372B] hover:bg-[#252b22] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Hero Banner</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`bg-white rounded-2xl border overflow-hidden shadow-xs transition-all flex flex-col ${
              banner.isActive ? 'border-[#E8E1D9]' : 'border-dashed border-stone-300 opacity-70'
            }`}
          >
            {/* Banner Preview Image */}
            <div className="relative h-48 bg-stone-900 overflow-hidden">
              <img
                src={banner.desktopImage}
                alt={banner.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                {banner.promoBadge && (
                  <span className="self-start mb-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#30372B] text-[#D8C7B5] border border-[#D8C7B5]/30">
                    {banner.promoBadge}
                  </span>
                )}
                <span className="text-[10px] font-mono tracking-widest text-[#D8C7B5] uppercase">
                  {banner.tagline}
                </span>
                <h3 className="text-xl font-serif font-bold text-white leading-tight">
                  {banner.title}
                </h3>
              </div>
            </div>

            {/* Content & Actions */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-[#77736D] line-clamp-2 leading-relaxed">
                {banner.subtitle}
              </p>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-stone-100 font-semibold text-[#252522]">
                  CTA 1: {banner.primaryButtonText}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-stone-100 font-semibold text-[#77736D]">
                  CTA 2: {banner.secondaryButtonText}
                </span>
              </div>

              <div className="pt-3 border-t border-[#E8E1D9] flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    banner.isActive
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-stone-500 bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  {banner.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{banner.isActive ? 'Live on Store' : 'Hidden'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-1.5 text-[#77736D] hover:text-[#252522] rounded-lg hover:bg-stone-100"
                    title="Edit Banner"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D9] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#F7F3EE] text-[#30372B] flex items-center justify-center font-bold">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#252522]">
                    {editingBanner ? 'Edit Homepage Banner' : 'Create Hero Campaign Banner'}
                  </h3>
                  <p className="text-xs text-[#77736D]">Directly controls the top hero experience on SMART BUY</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-[#252522] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Main Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Style That Speaks"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Subtitle / Copy</label>
                <textarea
                  rows={2}
                  required
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. High-comfort winter essentials and modern tailoring crafted for the discerning individual."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Season Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. SPRING EDIT 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Badge Tag</label>
                  <input
                    type="text"
                    value={promoBadge}
                    onChange={(e) => setPromoBadge(e.target.value)}
                    placeholder="e.g. NEW ARRIVAL"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Desktop Banner Image Path / URL</label>
                <input
                  type="text"
                  required
                  value={desktopImage}
                  onChange={(e) => setDesktopImage(e.target.value)}
                  placeholder="/src/assets/images/hero_fashion_editorial_1792250234088.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522] text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8E1D9]">
                <div>
                  <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Primary Button Text</label>
                  <input
                    type="text"
                    value={primaryButtonText}
                    onChange={(e) => setPrimaryButtonText(e.target.value)}
                    placeholder="Shop Men"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Primary Link</label>
                  <input
                    type="text"
                    value={primaryButtonLink}
                    onChange={(e) => setPrimaryButtonLink(e.target.value)}
                    placeholder="/shop?department=men"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Secondary Button Text</label>
                  <input
                    type="text"
                    value={secondaryButtonText}
                    onChange={(e) => setSecondaryButtonText(e.target.value)}
                    placeholder="Shop Women"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252522] mb-1 uppercase tracking-wider">Secondary Link</label>
                  <input
                    type="text"
                    value={secondaryButtonLink}
                    onChange={(e) => setSecondaryButtonLink(e.target.value)}
                    placeholder="/shop?department=women"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D9] bg-[#FDFBF7] text-[#252522]"
                  />
                </div>
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
                  {isSubmitting ? 'Saving...' : editingBanner ? 'Save Changes' : 'Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
