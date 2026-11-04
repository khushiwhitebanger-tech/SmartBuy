import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Check, Mail } from 'lucide-react';

export const NewsletterClub: React.FC = () => {
  const { showToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        showToast('Welcome to SMART BUY Club! Promo code SMART10 has been unlocked.', 'success');
      } else {
        setSubscribed(true);
      }
    } catch {
      setSubscribed(true);
      showToast('Welcome to SMART BUY Club! Use promo code SMART10 at checkout.', 'success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
      <div className="relative rounded-3xl bg-[#30372B] text-[#F7F3EE] p-8 sm:p-12 lg:p-16 overflow-hidden shadow-xl">
        {/* Subtle geometric background motif */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <span className="text-xs font-mono font-medium tracking-widest text-[#D8C7B5] uppercase">
            Exclusive Community
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-2">
            JOIN THE SMART BUY CLUB
          </h2>
          <p className="mt-3 text-sm text-[#D8C7B5] leading-relaxed max-w-lg mx-auto">
            Subscribe for private lookbook drops, seasonal early access, and enjoy <strong>10% off</strong> your first order with code <span className="font-mono underline text-white">SMART10</span>.
          </p>

          {subscribed ? (
            <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center gap-3 text-sm font-semibold">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>You're in! Use coupon <strong className="font-mono text-white underline">SMART10</strong> at checkout for 10% off.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white text-[#171715] placeholder-neutral-500 text-xs sm:text-sm rounded-xl focus:outline-hidden font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="py-3 px-6 bg-[#171715] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? 'Subscribing...' : 'Claim 10% Off'}
              </button>
            </form>
          )}

          <p className="text-[11px] text-white/50 mt-4">
            No spam. Only clean style, seasonal drops, and member-only promotions. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};
