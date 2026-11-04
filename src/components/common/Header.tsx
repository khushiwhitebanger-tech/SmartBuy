import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, User as UserIcon, Heart, ShoppingCart, Menu, X, ChevronDown, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Department } from '../../types';
import smartbuyLogo from '../../assets/images/smartbuy_logo.png';

interface HeaderProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  currentPage: string;
  onOpenAuthModal: () => void;
  onOpenSearchModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  currentPage,
  onOpenAuthModal,
  onOpenSearchModal,
}) => {
  const { cartCount, wishlist, currentUser, setIsCartDrawerOpen } = useStore();
  const [activeMegaMenu, setActiveMegaMenu] = useState<Department | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [showPromo, setShowPromo] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menSubcategories = [
    { name: 'T-Shirts', category: 'T-Shirts' },
    { name: 'V-Neck Polo T-Shirts', category: 'V-Neck T-Shirts' },
    { name: 'Cargo Pants', category: 'Cargo Pants' },
    { name: 'Shirts', category: 'Shirts' },
    { name: 'Checked Shirts', category: 'Checked Shirts' },
    { name: 'Striped Shirts', category: 'Striped Shirts' },
    { name: 'Jeans', category: 'Jeans' },
    { name: 'Trousers', category: 'Trousers' },
    { name: 'Pants and Joggers', category: 'Pants and Joggers' },
    { name: 'Shorts', category: 'Shorts' },
    { name: 'Hoodies and Sweatshirts', category: 'Hoodies and Sweatshirts' },
    { name: 'Zipper Hoodies', category: 'Hoodies and Sweatshirts' },
    { name: 'Half-Zip Sweatshirts', category: 'Hoodies and Sweatshirts' },
    { name: 'Jackets', category: 'Jackets' },
    { name: 'Ethnic Wear', category: 'Ethnic Wear' },
    { name: 'Shoes', category: 'Shoes' },
    { name: 'Accessories', category: 'Accessories' },
  ];

  const womenSubcategories = [
    { name: 'Tops and T-Shirts', category: 'Tops and T-Shirts' },
    { name: 'Shirts', category: 'Shirts' },
    { name: 'Dresses', category: 'Dresses' },
    { name: 'Jeans', category: 'Jeans' },
    { name: 'Trousers', category: 'Trousers' },
    { name: 'Leggings', category: 'Leggings' },
    { name: 'Co-ord Sets', category: 'Co-ord Sets' },
    { name: 'Ethnic Wear', category: 'Ethnic Wear' },
    { name: 'Activewear', category: 'Activewear' },
    { name: 'Hoodies', category: 'Hoodies' },
    { name: 'Shoes', category: 'Shoes' },
    { name: 'Handbags', category: 'Handbags' },
    { name: 'Accessories', category: 'Accessories' },
  ];

  const kidsSubcategories = [
    { name: "Boys' Clothing", category: 'T-Shirts' },
    { name: "Girls' Clothing", category: 'Dresses' },
    { name: 'T-Shirts', category: 'T-Shirts' },
    { name: 'Shirts', category: 'Shirts' },
    { name: 'Jeans and Trousers', category: 'Jeans and Trousers' },
    { name: 'Dresses', category: 'Dresses' },
    { name: 'Shorts', category: 'Shorts' },
    { name: 'Ethnic Wear', category: 'Ethnic Wear' },
    { name: 'Shoes and Accessories', category: 'Shoes and Accessories' },
  ];

  const handleSubcategoryClick = (dept: Department, cat?: string) => {
    setActiveMegaMenu(null);
    setMobileMenuOpen(false);
    onNavigate('shop', { department: dept, category: cat || 'all' });
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Slim Promotional Announcement Banner */}
      {showPromo && (
        <div className="relative bg-[#171715] text-[#F7F3EE] text-[11px] sm:text-xs py-2 px-4 flex items-center justify-between tracking-wide font-medium">
          <div className="flex-1 text-center flex items-center justify-center gap-2">
            <span className="hidden sm:inline text-[#D8C7B5]">SPRING EDIT 2026</span>
            <span className="hidden sm:inline">·</span>
            <span>FREE ALL-INDIA SHIPPING OVER ₹999</span>
            <span>·</span>
            <span className="text-[#D8C7B5]">USE CODE <strong className="text-white underline decoration-dotted">SMART10</strong> FOR 10% OFF</span>
          </div>
          <button
            onClick={() => setShowPromo(false)}
            className="text-neutral-400 hover:text-white p-0.5 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div
        className={`w-full bg-[#F7F3EE] border-b transition-all duration-200 ${
          isScrolled ? 'shadow-xs border-[#D8C7B5]/40 py-3.5' : 'border-[#D8C7B5]/30 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
          {/* Mobile Hamburger Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#171715] hover:text-[#30372B]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Wordmark (Zone 1) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="group flex items-center gap-2.5 text-left focus:outline-hidden"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-[#D8C7B5]/60 shadow-xs group-hover:border-[#171715]/40 transition-all p-1 shrink-0">
                <img
                  src={smartbuyLogo}
                  alt="SMART BUY Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-display font-bold text-xl sm:text-2xl tracking-tight text-[#171715] whitespace-nowrap">
                SMART BUY
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links (Zone 2) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wider uppercase text-[#171715]">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-[#30372B] transition-colors py-1 ${
                currentPage === 'home' ? 'border-b-2 border-[#171715] text-[#171715]' : 'text-[#77736D]'
              }`}
            >
              Home
            </button>

            {/* Men Menu with Mega Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaMenu('men')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button
                onClick={() => onNavigate('shop', { department: 'men' })}
                className="flex items-center gap-1 hover:text-[#30372B] transition-colors py-1 text-[#171715]"
              >
                Men
                <ChevronDown className="w-3 h-3 text-[#77736D]" />
              </button>
            </div>

            {/* Women Menu with Mega Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaMenu('women')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button
                onClick={() => onNavigate('shop', { department: 'women' })}
                className="flex items-center gap-1 hover:text-[#30372B] transition-colors py-1 text-[#171715]"
              >
                Women
                <ChevronDown className="w-3 h-3 text-[#77736D]" />
              </button>
            </div>

            {/* Kids Menu with Mega Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaMenu('kids')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button
                onClick={() => onNavigate('shop', { department: 'kids' })}
                className="flex items-center gap-1 hover:text-[#30372B] transition-colors py-1 text-[#171715]"
              >
                Kids
                <ChevronDown className="w-3 h-3 text-[#77736D]" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('shop', { filter: 'new_arrivals' })}
              className="hover:text-[#30372B] transition-colors py-1 text-[#171715]"
            >
              New Arrivals
            </button>

            <button
              onClick={() => onNavigate('shop', { filter: 'best_sellers' })}
              className="hover:text-[#30372B] transition-colors py-1 text-[#171715]"
            >
              Best Sellers
            </button>

            <button
              onClick={() => onNavigate('shop', { collection: 'Minimal Essentials' })}
              className="hover:text-[#30372B] transition-colors py-1 text-[#171715]"
            >
              Collections
            </button>

            <button
              onClick={() => onNavigate('shop', { filter: 'offers' })}
              className="hover:text-[#30372B] transition-colors py-1 text-[#30372B] font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#30372B]" />
              Offers
            </button>
          </nav>

          {/* Right Icons (Zone 3) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Admin Portal Quick Switcher */}
            <button
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#171715] hover:text-white bg-[#D8C7B5]/30 hover:bg-[#30372B] border border-[#D8C7B5] rounded-lg transition-colors shadow-2xs"
              title="Open SMART BUY Enterprise Admin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#30372B]" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            {/* Search Icon */}
            <button
              onClick={onOpenSearchModal}
              className="p-2 text-[#171715] hover:text-[#30372B] rounded-full hover:bg-[#D8C7B5]/20 transition-colors"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Account */}
            <button
              onClick={() => {
                if (currentUser) {
                  onNavigate('account');
                } else {
                  onOpenAuthModal();
                }
              }}
              className="p-2 text-[#171715] hover:text-[#30372B] rounded-full hover:bg-[#D8C7B5]/20 transition-colors relative"
              aria-label="Customer Account"
            >
              <UserIcon className="w-5 h-5" />
              {currentUser && (
                <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#30372B]" />
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="p-2 text-[#171715] hover:text-[#30372B] rounded-full hover:bg-[#D8C7B5]/20 transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart
                className="w-5 h-5 px-0 -ml-[6px]"
                style={{ paddingLeft: '0px', paddingRight: '0px', marginLeft: '-6px' }}
              />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#30372B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-[#F7F3EE] bg-[#171715] hover:bg-[#30372B] rounded-lg transition-colors text-xs font-semibold shadow-xs"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="inline font-medium">Cart</span>
              <span className="bg-white/20 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full min-w-4 text-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Mega Menus */}
      {activeMegaMenu && (
        <div
          className="absolute left-0 w-full bg-[#FFFFFF] border-b border-[#D8C7B5]/50 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
          onMouseLeave={() => setActiveMegaMenu(null)}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Category Columns */}
              <div className="col-span-8 grid grid-cols-3 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#171715] pb-2 border-b border-[#D8C7B5]/30 mb-3">
                    {activeMegaMenu === 'men' ? "Men's Apparel" : activeMegaMenu === 'women' ? "Women's Apparel" : 'Boys & Girls'}
                  </h4>
                  <ul className="space-y-2 text-sm text-[#77736D]">
                    {(activeMegaMenu === 'men' ? menSubcategories.slice(0, 6) : activeMegaMenu === 'women' ? womenSubcategories.slice(0, 6) : kidsSubcategories.slice(0, 5)).map((sub) => (
                      <li key={sub.name}>
                        <button
                          onClick={() => handleSubcategoryClick(activeMegaMenu, sub.category)}
                          className="hover:text-[#171715] transition-colors text-left"
                        >
                          {sub.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#171715] pb-2 border-b border-[#D8C7B5]/30 mb-3">
                    {activeMegaMenu === 'kids' ? 'Clothing & Styles' : 'Outerwear & Bottoms'}
                  </h4>
                  <ul className="space-y-2 text-sm text-[#77736D]">
                    {(activeMegaMenu === 'men' ? menSubcategories.slice(6, 12) : activeMegaMenu === 'women' ? womenSubcategories.slice(6, 13) : kidsSubcategories.slice(5)).map((sub) => (
                      <li key={sub.name}>
                        <button
                          onClick={() => handleSubcategoryClick(activeMegaMenu, sub.category)}
                          className="hover:text-[#171715] transition-colors text-left"
                        >
                          {sub.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#171715] pb-2 border-b border-[#D8C7B5]/30 mb-3">
                    Featured Edits
                  </h4>
                  <ul className="space-y-2 text-sm text-[#77736D]">
                    <li>
                      <button
                        onClick={() => {
                          setActiveMegaMenu(null);
                          onNavigate('shop', { department: activeMegaMenu, collection: 'Minimal Essentials' });
                        }}
                        className="hover:text-[#171715] transition-colors text-left font-medium text-[#171715]"
                      >
                        Minimal Essentials
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setActiveMegaMenu(null);
                          onNavigate('shop', { department: activeMegaMenu, collection: 'Urban Streetwear' });
                        }}
                        className="hover:text-[#171715] transition-colors text-left"
                      >
                        Urban Streetwear
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setActiveMegaMenu(null);
                          onNavigate('shop', { department: activeMegaMenu, collection: 'Casual Comfort' });
                        }}
                        className="hover:text-[#171715] transition-colors text-left"
                      >
                        Casual Comfort
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setActiveMegaMenu(null);
                          onNavigate('shop', { department: activeMegaMenu, filter: 'new_arrivals' });
                        }}
                        className="hover:text-[#171715] transition-colors text-left text-[#30372B] font-medium"
                      >
                        View All New In →
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Promotional Visual Card in Mega Menu */}
              <div className="col-span-4 bg-[#F7F3EE] rounded-xl p-5 border border-[#D8C7B5]/40 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#77736D]">
                    Featured Editorial
                  </span>
                  <h5 className="font-display font-bold text-lg text-[#171715] mt-1">
                    {activeMegaMenu === 'men'
                      ? 'The Modern Minimalist Cut'
                      : activeMegaMenu === 'women'
                      ? 'Normandy Linen Series'
                      : 'Hypoallergenic Organic Playwear'}
                  </h5>
                  <p className="text-xs text-[#77736D] mt-1.5 leading-relaxed">
                    Heavyweight textures, relaxed proportions, and neutral earth tones crafted for enduring daily wear.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D8C7B5]/30 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveMegaMenu(null);
                      onNavigate('shop', { department: activeMegaMenu });
                    }}
                    className="text-xs font-bold text-[#171715] hover:text-[#30372B] flex items-center gap-1.5"
                  >
                    Explore Collection <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-[#F7F3EE] h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#D8C7B5]">
                <span className="font-display font-bold text-lg text-[#171715]">SMART BUY</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#171715]"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-4 space-y-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="block w-full text-left py-2 font-semibold text-sm text-[#171715]"
                >
                  Home
                </button>

                {/* Mobile Men Accordion */}
                <div>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === 'men' ? null : 'men')}
                    className="flex items-center justify-between w-full py-2 font-semibold text-sm text-[#171715]"
                  >
                    <span>Men</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === 'men' ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileExpanded === 'men' && (
                    <div className="pl-4 py-2 space-y-2 border-l-2 border-[#D8C7B5]/60 text-xs text-[#77736D]">
                      <button onClick={() => handleSubcategoryClick('men')} className="block font-medium text-[#171715]">All Men's Clothing</button>
                      {menSubcategories.map((sub) => (
                        <button key={sub.name} onClick={() => handleSubcategoryClick('men', sub.category)} className="block">
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Women Accordion */}
                <div>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === 'women' ? null : 'women')}
                    className="flex items-center justify-between w-full py-2 font-semibold text-sm text-[#171715]"
                  >
                    <span>Women</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === 'women' ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileExpanded === 'women' && (
                    <div className="pl-4 py-2 space-y-2 border-l-2 border-[#D8C7B5]/60 text-xs text-[#77736D]">
                      <button onClick={() => handleSubcategoryClick('women')} className="block font-medium text-[#171715]">All Women's Clothing</button>
                      {womenSubcategories.map((sub) => (
                        <button key={sub.name} onClick={() => handleSubcategoryClick('women', sub.category)} className="block">
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Kids Accordion */}
                <div>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === 'kids' ? null : 'kids')}
                    className="flex items-center justify-between w-full py-2 font-semibold text-sm text-[#171715]"
                  >
                    <span>Kids</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === 'kids' ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileExpanded === 'kids' && (
                    <div className="pl-4 py-2 space-y-2 border-l-2 border-[#D8C7B5]/60 text-xs text-[#77736D]">
                      <button onClick={() => handleSubcategoryClick('kids')} className="block font-medium text-[#171715]">All Kids' Clothing</button>
                      {kidsSubcategories.map((sub) => (
                        <button key={sub.name} onClick={() => handleSubcategoryClick('kids', sub.category)} className="block">
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('shop', { filter: 'new_arrivals' });
                  }}
                  className="block w-full text-left py-2 font-semibold text-sm text-[#171715]"
                >
                  New Arrivals
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('shop', { filter: 'best_sellers' });
                  }}
                  className="block w-full text-left py-2 font-semibold text-sm text-[#171715]"
                >
                  Best Sellers
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('shop', { collection: 'Minimal Essentials' });
                  }}
                  className="block w-full text-left py-2 font-semibold text-sm text-[#171715]"
                >
                  Collections
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('shop', { filter: 'offers' });
                  }}
                  className="block w-full text-left py-2 font-bold text-sm text-[#30372B]"
                >
                  Offers & Promotions
                </button>
              </div>
            </div>

            {/* Mobile Footer Area */}
            <div className="pt-6 border-t border-[#D8C7B5]">
              <p className="text-[11px] text-[#77736D] text-center font-mono">
                "Your Style. Your Choice. Smart Buy."
              </p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
