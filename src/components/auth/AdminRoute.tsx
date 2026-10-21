/**
 * Admin Route Guard
 * Enforces role-based access control for /admin/*
 * Rejects regular customers and unauthenticated visitors
 */

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ShieldCheck, ArrowRight, Lock, KeyRound } from 'lucide-react';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading, isSupabaseReady, demoAdminActive, setDemoAdminMode } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07131A] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F5B51B] flex items-center justify-center text-[#07131A] animate-pulse">
          <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
        </div>
        <p className="text-gray-400 text-xs mt-4 tracking-wide font-medium">
          Verifying Administrator Privileges...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#07131A] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0E1E28] rounded-3xl border border-[#223544] p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold text-white">Administrator Access Required</h1>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              {user
                ? `Signed in as ${user.email}. This account does not have the 'admin' role in public.user_roles.`
                : 'You must sign in with an authorized administrative account to access the dashboard.'}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/admin/login"
              state={{ from: location }}
              className="w-full py-3 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              <span>Admin Login</span>
            </Link>

            <Link
              to="/"
              className="w-full py-3 rounded-xl bg-[#152733] hover:bg-[#1c3344] text-gray-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-gray-700/50"
            >
              <span>Back to Public Website</span>
            </Link>
          </div>

          {/* Quick Demo Preview Bypass Option with explanatory banner */}
          <div className="pt-4 border-t border-[#1c2c37] text-left">
            <div className="bg-[#152733]/60 rounded-xl p-3 border border-[#F5B51B]/20">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F5B51B] shrink-0 mt-0.5" />
                <div className="text-[11px] text-gray-300 leading-normal">
                  <span className="font-bold text-white block mb-0.5">Development Preview</span>
                  Click below to enable local Admin Preview mode while configuring your Supabase administrator role.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDemoAdminMode(true)}
                className="mt-2.5 w-full py-2 rounded-lg bg-[#F5B51B]/15 hover:bg-[#F5B51B]/25 text-[#F5B51B] border border-[#F5B51B]/40 text-[11px] font-bold transition-all text-center"
              >
                Enable Admin Preview Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
