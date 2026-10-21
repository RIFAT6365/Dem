/**
 * Supabase Review Service
 * Handles customer feedback, star ratings, and admin moderation in public.reviews
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Review } from '../types';

export const reviewService = {
  fetchReviews: async (adminView = false): Promise<Review[] | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (!adminView) {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;
      if (error) return null;

      return (data || []).map((row) => ({
        id: row.id,
        productId: row.product_id || undefined,
        productName: row.product_name || undefined,
        authorName: row.author_name,
        authorAvatar: row.author_avatar || undefined,
        rating: row.rating,
        comment: row.comment,
        date: row.date,
        isApproved: Boolean(row.is_approved),
        verifiedPurchase: Boolean(row.verified_purchase),
      }));
    } catch {
      return null;
    }
  },

  createReview: async (review: Omit<Review, 'id' | 'date' | 'isApproved'>, userId?: string): Promise<Review> => {
    const newId = `rev-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const newReview: Review = {
      ...review,
      id: newId,
      date: today,
      isApproved: true,
    };

    if (isSupabaseConfigured()) {
      await supabase.from('reviews').insert({
        id: newId,
        product_id: review.productId || null,
        product_name: review.productName || null,
        user_id: userId || null,
        author_name: review.authorName,
        author_avatar: review.authorAvatar || null,
        rating: review.rating,
        comment: review.comment,
        date: today,
        is_approved: true,
        verified_purchase: review.verifiedPurchase,
      });
    }

    return newReview;
  },

  toggleApproval: async (id: string, currentStatus: boolean): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    await supabase.from('reviews').update({ is_approved: !currentStatus }).eq('id', id);
  },

  deleteReview: async (id: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    await supabase.from('reviews').delete().eq('id', id);
  },
};
