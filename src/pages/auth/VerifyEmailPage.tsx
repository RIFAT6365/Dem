/**
 * Email Verification & OTP Page
 * Supports 6-digit OTP code verification, resend cooldown, and instant session activation
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MailCheck,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOtp, resendVerification } = useAuth();

  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleOtpChange = (index: number, val: string) => {
    // Only accept numeric digit
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const updated = [...otp];
    updated[index] = cleaned;
    setOtp(updated);
    setErrorMsg('');

    // Auto-advance focus to next digit box
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const updated = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    setOtp(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const token = otp.join('');
    if (token.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!email) {
      setErrorMsg('Please specify your registered email address.');
      return;
    }

    setIsLoading(true);

    try {
      await verifyOtp(email.trim(), token, 'signup');
      setSuccessMsg('Email verified successfully! Redirecting to your account...');
      setTimeout(() => {
        navigate('/account', { replace: true });
      }, 1500);
    } catch (err: any) {
      setErrorMsg(
        err?.message?.includes('expired')
          ? 'Verification code has expired. Please request a new one.'
          : err?.message || 'Invalid 6-digit code. Please verify and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;

    try {
      setErrorMsg('');
      await resendVerification(email.trim());
      setSuccessMsg('A fresh verification code has been dispatched to your email.');
      setCooldown(60);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend code. Please try again later.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E9E9E5] p-8 sm:p-10 shadow-lg space-y-6 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-3xl bg-[#FFF8E7] border border-[#F5B51B]/40 text-[#E9A817] flex items-center justify-center mx-auto shadow-sm">
          <MailCheck className="w-8 h-8" />
        </div>

        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            We sent a 6-digit verification code to
          </p>
          <div className="font-bold text-xs text-gray-800 bg-gray-50 py-1.5 px-3 rounded-lg mt-1 inline-block border border-gray-200">
            {email || 'your email address'}
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-relaxed font-semibold">{successMsg}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          {!emailParam && (
            <div className="text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>
          )}

          {/* 6 Digits Boxes */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center font-bold text-xl sm:text-2xl rounded-xl border-2 border-gray-200 bg-gray-50 text-[#07131A] focus:bg-white focus:border-[#F5B51B] focus:ring-2 focus:ring-[#F5B51B]/30 outline-none transition-all tabular-nums"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
              isLoading || otp.join('').length !== 6
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] shadow-[#F5B51B]/25 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#07131A] border-t-transparent rounded-full animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm & Activate Account</span>
              </>
            )}
          </button>
        </form>

        {/* Resend Action */}
        <div className="pt-2 border-t border-gray-100 flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500">Didn&apos;t receive the code?</p>
          <button
            type="button"
            disabled={cooldown > 0}
            onClick={handleResend}
            className={`text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
              cooldown > 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-[#07131A] hover:text-[#E9A817] underline'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Verification Code'}</span>
          </button>
        </div>

        <div className="pt-2">
          <Link to="/login" className="text-xs text-gray-400 hover:text-gray-600">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
