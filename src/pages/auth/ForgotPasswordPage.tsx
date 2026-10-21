/**
 * Forgot Password Page
 * Official Supabase password recovery flow
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, Mail, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword(email.trim());
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to dispatch password recovery email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E9E9E5] p-8 sm:p-10 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] text-[#E9A817] flex items-center justify-center mx-auto shadow-sm border border-[#F5B51B]/30">
            <KeyRound className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 mt-2">Reset Password</h1>
          <p className="text-xs text-gray-500">
            Enter your registered email address and we will send you a secure password reset link.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-sm">Recovery Email Dispatched</p>
            <p className="text-gray-600 leading-relaxed">
              We have sent password reset instructions to <strong>{email}</strong>. Please check your inbox and click the reset link.
            </p>
            <Link
              to="/login"
              className="inline-block mt-3 px-5 py-2.5 rounded-xl bg-[#07131A] text-[#F5B51B] font-bold text-xs"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Registered Email
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
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-gray-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
