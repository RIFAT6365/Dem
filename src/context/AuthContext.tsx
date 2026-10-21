/**
 * Centralized Supabase Auth Context
 * Handles session restoration, role enforcement, profile synchronization, and OTP verification
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService, UserProfile, UserRole } from '../services/authService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseReady: boolean;
  demoAdminActive: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  signUp: (params: { fullName: string; email: string; password: string; phone?: string }) => Promise<{ needsEmailVerification: boolean }>;
  verifyOtp: (email: string, token: string, type?: 'signup' | 'email') => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  setDemoAdminMode: (enabled: boolean) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [demoAdminActive, setDemoAdminActiveState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dem_demo_admin_active') === 'true';
    }
    return false;
  });

  const setDemoAdminMode = (enabled: boolean) => {
    setDemoAdminActiveState(enabled);
    if (typeof window !== 'undefined') {
      if (enabled) {
        localStorage.setItem('dem_demo_admin_active', 'true');
      } else {
        localStorage.removeItem('dem_demo_admin_active');
      }
    }
  };

  const loadUserData = async (currentUser: User | null) => {
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      setRole('customer');
      return;
    }

    setUser(currentUser);

    try {
      const [userProfile, userRole] = await Promise.all([
        authService.getProfile(currentUser.id),
        authService.getUserRole(currentUser.id),
      ]);

      setProfile(
        userProfile || {
          id: currentUser.id,
          fullName: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Customer',
          email: currentUser.email || '',
          phone: currentUser.user_metadata?.phone || '',
          loyaltyPoints: 100,
          membershipTier: 'Silver',
        }
      );
      setRole(userRole);
    } catch (err) {
      console.warn('Error loading user data from Supabase:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  useEffect(() => {
    const ready = isSupabaseConfigured();
    setIsSupabaseReady(ready);

    if (!ready) {
      setIsLoading(false);
      return;
    }

    // Restore active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session?.user ?? null).finally(() => {
        setIsLoading(false);
      });
    });

    // Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await loadUserData(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setRole('customer');
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithPassword(email, password);
      await loadUserData(result.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOtp = async (email: string) => {
    await authService.signInWithOtp(email);
  };

  const signUp = async (params: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await authService.signUp(params);
      // If email confirmation is enabled in Supabase, user may not have an active session yet
      const needsEmailVerification = !result.session && Boolean(result.user);
      if (result.user && result.session) {
        await loadUserData(result.user);
      }
      return { needsEmailVerification };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, token: string, type: 'signup' | 'email' = 'signup') => {
    setIsLoading(true);
    try {
      const result = await authService.verifyOtp(email, token, type);
      if (result.user) {
        await loadUserData(result.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    await authService.resendVerificationEmail(email);
  };

  const forgotPassword = async (email: string) => {
    await authService.resetPasswordForEmail(email);
  };

  const resetPassword = async (newPassword: string) => {
    await authService.updatePassword(newPassword);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');
    await authService.updateProfile(user.id, updates);
    await refreshProfile();
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setRole('customer');
      setDemoAdminMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = role === 'admin' || demoAdminActive;
  const isAuthenticated = Boolean(user) || demoAdminActive;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isAuthenticated,
        isLoading,
        isSupabaseReady,
        demoAdminActive,
        signIn,
        signInWithOtp,
        signUp,
        verifyOtp,
        resendVerification,
        forgotPassword,
        resetPassword,
        updateProfile,
        signOut,
        setDemoAdminMode,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
