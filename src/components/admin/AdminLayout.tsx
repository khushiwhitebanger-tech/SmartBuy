import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  LayoutDashboard,
  Shirt,
  Tags,
  Layers,
  ShoppingBag,
  Boxes,
  Users,
  Ticket,
  Sliders,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Bell,
  Search,
  ChevronDown,
  UserCheck,
  RefreshCw,
  Image as ImageIcon,
  CreditCard,
} from 'lucide-react';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminProductsView } from './AdminProductsView';
import { AdminCategoriesView } from './AdminCategoriesView';
import { AdminCollectionsView } from './AdminCollectionsView';
import { AdminOrdersView } from './AdminOrdersView';
import { AdminInventoryView } from './AdminInventoryView';
import { AdminCustomersView } from './AdminCustomersView';
import { AdminCouponsView } from './AdminCouponsView';
import { AdminSettingsView } from './AdminSettingsView';
import { AdminBannersView } from './AdminBannersView';
import { AdminPaymentsView } from './AdminPaymentsView';
import { AdminStaffView } from './AdminStaffView';
import { AdminRole, Order } from '../../types';

interface AdminLayoutProps {
  onReturnToStore: () => void;
  initialTab?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  permission?: string;
  badge?: string | number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onReturnToStore, initialTab = 'dashboard' }) => {
  const { adminUser, logout, hasPermission, switchDemoRole } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  // Sync tab with initialTab if changed
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
    { id: 'products', label: 'Products', icon: Shirt, permission: 'manage_products' },
    { id: 'categories', label: 'Categories', icon: Tags, permission: 'manage_categories' },
    { id: 'collections', label: 'Collections', icon: Layers, permission: 'manage_collections' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, permission: 'manage_orders' },
    { id: 'inventory', label: 'Inventory', icon: Boxes, permission: 'manage_inventory' },
    { id: 'payments', label: 'Payments', icon: CreditCard, permission: 'manage_payments' },
    { id: 'customers', label: 'Customers', icon: Users, permission: 'manage_customers' },
    { id: 'coupons', label: 'Coupons & Discounts', icon: Ticket, permission: 'manage_coupons' },
    { id: 'banners', label: 'Hero Banners', icon: ImageIcon, permission: 'manage_banners' },
    { id: 'staff', label: 'Staff & Roles', icon: UserCheck, permission: 'manage_admins' },
    { id: 'settings', label: 'Store Settings', icon: Sliders, permission: 'manage_settings' },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
    setSelectedOrderForDetail(null);
  };

  const handleNavigateFromDashboard = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSelectOrderFromDashboard = (order: Order) => {
    setSelectedOrderForDetail(order);
    setActiveTab('orders');
  };

  const currentRoleLabels: Record<AdminRole, { title: string; color: string }> = {
    super_admin: { title: 'Super Admin', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    product_manager: { title: 'Product Manager', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    order_manager: { title: 'Order Manager', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    inventory_manager: { title: 'Inventory Lead', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    customer_support: { title: 'Customer Support', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  };

  const roleList: { role: AdminRole; label: string; email: string }[] = [
    { role: 'super_admin', label: 'Super Admin (Khushi · Full Access)', email: 'khushiwhitebanger@gmail.com' },
    { role: 'product_manager', label: 'Product Manager (Catalog & Banners)', email: 'products@smartbuy.in' },
    { role: 'order_manager', label: 'Order Manager (Orders & Refunds)', email: 'orders@smartbuy.in' },
    { role: 'inventory_manager', label: 'Inventory Lead (Stock Matrix & CSV)', email: 'inventory@smartbuy.in' },
    { role: 'customer_support', label: 'Customer Support (Orders & CRM)', email: 'support@smartbuy.in' },
  ];

  const currentNavItem = navItems.find((item) => item.id === activeTab) || navItems[0];
  const userHasAccessToCurrentTab = !currentNavItem.permission || hasPermission(currentNavItem.permission);

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex text-[#252522] font-sans antialiased selection:bg-[#30372B] selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#171715] text-stone-300 flex flex-col transition-all duration-300 ease-in-out border-r border-stone-800 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-stone-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#30372B] text-[#D8C7B5] font-serif font-black flex items-center justify-center text-lg shadow-inner flex-shrink-0">
              SB
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-serif tracking-widest text-base font-bold text-white uppercase">SMART BUY</span>
                <span className="text-[10px] tracking-widest text-stone-400 uppercase font-semibold">Admin Engine</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-stone-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isPermitted = !item.permission || hasPermission(item.permission);

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                disabled={!isPermitted}
                title={!isPermitted ? `Requires elevated permission (${item.permission})` : item.label}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#30372B] text-white shadow-xs font-semibold'
                    : isPermitted
                    ? 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
                    : 'text-stone-600 opacity-40 cursor-not-allowed hover:bg-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-[#D8C7B5]' : 'text-stone-400 group-hover:text-stone-200'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && !isPermitted && (
                  <span className="text-[10px] text-stone-500 font-mono">locked</span>
                )}
                {!isCollapsed && isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8C7B5]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Live Storefront Link */}
        <div className="p-3 border-t border-stone-800/80">
          <button
            onClick={onReturnToStore}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-stone-800/50 hover:bg-stone-800 text-[#D8C7B5] hover:text-white transition-colors border border-stone-700/50 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Return to Storefront</span>}
          </button>
        </div>

        {/* Current User Card */}
        <div className="p-3 border-t border-stone-800/80 bg-stone-900/40">
          <div className="flex items-center gap-3">
            <img
              src={adminUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={adminUser?.name || 'Admin'}
              className="w-8 h-8 rounded-full object-cover border border-stone-700 flex-shrink-0"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{adminUser?.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-stone-400 truncate capitalize font-mono">
                    {adminUser?.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              title="Sign Out"
              className="text-stone-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#E8E1D9] px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-[#77736D] hover:text-[#252522] rounded-lg hover:bg-stone-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#77736D]">
              <span className="hover:text-[#252522] cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                Admin Portal
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-semibold text-[#252522] capitalize">
                {currentNavItem.label}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher for RBAC verification */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F3EE] hover:bg-stone-200 border border-[#E8E1D9] text-xs font-medium text-[#252522] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#30372B]" />
                <span className="hidden md:inline text-[#77736D]">Role:</span>
                <span className="font-semibold capitalize">
                  {adminUser?.role ? currentRoleLabels[adminUser.role]?.title : 'Select Role'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#77736D]" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E8E1D9] py-2 z-50">
                  <div className="px-3 py-2 border-b border-[#E8E1D9]">
                    <p className="text-[11px] font-semibold text-[#77736D] uppercase tracking-wider">
                      Switch Role for Testing RBAC
                    </p>
                  </div>
                  <div className="p-1 space-y-0.5">
                    {roleList.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchDemoRole(r.role);
                          setIsRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                          adminUser?.role === r.role
                            ? 'bg-[#F7F3EE] font-semibold text-[#252522]'
                            : 'hover:bg-stone-50 text-[#77736D]'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-medium text-[#252522]">{r.label}</p>
                          <p className="text-[10px] text-[#77736D]">{r.email}</p>
                        </div>
                        {adminUser?.role === r.role && (
                          <span className="w-2 h-2 rounded-full bg-[#30372B]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Return to Storefront Direct Button */}
            <button
              onClick={onReturnToStore}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E1D9] text-xs font-medium text-[#77736D] hover:text-[#252522] hover:bg-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Store</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#30372B]/20 transition-all"
              >
                <img
                  src={adminUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={adminUser?.name || 'Admin'}
                  className="w-8 h-8 rounded-full object-cover border border-[#E8E1D9]"
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E1D9] py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-[#E8E1D9]">
                    <p className="text-xs font-semibold text-[#252522]">{adminUser?.name}</p>
                    <p className="text-[11px] text-[#77736D]">{adminUser?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-[#30372B] border border-stone-200">
                      {adminUser?.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#252522] hover:bg-[#F7F3EE] flex items-center gap-2"
                    >
                      <Sliders className="w-4 h-4 text-[#77736D]" />
                      Store Settings
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {!userHasAccessToCurrentTab ? (
            <div className="bg-white rounded-3xl border border-[#E8E1D9] p-12 text-center max-w-md mx-auto my-12 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-serif font-bold text-[#252522]">Access Restricted</h2>
              <p className="text-xs text-[#77736D] mt-2 leading-relaxed">
                Your role (<strong>{adminUser?.role.replace('_', ' ')}</strong>) does not have permission to view or manage{' '}
                <strong>{currentNavItem.label}</strong>.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="w-full py-2.5 rounded-xl bg-[#30372B] text-white text-xs font-semibold hover:bg-[#252b22] transition-colors"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => switchDemoRole('super_admin')}
                  className="w-full py-2.5 rounded-xl border border-[#E8E1D9] text-xs font-semibold text-[#77736D] hover:text-[#252522] hover:bg-stone-100 transition-colors"
                >
                  Switch to Super Admin (Demo)
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboardView
                  onNavigateTab={handleNavigateFromDashboard}
                  onSelectOrder={handleSelectOrderFromDashboard}
                />
              )}
              {activeTab === 'products' && <AdminProductsView />}
              {activeTab === 'categories' && <AdminCategoriesView />}
              {activeTab === 'collections' && <AdminCollectionsView />}
              {activeTab === 'orders' && (
                <AdminOrdersView initialSelectedOrder={selectedOrderForDetail} />
              )}
              {activeTab === 'inventory' && <AdminInventoryView />}
              {activeTab === 'payments' && <AdminPaymentsView />}
              {activeTab === 'customers' && <AdminCustomersView />}
              {activeTab === 'coupons' && <AdminCouponsView />}
              {activeTab === 'banners' && <AdminBannersView />}
              {activeTab === 'staff' && <AdminStaffView />}
              {activeTab === 'settings' && <AdminSettingsView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
