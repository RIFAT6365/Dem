/**
 * Supabase Coupon Service
 * Manages discounts, limits, and promo codes in public.coupons
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Coupon } from '../types';

export const couponService = {
  fetchCoupons: async (): Promise<Coupon[] | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return null;

      return (data || []).map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        discountType: row.discount_type,
        discountValue: Number(row.discount_value),
        minOrderValue: Number(row.min_order_value || 0),
        maxDiscount: row.max_discount ? Number(row.max_discount) : undefined,
        validFrom: row.valid_from,
        validTo: row.valid_to || '',
        usageLimit: row.usage_limit || 100,
        usedCount: row.used_count || 0,
        isActive: Boolean(row.is_active),
      }));
    } catch {
      return null;
    }
  },

  createCoupon: async (coupon: Omit<Coupon, 'id' | 'usedCount'>): Promise<Coupon> => {
    const newId = `c-${Date.now()}`;

    if (isSupabaseConfigured()) {
      await supabase.from('coupons').insert({
        id: newId,
        code: coupon.code.toUpperCase().trim(),
        name: coupon.name,
        discount_type: coupon.discountType,
        discount_value: coupon.discountValue,
        min_order_value: coupon.minOrderValue,
        max_discount: coupon.maxDiscount || null,
        valid_from: coupon.validFrom,
        valid_to: coupon.validTo || null,
        usage_limit: coupon.usageLimit,
        used_count: 0,
        is_active: coupon.isActive,
      });
    }

    return {
      ...coupon,
      id: newId,
      usedCount: 0,
    };
  },

  updateCoupon: async (id: string, updates: Partial<Coupon>): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    const payload: Record<string, any> = {};
    if (updates.code) payload.code = updates.code.toUpperCase().trim();
    if (updates.name) payload.name = updates.name;
    if (updates.discountType) payload.discount_type = updates.discountType;
    if (updates.discountValue !== undefined) payload.discount_value = updates.discountValue;
    if (updates.minOrderValue !== undefined) payload.min_order_value = updates.minOrderValue;
    if (updates.maxDiscount !== undefined) payload.max_discount = updates.maxDiscount;
    if (updates.validFrom) payload.valid_from = updates.validFrom;
    if (updates.validTo !== undefined) payload.valid_to = updates.validTo;
    if (updates.usageLimit !== undefined) payload.usage_limit = updates.usageLimit;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    await supabase.from('coupons').update(payload).eq('id', id);
  },

  deleteCoupon: async (id: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    await supabase.from('coupons').delete().eq('id', id);
  },
};
