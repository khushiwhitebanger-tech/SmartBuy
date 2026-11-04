import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, quickSwitchUser, showToast } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      const res = await register(name, email, phone);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to create account');
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    }
    setLoading(false);
  };

  const handleCustomerDemoSignIn = () => {
    quickSwitchUser('customer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C7B5]/40 text-[#171715] text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#77736D] hover:text-[#171715] rounded-full"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#171715] text-white flex items-center justify-center font-bold text-xs mb-3">
            SB
          </div>
          <h3 className="font-display font-extrabold text-2xl text-[#171715]">
            {isRegister ? 'Create Your Account' : 'Welcome to SMART BUY'}
          </h3>
          <p className="text-xs text-[#77736D] mt-1">
            {isRegister ? 'Join the community for tailored style and order tracking.' : 'Sign in to access your orders, wishlist, and saved addresses.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegister && (
            <div>
              <label className="block font-semibold mb-1 text-[#171715]">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736D]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1 text-[#171715]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736D]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#171715]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736D]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] focus:outline-hidden"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block font-semibold mb-1 text-[#171715]">Phone Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98201 12345"
                className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] focus:outline-hidden"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* 1-Click Customer Demo Sign-In */}
        <div className="mt-6 pt-5 border-t border-[#D8C7B5]/30 text-xs">
          <p className="text-[11px] font-mono text-[#77736D] text-center mb-2.5 uppercase tracking-wider">
            Quick 1-Click Demo Sign-In
          </p>
          <button
            type="button"
            onClick={handleCustomerDemoSignIn}
            className="w-full py-2.5 px-3 rounded-xl border border-[#D8C7B5] bg-[#F7F3EE] hover:bg-[#D8C7B5]/40 text-[#171715] font-semibold text-center transition-colors flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4 text-[#30372B]" />
            <span>Continue as Customer (Rahul Sharma)</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-[#77736D] hover:text-[#171715] font-semibold underline"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};
