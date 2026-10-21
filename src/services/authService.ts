/**
 * Centralized Supabase Auth Service
 * Covers customer registration, 6-digit email OTP, login, password recovery, session management
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  loyaltyPoints?: number;
  membershipTier?: string;
  createdAt?: string;
}

export type UserRole = 'customer' | 'admin' | 'staff';

export const authService = {
  /**
   * Customer Sign-up with full name, email, password, and phone
   * Creates auth.users record. Triggers auto-insert into public.profiles & public.user_roles ('customer').
   */
  signUp: async (params: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase publishable key is not configured.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: params.email.trim(),
      password: params.password,
      options: {
        data: {
          full_name: params.fullName.trim(),
          phone: params.phone?.trim() || '',
        },
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Email and Password Sign In
   */
  signInWithPassword: async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase publishable key is not configured.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Send Email OTP (for passwordless login or verification)
   */
  signInWithOtp: async (email: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase publishable key is not configured.');
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Verify 6-digit Email OTP for sign up or email verification
   */
  verifyOtp: async (email: string, token: string, type: 'signup' | 'email' = 'signup') => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase publishable key is not configured.');
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Resend verification email / OTP
   */
  resendVerificationEmail: async (email: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase publishable key is not configured.');
    }

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });

    if (error) throw error;
    return data;
  },

  /**
   * Request password recovery email
   */
  resetPasswordForEmail: async (email: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase publishable key is not configured.');
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Update password (called from /reset-password or /account/security)
   */
  updatePassword: async (newPassword: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase publishable key is not configured.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get active session
   */
  getSession: async (): Promise<Session | null> => {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Fetch current user profile from public.profiles
   */
  getProfile: async (userId: string): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching user profile:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      fullName: data.full_name || '',
      email: data.email || '',
      phone: data.phone || '',
      avatarUrl: data.avatar_url,
      loyaltyPoints: data.loyalty_points ?? 100,
      membershipTier: data.membership_tier ?? 'Silver',
      createdAt: data.created_at,
    };
  },

  /**
   * Update customer profile in public.profiles
   */
  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase publishable key is not configured.');
    }

    const dbPayload: Record<string, any> = {};
    if (updates.fullName !== undefined) dbPayload.full_name = updates.fullName;
    if (updates.phone !== undefined) dbPayload.phone = updates.phone;
    if (updates.avatarUrl !== undefined) dbPayload.avatar_url = updates.avatarUrl;
    dbPayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(dbPayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Check user role from public.user_roles table
   * Never trusts client-side metadata
   */
  getUserRole: async (userId: string): Promise<UserRole> => {
    if (!isSupabaseConfigured()) return 'customer';

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error || !data || data.length === 0) {
        return 'customer';
      }

      const hasAdmin = data.some((r) => r.role === 'admin');
      return hasAdmin ? 'admin' : ((data[0].role as UserRole) || 'customer');
    } catch {
      return 'customer';
    }
  },

  /**
   * Fetch all registered profiles (for Admin customer directory)
   */
  getAllProfiles: async (): Promise<UserProfile[]> => {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((d: any) => ({
        id: d.id,
        fullName: d.full_name || '',
        email: d.email || '',
        phone: d.phone || '',
        avatarUrl: d.avatar_url,
        loyaltyPoints: d.loyalty_points ?? 100,
        membershipTier: d.membership_tier ?? 'Silver',
        createdAt: d.created_at,
      }));
    } catch {
      return [];
    }
  },
};
