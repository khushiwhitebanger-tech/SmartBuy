import React from 'react';
import { Mail, Phone, MapPin, ArrowUpRight, ShieldCheck } from 'lucide-react';
import smartbuyLogo from '../../assets/images/smartbuy_logo.png';

interface FooterProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#171715] text-[#F7F3EE] pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top 5 Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-neutral-800 text-xs">
          {/* Col 1: Brand & Tagline */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0.5 shrink-0">
                <img src={smartbuyLogo} alt="SMART BUY Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                SMART BUY
              </span>
            </div>
            <p className="text-[#D8C7B5] font-light max-w-sm leading-relaxed">
              "Your Style. Your Choice. Smart Buy."
            </p>
            <p className="text-neutral-400 mt-2 max-w-sm leading-relaxed text-[11px]">
              Premium minimalist clothing engineered with certified organic cotton and pure flax linen for the modern Indian wardrobe.
            </p>

            <div className="mt-6 space-y-2 text-neutral-400 text-[11px]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D8C7B5]" />
                <a href="mailto:care@smartbuy.in" className="hover:text-white transition-colors">care@smartbuy.in</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D8C7B5]" />
                <a href="tel:+9118002098899" className="hover:text-white transition-colors">+91 1800-209-8899 (Toll Free)</a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D8C7B5] shrink-0 mt-0.5" />
                <span>Indiranagar 100ft Road, Bengaluru, Karnataka 560038</span>
              </div>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px] mb-4">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={() => onNavigate('shop', { department: 'men' })} className="hover:text-white transition-colors text-left">
                  Men's Collection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { department: 'women' })} className="hover:text-white transition-colors text-left">
                  Women's Collection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { department: 'kids' })} className="hover:text-white transition-colors text-left">
                  Kids' Playwear
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { filter: 'new_arrivals' })} className="hover:text-white transition-colors text-left">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { filter: 'best_sellers' })} className="hover:text-white transition-colors text-left">
                  Best Sellers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { collection: 'Minimal Essentials' })} className="hover:text-white transition-colors text-left">
                  Minimal Essentials
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Support */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px] mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={() => onNavigate('account', { tab: 'orders' })} className="hover:text-white transition-colors text-left">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shipping-policy')} className="hover:text-white transition-colors text-left">
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('returns-policy')} className="hover:text-white transition-colors text-left">
                  14-Day Returns & Exchanges
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors text-left">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faqs')} className="hover:text-white transition-colors text-left">
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Policies & Admin */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px] mb-4">
              Policies & Legal
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={() => onNavigate('privacy-policy')} className="hover:text-white transition-colors text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors text-left">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors text-left">
                  About Our Fabrics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-white transition-colors text-left text-[#D8C7B5] font-medium flex items-center gap-1.5 mt-2 pt-2 border-t border-neutral-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D8C7B5]" />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Verified Payment Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © 2026 ManchandaSmartBuy. All rights reserved.
          </div>

          {/* Payment Gateways */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
            <span>Secured by Razorpay</span>
            <span>·</span>
            <span>UPI / Cards / NetBanking / COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
