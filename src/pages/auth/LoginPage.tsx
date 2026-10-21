/**
 * Login Page (Customer & Admin)
 * Supports email/password, email OTP, password visibility toggle, and automated key setup
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseKeyModal } from '../../components/common/SupabaseKeyModal';
import {
  UtensilsCrossed,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Send,
} from 'lucide-react';

export const LoginPage: React.FC<{ isAdminLogin?: boolean }> = ({ isAdminLogin = false }) => {
  const { signIn, signInWithOtp, isSupabaseReady, setDemoAdminMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Target path redirect
  const from = (location.state as any)?.from?.pathname || (isAdminLogin ? '/admin' : '/account');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isSupabaseConfigured()) {
      setShowKeyModal(true);
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'otp') {
        await signInWithOtp(email.trim());
        setOtpSent(true);
      } else {
        if (!password) {
          setErrorMsg('Please enter your password.');
          setIsLoading(false);
          return;
        }
        await signIn(email.trim(), password);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E9E9E5] p-8 sm:p-10 shadow-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-[#07131A] text-[#F5B51B] flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-6 h-6 stroke-[2.2]" />
            </div>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-gray-900 mt-2">
            {isAdminLogin ? 'Admin Portal Sign In' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-gray-500">
            {isAdminLogin
              ? 'Enter authorized administrator credentials to manage DEM Restaurant'
              : 'Sign in to track orders, manage reservations, and view saved addresses'}
          </p>
        </div>

        {/* Supabase Key Missing Notice */}
        {!isSupabaseConfigured() && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Supabase Publishable Key Required</span>
                <span className="text-[11px] text-amber-800 leading-relaxed block mt-0.5">
                  To authenticate with your Supabase database, paste your <code>anon</code> key.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
            >
              Paste Supabase Key
            </button>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* OTP Sent Success Box */}
        {otpSent && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
            <p className="font-bold">Magic Sign-in Link & OTP Sent!</p>
            <p>We sent a 6-digit verification code to <strong>{email}</strong>.</p>
            <Link
              to={`/verify-email?email=${encodeURIComponent(email)}`}
              className="inline-block mt-1 font-bold text-[#07131A] underline"
            >
              Click here to enter your 6-digit OTP code &rarr;
            </Link>
          </div>
        )}

        {/* Mode Selector (Password / Email OTP) */}
        {!isAdminLogin && !otpSent && (
          <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'password' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'otp' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Email OTP
            </button>
          </div>
        )}

        {/* Sign In Form */}
        {!otpSent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] focus:ring-1 focus:ring-[#F5B51B]"
                />
              </div>
            </div>

            {authMode === 'password' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                    Password
                  </label>
                  {!isAdminLogin && (
                    <Link
                      to="/forgot-password"
                      className="text-[11px] text-[#E9A817] font-semibold hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] focus:ring-1 focus:ring-[#F5B51B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-gray-300 text-gray-600 cursor-wait'
                  : 'bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] shadow-[#F5B51B]/25 active:scale-95'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#07131A] border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : authMode === 'otp' ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send 6-Digit Login Code</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{isAdminLogin ? 'Enter Admin Dashboard' : 'Sign In to Account'}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer links */}
        <div className="pt-4 border-t border-gray-100 text-center space-y-3">
          {!isAdminLogin ? (
            <p className="text-xs text-gray-500">
              Don&apos;t have an account yet?{' '}
              <Link to="/signup" className="font-bold text-[#07131A] hover:underline">
                Create an Account
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                Are you a customer?{' '}
                <Link to="/login" className="font-bold text-[#07131A] hover:underline">
                  Customer Sign In
                </Link>
              </p>
              <button
                type="button"
                onClick={() => {
                  setDemoAdminMode(true);
                  navigate('/admin');
                }}
                className="text-[11px] text-gray-400 hover:text-gray-600 block mx-auto underline pt-1"
              >
                Enable Admin Preview Mode (Local Development)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Supabase Key Modal */}
      <SupabaseKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onContinueDemo={() => {
          setShowKeyModal(false);
          setDemoAdminMode(true);
          navigate(from);
        }}
      />
    </div>
  );
};
