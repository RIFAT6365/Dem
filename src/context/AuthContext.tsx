/**
 * Centralized Supabase Auth Context
 * Handles session restoration, role enforcement, profile synchronization, OTP verification,
 * and seamless fallback demo session handling.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService, UserProfile, UserRole } from '../services/authService';

import { DEMO_ADMIN_ID, DEMO_CUSTOMER_ID, isValidUuid } from '../lib/uuid';

export { DEMO_ADMIN_ID, DEMO_CUSTOMER_ID };

const DEMO_ADMIN_USER: User = {
  id: DEMO_ADMIN_ID,
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {
    full_name: 'Restaurant Administrator',
    phone: '+880 1711 223344',
  },
  aud: 'authenticated',
  confirmation_sent_at: '',
  recovery_sent_at: '',
  email_change_sent_at: '',
  new_email: '',
  invited_at: '',
  action_link: '',
  email: 'admin@demorestaurant.com',
  phone: '+880 1711 223344',
  created_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  phone_confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  identities: [],
  factors: [],
};

const DEMO_CUSTOMER_USER: User = {
  id: DEMO_CUSTOMER_ID,
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {
    full_name: 'Valued Customer',
    phone: '+880 1711 998877',
  },
  aud: 'authenticated',
  confirmation_sent_at: '',
  recovery_sent_at: '',
  email_change_sent_at: '',
  new_email: '',
  invited_at: '',
  action_link: '',
  email: 'customer@demorestaurant.com',
  phone: '+880 1711 998877',
  created_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  phone_confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  identities: [],
  factors: [],
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseReady: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  signInAsDemo: (demoRole: 'admin' | 'customer') => Promise<void>;
  signUp: (params: { fullName: string; email: string; password: string; phone?: string }) => Promise<{ needsEmailVerification: boolean }>;
  verifyOtp: (email: string, token: string, type?: 'signup' | 'email') => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  const loadUserData = async (currentUser: User | null) => {
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      setRole('customer');
      return;
    }

    setUser(currentUser);

    // Mock admin user handling
    if (currentUser.id === DEMO_ADMIN_ID || currentUser.id === 'demo-admin-id') {
      setProfile({
        id: DEMO_ADMIN_ID,
        fullName: 'Restaurant Administrator',
        email: 'admin@demorestaurant.com',
        phone: '+880 1711 223344',
        loyaltyPoints: 500,
        membershipTier: 'Platinum',
      });
      setRole('admin');
      return;
    }

    // Mock customer user handling
    if (currentUser.id === DEMO_CUSTOMER_ID || currentUser.id === 'demo-customer-id') {
      setProfile({
        id: DEMO_CUSTOMER_ID,
        fullName: currentUser.user_metadata?.full_name || 'Valued Customer',
        email: currentUser.email || 'customer@demorestaurant.com',
        phone: currentUser.phone || '+880 1711 998877',
        loyaltyPoints: 120,
        membershipTier: 'Silver',
      });
      setRole('customer');
      return;
    }

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
      setRole('customer');
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

    const mockSession = typeof window !== 'undefined' ? localStorage.getItem('dem_mock_session') : null;
    if (mockSession === 'admin') {
      loadUserData(DEMO_ADMIN_USER).finally(() => {
        setIsLoading(false);
      });
      return;
    } else if (mockSession === 'customer') {
      loadUserData(DEMO_CUSTOMER_USER).finally(() => {
        setIsLoading(false);
      });
      return;
    }

    if (!ready) {
      setIsLoading(false);
      return;
    }

    // Restore active session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session?.user ?? null).finally(() => {
        setIsLoading(false);
      });
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (localStorage.getItem('dem_mock_session')) {
        return;
      }
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

  const signInAsDemo = async (demoRole: 'admin' | 'customer') => {
    setIsLoading(true);
    try {
      localStorage.setItem('dem_mock_session', demoRole);
      if (demoRole === 'admin') {
        await loadUserData(DEMO_ADMIN_USER);
      } else {
        await loadUserData(DEMO_CUSTOMER_USER);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim();
    try {
      // 1. Check for explicit demo credentials
      const isExplicitDemoAdmin =
        (cleanEmail.toLowerCase() === 'admin@demorestaurant.com' || cleanEmail.toLowerCase() === 'admin@bellagio.com') &&
        (password === 'admin123' || password === 'admin');

      const isExplicitDemoCustomer =
        (cleanEmail.toLowerCase() === 'customer@demorestaurant.com' || cleanEmail.toLowerCase() === 'customer@bellagio.com') &&
        (password === 'customer123' || password === 'customer');

      if (isExplicitDemoAdmin) {
        localStorage.setItem('dem_mock_session', 'admin');
        await loadUserData(DEMO_ADMIN_USER);
        return;
      }

      if (isExplicitDemoCustomer) {
        localStorage.setItem('dem_mock_session', 'customer');
        await loadUserData(DEMO_CUSTOMER_USER);
        return;
      }

      // 2. Real Supabase Authentication — strictly validate against Supabase
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase database is not configured. Please supply your API key or use Quick Demo login.');
      }

      const result = await authService.signInWithPassword(cleanEmail, password);
      localStorage.removeItem('dem_mock_session');
      await loadUserData(result.user);
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (
        msg.toLowerCase().includes('invalid login credentials') ||
        msg.toLowerCase().includes('invalid grant') ||
        msg.toLowerCase().includes('invalid_grant')
      ) {
        throw new Error('Incorrect email or password. Please verify your credentials and try again.');
      }
      if (msg.toLowerCase().includes('email not confirmed')) {
        throw new Error('Your email has not been confirmed yet. Please check your inbox or sign in with OTP.');
      }
      throw new Error(msg || 'Failed to sign in. Please verify your credentials.');
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
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase database is not configured. Please enter your publishable key.');
      }

      const result = await authService.signUp(params);
      const needsEmailVerification = !result.session && Boolean(result.user);
      if (result.user && result.session) {
        localStorage.removeItem('dem_mock_session');
        await loadUserData(result.user);
      }
      return { needsEmailVerification };
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.toLowerCase().includes('user already registered') || msg.toLowerCase().includes('already exists')) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }
      throw new Error(msg || 'Failed to register account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, token: string, type: 'signup' | 'email' = 'signup') => {
    setIsLoading(true);
    try {
      const result = await authService.verifyOtp(email, token, type);
      if (result.user) {
        localStorage.removeItem('dem_mock_session');
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
    if (
      user.id === DEMO_ADMIN_ID ||
      user.id === DEMO_CUSTOMER_ID ||
      user.id === 'demo-admin-id' ||
      user.id === 'demo-customer-id'
    ) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return;
    }
    await authService.updateProfile(user.id, updates);
    await refreshProfile();
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('dem_mock_session');
      await authService.signOut().catch(() => {});
      setUser(null);
      setProfile(null);
      setRole('customer');
    } finally {
      setIsLoading(false);
    }
  };

  // Strictly database-authorized admin status or demo admin
  const isAdmin = Boolean(user) && role === 'admin';
  const isAuthenticated = Boolean(user);

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
        signIn,
        signInWithOtp,
        signInAsDemo,
        signUp,
        verifyOtp,
        resendVerification,
        forgotPassword,
        resetPassword,
        updateProfile,
        signOut,
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
