import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, KeyRound, AlertCircle, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import smartbuyLogo from '../../assets/images/smartbuy_logo.png';

interface AdminLoginProps {
  onBackToStore: () => void;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStore, onLoginSuccess }) => {
  const { login, requestPasswordReset, resetPassword } = useAdminAuth();

  const [email, setEmail] = useState('khushiwhitebanger@gmail.com');
  const [password, setPassword] = useState('SmartBuy@SuperAdmin2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MFA Modal State
  const [isMfaOpen, setIsMfaOpen] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotMessage, setForgotMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.mfaRequired) {
      setIsMfaOpen(true);
      return;
    }

    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || 'Failed to authenticate');
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');
    setIsSubmitting(true);

    const res = await login(email, password, mfaCode);
    setIsSubmitting(false);

    if (res.success) {
      setIsMfaOpen(false);
      onLoginSuccess();
    } else {
      setMfaError(res.error || 'Invalid 2FA code');
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsSubmitting(true);
    const res = await requestPasswordReset(forgotEmail);
    setIsSubmitting(false);

    if (res.recoveryCode) {
      setRecoveryCode(res.recoveryCode);
      setForgotMessage(`Recovery code generated: ${res.recoveryCode}`);
      setForgotStep('reset');
    } else {
      setForgotMessage(res.message);
    }
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await resetPassword(forgotEmail, recoveryCode, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setForgotMessage('Password updated successfully! You can now log in.');
      setTimeout(() => {
        setIsForgotOpen(false);
        setPassword(newPassword);
        setEmail(forgotEmail);
      }, 1500);
    } else {
      setError(res.error || 'Reset failed');
    }
  };

  // Quick fill presets
  const fillPreset = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#171715] relative">
      {/* Back to storefront link */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#77736D] hover:text-[#171715] bg-white px-3.5 py-2 rounded-xl border border-[#D8C7B5]/40 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Crest */}
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#171715] rounded-2xl shadow-lg border border-white/10 mb-4 p-2">
          <img src={smartbuyLogo} alt="SMART BUY" className="w-full h-full object-contain" />
        </div>

        <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[#171715]">
          SMART BUY Administration
        </h1>
        <p className="mt-1.5 text-xs text-[#77736D]">
          Enterprise operations, inventory matrix, order fulfillment, and analytics.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#FFFFFF] py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-[#D8C7B5]/40">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#77736D] mb-1.5">
                Administrator Email
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77736D]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartbuy.in"
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#F7F3EE]/60 border border-[#D8C7B5] rounded-xl text-sm text-[#171715] focus:outline-hidden focus:ring-2 focus:ring-[#30372B] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#77736D]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setIsForgotOpen(true);
                  }}
                  className="text-xs text-[#30372B] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77736D]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-[#F7F3EE]/60 border border-[#D8C7B5] rounded-xl text-sm text-[#171715] focus:outline-hidden focus:ring-2 focus:ring-[#30372B] focus:border-transparent transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#77736D] hover:text-[#171715]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In To Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-Fill Demo Chips */}
          <div className="mt-8 pt-6 border-t border-[#D8C7B5]/40 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold uppercase text-[#77736D] tracking-wider">
                Quick Role Credentials
              </span>
              <span className="text-[10px] text-[#77736D] bg-[#F7F3EE] px-2 py-0.5 rounded">
                Click to Auto-fill
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillPreset('khushiwhitebanger@gmail.com', 'SmartBuy@SuperAdmin2026!')}
                className="p-2 text-left bg-emerald-50/70 hover:bg-emerald-100/70 rounded-xl border border-emerald-200 transition-colors text-xs"
              >
                <div className="font-bold text-[#171715] flex items-center justify-between">
                  <span>Super Admin</span>
                  <span className="text-[9px] bg-emerald-800 text-white font-bold px-1.5 py-0.2 rounded font-mono">OWNER</span>
                </div>
                <div className="text-[10px] text-emerald-900 truncate font-mono">khushiwhitebanger@gmail.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillPreset('products@smartbuy.in', 'ProductLead@2026!')}
                className="p-2 text-left bg-[#F7F3EE] hover:bg-[#D8C7B5]/30 rounded-xl border border-[#D8C7B5]/40 transition-colors text-xs"
              >
                <div className="font-bold text-[#171715]">Product Lead</div>
                <div className="text-[10px] text-[#77736D] truncate">products@smartbuy.in</div>
              </button>

              <button
                type="button"
                onClick={() => fillPreset('orders@smartbuy.in', 'OrdersTeam@2026!')}
                className="p-2 text-left bg-[#F7F3EE] hover:bg-[#D8C7B5]/30 rounded-xl border border-[#D8C7B5]/40 transition-colors text-xs"
              >
                <div className="font-bold text-[#171715]">Order Manager</div>
                <div className="text-[10px] text-[#77736D] truncate">orders@smartbuy.in</div>
              </button>

              <button
                type="button"
                onClick={() => fillPreset('inventory@smartbuy.in', 'Warehouse@2026!')}
                className="p-2 text-left bg-[#F7F3EE] hover:bg-[#D8C7B5]/30 rounded-xl border border-[#D8C7B5]/40 transition-colors text-xs"
              >
                <div className="font-bold text-[#171715]">Inventory Lead</div>
                <div className="text-[10px] text-[#77736D] truncate">inventory@smartbuy.in</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication Modal */}
      {isMfaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C7B5]/40 text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="font-display font-extrabold text-xl text-[#171715]">
              Two-Factor Authentication
            </h3>
            <p className="text-xs text-[#77736D] mt-1.5 leading-relaxed">
              Super Admin security requires a 6-digit TOTP / SMS code to access sensitive operations.
            </p>

            <div className="my-4 p-3 bg-neutral-100 rounded-xl text-xs font-mono text-[#171715] flex items-center justify-between">
              <span>Demo Security Passcode:</span>
              <strong className="text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border">123456</strong>
            </div>

            {mfaError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                {mfaError}
              </div>
            )}

            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#77736D] mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  className="block w-full py-3 px-4 text-center font-mono text-xl tracking-widest bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-[#171715] focus:outline-hidden focus:ring-2 focus:ring-[#30372B]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsMfaOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-[#171715] text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold rounded-xl"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password / Account Recovery Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C7B5]/40 text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="font-display font-extrabold text-xl text-[#171715]">
              Administrator Account Recovery
            </h3>
            <p className="text-xs text-[#77736D] mt-1.5 leading-relaxed">
              {forgotStep === 'request'
                ? 'Enter your registered administrator email to receive your secure recovery key.'
                : 'Enter your recovery code and choose a strong new password.'}
            </p>

            {forgotMessage && (
              <div className="my-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{forgotMessage}</span>
              </div>
            )}

            {forgotStep === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#77736D] mb-1">
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@smartbuy.in"
                    className="block w-full py-2.5 px-3.5 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-[#171715] text-xs font-semibold rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold rounded-xl"
                  >
                    {isSubmitting ? 'Sending...' : 'Get Recovery Key'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleExecuteReset} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#77736D] mb-1">
                    Recovery Code
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    className="block w-full py-2.5 px-3.5 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#77736D] mb-1">
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="block w-full py-2.5 px-3.5 bg-[#F7F3EE] border border-[#D8C7B5] rounded-xl text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-[#171715] text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 bg-[#30372B] hover:bg-[#252522] text-white text-xs font-bold rounded-xl"
                  >
                    {isSubmitting ? 'Updating...' : 'Set Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
