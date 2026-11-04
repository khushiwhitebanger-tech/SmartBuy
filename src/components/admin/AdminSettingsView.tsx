import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';
import {
  Sliders,
  Truck,
  IndianRupee,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Store,
  KeyRound,
  Database,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Clock,
  X,
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { getAuthHeaders, hasPermission } = useAdminAuth();
  const { settings: storeSettings, formatINR } = useStore();

  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'SMART BUY',
    tagline: 'Modern Elegance & Minimalist Luxury Everyday',
    supportEmail: 'care@smartbuy.in',
    supportPhone: '+91 98100 24888',
    supportAddress: 'Plot 42, Udyog Vihar Phase 4, Gurugram, Haryana 122016, India',
    freeShippingThreshold: 999,
    standardShippingFee: 99,
    codAvailable: true,
    codFee: 49,
    returnWindowDays: 14,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Supabase Database Connection States
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [isSavingSupabase, setIsSavingSupabase] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [supabaseMessage, setSupabaseMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [sqlContent, setSqlContent] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const canEdit = hasPermission('manage_settings');

  const fetchSupabaseStatus = async () => {
    try {
      const res = await fetch('/api/admin/supabase/status', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(data);
      }
    } catch {
      // ignore
    }
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/settings', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else if (storeSettings) {
        setSettings(storeSettings);
      }
    } catch {
      if (storeSettings) setSettings(storeSettings);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchSupabaseStatus();
  }, []);

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseKeyInput.trim()) {
      setSupabaseMessage({ text: 'Please enter your Supabase anon or service-role API key.', type: 'error' });
      return;
    }

    try {
      setIsSavingSupabase(true);
      setSupabaseMessage(null);

      const res = await fetch('/api/admin/supabase/config', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: supabaseKeyInput.trim(),
          url: 'https://rklirclpraqilpcdkpwi.supabase.co',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSupabaseMessage({
          text: data.testResult?.success
            ? `Connected to Supabase! ${data.syncResult ? `${data.syncResult.synced} existing orders synced.` : ''}`
            : data.testResult?.message || 'API key saved successfully!',
          type: data.testResult?.success ? 'success' : 'info',
        });
        setSupabaseKeyInput('');
        await fetchSupabaseStatus();
      } else {
        setSupabaseMessage({ text: data.error || 'Failed to update Supabase configuration', type: 'error' });
      }
    } catch (err: any) {
      setSupabaseMessage({ text: err.message || 'Network error saving configuration', type: 'error' });
    } finally {
      setIsSavingSupabase(false);
    }
  };

  const handleTestSupabase = async () => {
    try {
      setIsTestingSupabase(true);
      setSupabaseMessage(null);
      await fetchSupabaseStatus();
      const res = await fetch('/api/admin/supabase/status', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setSupabaseStatus(data);
      if (data.test?.success) {
        setSupabaseMessage({ text: data.test.message, type: 'success' });
      } else {
        setSupabaseMessage({ text: data.test?.message || 'Connection test failed. Check key.', type: 'error' });
      }
    } catch (err: any) {
      setSupabaseMessage({ text: err.message || 'Test failed', type: 'error' });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleSyncOrders = async () => {
    try {
      setIsSyncingSupabase(true);
      setSupabaseMessage(null);

      const res = await fetch('/api/admin/supabase/sync', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.success) {
        setSupabaseMessage({
          text: `Success! Synchronized ${data.syncedCount} orders to your Supabase tables.`,
          type: 'success',
        });
        await fetchSupabaseStatus();
      } else {
        setSupabaseMessage({
          text: data.errors?.[0] || 'Sync completed with warnings. Ensure orders table exists in Supabase.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setSupabaseMessage({ text: err.message || 'Sync failed', type: 'error' });
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleLoadSql = async () => {
    try {
      const res = await fetch('/api/admin/supabase/sql', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSqlContent(data.sql);
      }
    } catch {
      // ignore
    }
    setShowSqlModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setErrorMessage('You do not have permission to alter store configuration settings.');
      return;
    }

    try {
      setIsSaving(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update settings');
      }

      const resData = await res.json();
      setSettings(resData.settings);
      setSuccessMessage('Store operational settings updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E1D9]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#252522]">Store Configuration & Policies</h1>
          <p className="text-sm text-[#77736D] mt-1">
            Manage global checkout rules, Delhivery fulfillment thresholds, COD fees, and customer support channels.
          </p>
        </div>
        {!canEdit && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            View-Only Mode (Super Admin Required to Modify)
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Core Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping & Delivery Policies */}
          <div className="bg-white rounded-2xl border border-[#E8E1D9] p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E8E1D9]">
              <div className="w-10 h-10 rounded-xl bg-[#F7F3EE] flex items-center justify-center text-[#30372B]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#252522]">Shipping & Logistics Rules</h2>
                <p className="text-xs text-[#77736D]">Control customer delivery fees and cart free-shipping qualify triggers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252522] uppercase tracking-wider mb-2">
                  Free Shipping Threshold (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#77736D]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    disabled={!canEdit}
                    value={settings.freeShippingThreshold}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E8E1D9] text-sm text-[#252522] bg-[#FDFBF7] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#30372B]/20 focus:border-[#30372B] disabled:opacity-60"
                  />
                </div>
                <p className="text-xs text-[#77736D] mt-1.5">
                  Orders equal or above this cart value automatically get Free Delivery.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252522] uppercase tracking-wider mb-2">
                  Standard Flat Shipping Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#77736D]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    disabled={!canEdit}
                    value={settings.standardShippingFee}
                    onChange={(e) => setSettings({ ...settings, standardShippingFee: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E8E1D9] text-sm text-[#252522] bg-[#FDFBF7] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#30372B]/20 focus:border-[#30372B] disabled:opacity-60"
                  />
                </div>
                <p className="text-xs text-[#77736D] mt-1.5">
                  Applied on express surface shipments below the free threshold.
                </p>
              </div>
            </div>

            {/* COD Settings */}
            <div className="pt-4 border-t border-[#E8E1D9] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#252522]">Cash on Delivery (COD)</h3>
                  <p className="text-xs text-[#77736D]">Allow buyers across India to pay cash upon doorstep package handover</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={settings.codAvailable}
                    onChange={(e) => setSettings({ ...settings, codAvailable: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#30372B]"></div>
                </label>
              </div>

              {settings.codAvailable && (
                <div>
                  <label className="block text-xs font-semibold text-[#252522] uppercase tracking-wider mb-2">
                    COD Handling Surcharge (₹)
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#77736D]">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      disabled={!canEdit}
                      value={settings.codFee}
                      onChange={(e) => setSettings({ ...settings, codFee: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E8E1D9] text-sm text-[#252522] bg-[#FDFBF7] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#30372B]/20 focus:border-[#30372B] disabled:opacity-60"
                    />
                  </div>
                  <p className="text-xs text-[#77736D] mt-1.5">
                    Covers verification OTP SMS and cash transit courier surcharge.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Returns & Exchanges Policy */}
          <div className="bg-white rounded-2xl border border-[#E8E1D9] p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E8E1D9]">
              <div className="w-10 h-10 rounded-xl bg-[#F7F3EE] flex items-center justify-center text-[#30372B]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#252522]">Returns & Guarantee Window</h2>
                <p className="text-xs text-[#77736D]">Set customer satisfaction guarantee timeframes</p>
              </div>
            </div>

            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-[#252522] uppercase tracking-wider mb-2">
                Hassle-Free Return Window (Days)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                disabled={!canEdit}
                value={settings.returnWindowDays}
                onChange={(e) => setSettings({ ...settings, returnWindowDays: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D9] text-sm text-[#252522] bg-[#FDFBF7] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#30372B]/20 focus:border-[#30372B] disabled:opacity-60"
              />
              <p className="text-xs text-[#77736D] mt-1.5">
                Eligible for reverse pickup by Delhivery after package delivery confirmation.
              </p>
            </div>
          </div>

          {/* Brand & Support Information */}
          <div className="bg-white rounded-2xl border border-[#E8E1D9] p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E8E1D9]">
              <div className="w-10 h-10 rounded-xl bg-[#F7F3EE] flex items-center justify-center text-[#30372B]">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#252522]">Customer Support & Contact Info</h2>
                <p className="text-xs text-[#77736D]">Displayed in order receipts, packing slips, and storefront footer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252522] uppercase tracking-wider mb-2">
                  Official Store Name
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D9] text-sm text-[#252522] bg-[#FDFBF7] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#30372B]/20 focus:border-[#30372B] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252522] uppercase tracking-wider mb-2">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D9] text-sm text-[#252522] bg-[#FDFBF7] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#30372B]/20 focus:border-[#30372B] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252522] uppercase tracking-wider mb-2">
                  Support Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#77736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled={!canEdit}
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E1D9] text-sm text-[#252522] bg-[#FDFBF7] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#30372B]/20 focus:border-[#30372B] disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252522] uppercase tracking-wider mb-2">
                  Customer Care Helpline
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#77736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E1D9] text-sm text-[#252522] bg-[#FDFBF7] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#30372B]/20 focus:border-[#30372B] disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252522] uppercase tracking-wider mb-2">
                Fulfillment Facility & Dispatch Hub Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#77736D] absolute left-3.5 top-3.5" />
                <textarea
                  rows={2}
                  disabled={!canEdit}
                  value={settings.supportAddress}
                  onChange={(e) => setSettings({ ...settings, supportAddress: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E1D9] text-sm text-[#252522] bg-[#FDFBF7] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#30372B]/20 focus:border-[#30372B] disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          {canEdit && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={fetchSettings}
                className="px-5 py-2.5 rounded-xl border border-[#E8E1D9] text-xs font-semibold text-[#77736D] hover:text-[#252522] hover:bg-stone-100 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Changes
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#30372B] text-white text-xs font-semibold hover:bg-[#252b22] transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving Configurations...' : 'Save All Settings'}
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Supabase DB, Logistics & Security Status */}
        <div className="space-y-6">
          {/* Supabase Cloud Database Integration Panel */}
          <div className="bg-[#171715] text-stone-200 rounded-2xl p-6 shadow-md border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#D8C7B5]">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Supabase Cloud Database</h3>
              </div>
              {supabaseStatus?.test?.success ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active & Synced
                </span>
              ) : supabaseStatus?.config?.hasKey ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/60">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Key Saved / Verify
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/60">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Key Required
                </span>
              )}
            </div>

            <div className="bg-stone-900/80 rounded-xl p-3 border border-stone-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-400">
                <span>Project Ref:</span>
                <span className="font-mono text-white bg-stone-800 px-2 py-0.5 rounded text-[11px]">
                  rklirclpraqilpcdkpwi
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>API Endpoint:</span>
                <span className="font-mono text-stone-300 text-[11px] truncate max-w-[200px]" title="https://rklirclpraqilpcdkpwi.supabase.co">
                  https://rklirclpraqilpcdkpwi...
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>Database Sync:</span>
                <span className="font-mono text-stone-300 text-[11px]">
                  {supabaseStatus?.localOrderCount ?? 0} local | {supabaseStatus?.supabaseOrderCount ?? 0} Supabase
                </span>
              </div>
            </div>

            {/* Supabase Key Input */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider">
                Supabase API Key (Anon or Service Role)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder={supabaseStatus?.config?.hasKey ? '•••••••••••••••••••••••• (Active)' : 'Paste eyJhbGciOi... key here'}
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-hidden focus:ring-1 focus:ring-[#D8C7B5]"
                />
                <button
                  type="button"
                  onClick={handleSaveSupabaseConfig}
                  disabled={isSavingSupabase || !supabaseKeyInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-[#30372B] hover:bg-[#252b22] text-white text-xs font-semibold disabled:opacity-40 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isSavingSupabase ? 'Saving...' : 'Save Key'}
                </button>
              </div>
              <p className="text-[10px] text-stone-400">
                Found in Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys (<code className="text-[#D8C7B5]">anon public</code> or <code className="text-[#D8C7B5]">service_role</code>).
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={isTestingSupabase}
                className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin text-emerald-400' : ''}`} />
                <span>{isTestingSupabase ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncOrders}
                disabled={isSyncingSupabase}
                className="py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium border border-emerald-800/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isSyncingSupabase ? 'Syncing...' : 'Sync Orders'}</span>
              </button>
            </div>

            {/* SQL Script & Dashboard Links */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
              <button
                type="button"
                onClick={handleLoadSql}
                className="text-[#D8C7B5] hover:text-white flex items-center gap-1 text-[11px] font-medium cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>View SQL Schema</span>
              </button>

              <a
                href="https://supabase.com/dashboard/project/rklirclpraqilpcdkpwi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-white flex items-center gap-1 text-[11px]"
              >
                <span>Open Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Feedback Message */}
            {supabaseMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                  supabaseMessage.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : supabaseMessage.type === 'error'
                    ? 'bg-red-950/40 border-red-800/60 text-red-300'
                    : 'bg-stone-900 border-stone-700 text-stone-300'
                }`}
              >
                {supabaseMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{supabaseMessage.text}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E1D9] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-[#252522] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#30372B]" />
              Enterprise Security Enforcements
            </h3>
            <ul className="text-xs text-[#77736D] space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Server-side RBAC:</strong> Every setting modification is signed with your bearer token and recorded to the immutable audit log.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Brute-Force Lockout:</strong> Maximum 5 failed login attempts before 15-minute IP/account rate limit lockdown.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Session Expiry:</strong> 12-hour rotating token expiration with automatic storefront isolation.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-[#171715] text-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#D8C7B5]">
              <Truck className="w-4 h-4" />
              <h3 className="text-sm font-semibold">Delhivery Logistics Integration</h3>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Automated surface and express shipment tracking is linked directly to Delhivery API v2. AWB numbers generated in Orders will update tracking timelines in real time.
            </p>
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <span>Carrier Status</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Operational
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Supabase SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-[#E8E1D9] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D9]">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#30372B]" />
                <h3 className="font-semibold text-base text-[#252522]">Supabase SQL Schema</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1 rounded-lg text-[#77736D] hover:text-[#252522] hover:bg-[#F7F3EE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#77736D] leading-relaxed">
              If your Supabase project (<strong>rklirclpraqilpcdkpwi</strong>) does not have the tables yet, run this query once in your <strong>Supabase SQL Editor</strong>:
            </p>

            <div className="relative">
              <pre className="p-4 bg-[#171715] text-[#D8C7B5] rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed border border-stone-800">
                {sqlContent || 'Loading SQL schema...'}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sqlContent);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2500);
                }}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium border border-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-300" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://supabase.com/dashboard/project/rklirclpraqilpcdkpwi/sql"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#30372B] hover:underline flex items-center gap-1"
              >
                <span>Open Supabase SQL Editor</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2 rounded-xl bg-[#30372B] text-white text-xs font-semibold hover:bg-[#252b22] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
