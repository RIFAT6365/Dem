/**
 * Admin Route Guard
 * Enforces role-based access control for /admin/*
 * Rejects regular customers and unauthenticated visitors.
 * Never allows client-side bypass.
 */

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ShieldCheck, Lock, KeyRound, ArrowLeft } from 'lucide-react';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07131A] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F5B51B] flex items-center justify-center text-[#07131A] animate-pulse">
          <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
        </div>
        <p className="text-gray-400 text-xs mt-4 tracking-wide font-medium">
          Verifying Database Administrator Permissions...
        </p>
      </div>
    );
  }

  // Not signed in -> send to admin login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Signed in but not an authorized admin in public.user_roles
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#07131A] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0E1E28] rounded-3xl border border-[#223544] p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold text-white">Access Denied</h1>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              You are signed in as <span className="text-gray-200 font-semibold">{user.email}</span>.
              This customer account does not have administrator privileges in the database.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#152733] border border-[#223544] text-left text-xs text-gray-300 space-y-1">
            <div className="font-bold text-[#F5B51B] text-[11px] uppercase tracking-wider">
              Security Notice
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              Administrative portal access is restricted to verified users with the <code className="text-white bg-black/40 px-1 py-0.5 rounded">'admin'</code> role in <code className="text-white bg-black/40 px-1 py-0.5 rounded">public.user_roles</code>.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/account"
              className="w-full py-3 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <span>Go to My Customer Account</span>
            </Link>

            <Link
              to="/"
              className="w-full py-3 rounded-xl bg-[#152733] hover:bg-[#1c3344] text-gray-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-gray-700/50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Restaurant Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
