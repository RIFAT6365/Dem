/**
 * Customer Route Guard
 * Protects /account/* routes for logged-in customers
 */

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogIn, ArrowRight } from 'lucide-react';

export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-[#F5B51B] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-xs mt-4">Loading your account details...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
