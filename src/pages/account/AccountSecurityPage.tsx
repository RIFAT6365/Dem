/**
 * Customer Account Security Page
 * Update password and view session security
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export const AccountSecurityPage: React.FC = () => {
  const { user, resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(password);
      setSuccessMsg('Your account password has been updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="pb-4 border-b border-gray-100">
        <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#E9A817]" />
          <span>Security & Password</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage your credentials and password security
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
            New Password (Min. 6 chars)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
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
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 ${
            isSubmitting
              ? 'bg-gray-300 text-gray-600 cursor-wait'
              : 'bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] shadow-[#F5B51B]/25 active:scale-95'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isSubmitting ? 'Updating...' : 'Change Password'}</span>
        </button>
      </form>
    </div>
  );
};
