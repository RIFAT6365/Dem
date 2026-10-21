/**
 * Customer Sign Up Page
 * Features full name, email, phone, password, confirm password, password visibility, terms agreement,
 * and automated Supabase key setup modal.
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseKeyModal } from '../../components/common/SupabaseKeyModal';
import {
  UtensilsCrossed,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { signUp, isSupabaseReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    // Check if Supabase key is configured
    if (!isSupabaseConfigured()) {
      setShowKeyModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const { needsEmailVerification } = await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });

      if (needsEmailVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      } else {
        navigate(redirectParam || '/account', { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueDemo = () => {
    setShowKeyModal(false);
    navigate('/account');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E9E9E5] p-8 sm:p-10 shadow-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-[#07131A] text-[#F5B51B] flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-6 h-6 stroke-[2.2]" />
            </div>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-gray-900 mt-2">Create Customer Account</h1>
          <p className="text-xs text-gray-500">
            Join DEM Restaurant to save delivery addresses, earn reward points, and track live orders.
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
                  To register real users into your Supabase database, paste your <code>anon</code> key.
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

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tanvir Rahman"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] focus:ring-1 focus:ring-[#F5B51B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Email Address *
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Phone Number (For Delivery Rider)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1711 223344"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] focus:ring-1 focus:ring-[#F5B51B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Password (Min. 6 characters) *
            </label>
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
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] focus:ring-1 focus:ring-[#F5B51B]"
              />
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#F5B51B] focus:ring-[#F5B51B]"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 leading-normal">
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="text-[#07131A] font-semibold underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" target="_blank" className="text-[#07131A] font-semibold underline">
                Privacy Policy
              </Link>
            </label>
          </div>

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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link
              to={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
              className="font-bold text-[#07131A] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Supabase Key Modal */}
      <SupabaseKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onContinueDemo={handleContinueDemo}
      />
    </div>
  );
};
