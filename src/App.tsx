import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { SizeGuideModal } from './components/common/SizeGuideModal';
import { SearchModal } from './components/common/SearchModal';
import { ToastContainer } from './components/common/Toast';
import { AuthModal } from './pages/AuthModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';

// Home Sections
import { HeroBanner } from './components/home/HeroBanner';
import { FeaturedCategories } from './components/home/FeaturedCategories';
import { BestSellers } from './components/home/BestSellers';
import { CollectionBanners } from './components/home/CollectionBanners';
import { HoodieVideoShowcase } from './components/home/HoodieVideoShowcase';
import { CompleteTheLook } from './components/home/CompleteTheLook';
import { BrandStory } from './components/home/BrandStory';
import { WhyChooseUs } from './components/home/WhyChooseUs';
import { TrendingCollections } from './components/home/TrendingCollections';
import { NewsletterClub } from './components/home/NewsletterClub';

// Inner Pages
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { WishlistPage } from './pages/WishlistPage';
import { StaticPages } from './pages/StaticPages';
import { Product, Order, Department } from './types';

function MainApp() {
  const { products, currentUser } = useStore();
  const { adminUser, adminToken } = useAdminAuth();

  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      return 'admin';
    }
    return 'home';
  });
  const [navParams, setNavParams] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sync browser URL
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin')) {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleNavigate = (page: string, params: Record<string, string> = {}) => {
    setCurrentPage(page);
    setNavParams(params);
    if (page === 'admin' || page === 'admin-login') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else {
      if (window.location.pathname.startsWith('/admin')) {
        window.history.pushState(null, '', '/');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentPage('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated Enterprise Admin Viewport
  if (currentPage === 'admin' || currentPage === 'admin-login') {
    if (adminToken && adminUser) {
      return (
        <div className="min-h-screen bg-[#F7F3EE]">
          <AdminLayout
            initialTab={navParams.tab || 'dashboard'}
            onReturnToStore={() => handleNavigate('home')}
          />
          <ToastContainer />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#F7F3EE]">
        <AdminLogin
          onBackToStore={() => handleNavigate('home')}
          onLoginSuccess={() => handleNavigate('admin')}
        />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EE] text-[#171715] selection:bg-[#30372B] selection:text-white">
      {/* Sticky Navigation Header */}
      <Header
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
      />

      {/* Main Viewport Router */}
      <main className="flex-1">
        {/* HOMEPAGE */}
        {currentPage === 'home' && (
          <div className="space-y-0">
            {/* Section A: Hero Banner */}
            <HeroBanner
              onShopMen={() => handleNavigate('shop', { department: 'men' })}
              onShopWomen={() => handleNavigate('shop', { department: 'women' })}
            />

            {/* Section B: Featured Categories */}
            <FeaturedCategories
              onSelectCategory={(collection) => handleNavigate('shop', { collection })}
            />

            {/* Section C: Shop Best Sellers */}
            <BestSellers
              onSelectProduct={handleSelectProduct}
              onViewAll={() => handleNavigate('shop', { filter: 'best_sellers' })}
            />

            {/* Section D: Shop by Collection */}
            <CollectionBanners
              onSelectCollection={(col) => handleNavigate('shop', { collection: col })}
            />

            {/* Section D.2: Video Campaign In Motion - Men's Full-Zip Hoodie */}
            <HoodieVideoShowcase
              onSelectProduct={handleSelectProduct}
            />

            {/* Section E: Complete the Look */}
            <CompleteTheLook />

            {/* Section F: Brand Story */}
            <BrandStory
              onDiscoverStory={() => handleNavigate('about')}
            />

            {/* Section G: Why Choose SMART BUY? */}
            <WhyChooseUs />

            {/* Section H: Trending Collections */}
            <TrendingCollections
              onSelectCollection={(col) => handleNavigate('shop', { collection: col })}
            />

            {/* Section I: Newsletter & Community Club */}
            <NewsletterClub />
          </div>
        )}

        {/* SHOP CATALOGUE */}
        {currentPage === 'shop' && (
          <ShopPage
            initialDepartment={(navParams.department as Department) || 'all'}
            initialCategory={navParams.category || 'all'}
            initialCollection={navParams.collection || 'all'}
            initialFilter={navParams.filter || 'all'}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* PRODUCT DETAILS PAGE */}
        {currentPage === 'product-detail' && (
          selectedProduct ? (
            <ProductDetailPage
              product={selectedProduct}
              onNavigateToCheckout={() => handleNavigate('checkout')}
              onSelectProduct={handleSelectProduct}
              onNavigateBack={() => handleNavigate('shop')}
            />
          ) : (
            <div className="py-20 text-center">
              <p>Product not found.</p>
              <button onClick={() => handleNavigate('shop')} className="mt-4 px-4 py-2 bg-black text-white rounded">
                Return to Shop
              </button>
            </div>
          )
        )}

        {/* CHECKOUT PAGE */}
        {currentPage === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {/* ORDER CONFIRMATION PAGE */}
        {currentPage === 'order-confirmation' && (
          confirmedOrder ? (
            <OrderConfirmationPage
              order={confirmedOrder}
              onNavigateToShop={() => handleNavigate('shop')}
              onNavigateToAccount={() => handleNavigate('account')}
            />
          ) : (
            <div className="py-20 text-center">
              <button onClick={() => handleNavigate('shop')} className="px-4 py-2 bg-black text-white rounded">
                Go to Shop
              </button>
            </div>
          )
        )}

        {/* CUSTOMER ACCOUNT */}
        {currentPage === 'account' && (
          <AccountPage
            initialTab={navParams.tab || 'orders'}
            onNavigateToWishlist={() => handleNavigate('wishlist')}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {/* WISHLIST */}
        {currentPage === 'wishlist' && (
          <WishlistPage
            onSelectProduct={handleSelectProduct}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {/* BRAND STATIC PAGES */}
        {[
          'about',
          'contact',
          'faqs',
          'shipping-policy',
          'returns-policy',
          'privacy-policy',
          'terms',
        ].includes(currentPage) && (
          <StaticPages
            page={currentPage as any}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}
      </main>

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer
        onNavigateToCheckout={() => handleNavigate('checkout')}
        onNavigateToShop={() => handleNavigate('shop')}
      />

      {/* Global Quick View Modal */}
      <QuickViewModal
        onNavigateToDetail={(slug) => {
          const found = products.find((p) => p.slug === slug);
          if (found) handleSelectProduct(found);
        }}
      />

      {/* Global Size Guide Modal */}
      <SizeGuideModal />

      {/* Global Live Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigateToCategory={(dept) => handleNavigate('shop', { department: dept })}
      />

      {/* Global Customer & Admin Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Real-time Notification Toasts */}
      <ToastContainer />

      {/* Brand Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AdminAuthProvider>
        <MainApp />
      </AdminAuthProvider>
    </StoreProvider>
  );
}
