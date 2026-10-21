/**
 * Supabase Review Service
 * Handles customer feedback, order verification, star ratings, and admin moderation responses in public.reviews
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Review } from '../types';

export const reviewService = {
  /**
   * Fetch approved reviews for public view, or all reviews for admin moderation
   */
  fetchReviews: async (adminView = false, productId?: string): Promise<Review[] | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!adminView) {
        query = query.eq('is_approved', true);
      }

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Error querying reviews from Supabase:', error.message);
        return null;
      }

      return (data || []).map(formatReviewRow);
    } catch (err) {
      console.warn('Exception querying reviews:', err);
      return null;
    }
  },

  /**
   * Fetch reviews submitted by a specific customer
   */
  fetchCustomerReviews: async (userId: string): Promise<Review[]> => {
    if (!isSupabaseConfigured() || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching customer reviews:', error.message);
        return [];
      }

      return (data || []).map(formatReviewRow);
    } catch {
      return [];
    }
  },

  /**
   * Verify whether a customer is eligible to review a product based on completed order history
   */
  checkReviewEligibility: async (
    userId: string,
    productId: string,
    orderId?: string
  ): Promise<{ eligible: boolean; orderId?: string; reason?: string }> => {
    if (!isSupabaseConfigured() || !userId) {
      return { eligible: false, reason: 'You must sign in to submit a review.' };
    }

    try {
      // 1. Check if user already reviewed this product
      let existingReviewQuery = supabase
        .from('reviews')
        .select('id, order_id')
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (orderId) {
        existingReviewQuery = existingReviewQuery.eq('order_id', orderId);
      }

      const { data: existingReviews } = await existingReviewQuery;
      if (existingReviews && existingReviews.length > 0) {
        return {
          eligible: false,
          reason: 'You have already submitted a review for this purchase.',
        };
      }

      // 2. Query completed/delivered orders belonging to user
      let ordersQuery = supabase
        .from('orders')
        .select('id, items, order_status')
        .eq('user_id', userId)
        .in('order_status', ['Completed', 'Delivered']);

      if (orderId) {
        ordersQuery = ordersQuery.eq('id', orderId);
      }

      const { data: orders, error: ordersErr } = await ordersQuery;
      if (ordersErr || !orders || orders.length === 0) {
        return {
          eligible: false,
          reason: 'Reviews are only permitted after receiving a completed food delivery order for this dish.',
        };
      }

      // 3. Verify product is in ordered items
      const matchingOrder = orders.find((o) => {
        const items = Array.isArray(o.items) ? o.items : [];
        return items.some((item: any) => item.productId === productId);
      });

      if (!matchingOrder) {
        return {
          eligible: false,
          reason: 'This product was not found in your completed orders.',
        };
      }

      return {
        eligible: true,
        orderId: matchingOrder.id,
      };
    } catch (err: any) {
      console.warn('Review eligibility check error:', err);
      return { eligible: false, reason: 'Could not verify purchase history.' };
    }
  },

  /**
   * Create a verified review linked to authenticated customer and order
   */
  createReview: async (
    review: Omit<Review, 'id' | 'date' | 'isApproved'> & { title?: string; orderId?: string },
    userId: string
  ): Promise<Review> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }
    if (!userId) {
      throw new Error('You must be signed in to submit a review.');
    }

    const newId = `rev-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const dbPayload: Record<string, any> = {
      id: newId,
      product_id: review.productId || null,
      product_name: review.productName || null,
      order_id: review.orderId || null,
      user_id: userId,
      author_name: review.authorName.trim(),
      author_avatar: review.authorAvatar || null,
      rating: Math.max(1, Math.min(5, review.rating)),
      title: review.title?.trim() || null,
      comment: review.comment.trim(),
      date: today,
      is_approved: true, // Default visible or pending moderation
      verified_purchase: Boolean(review.verifiedPurchase || review.orderId),
    };

    const { data, error } = await supabase.from('reviews').insert(dbPayload).select().single();

    if (error) {
      console.error('Failed to insert review into Supabase:', error.message);
      throw new Error(`Review submission failed: ${error.message}`);
    }

    return formatReviewRow(data);
  },

  /**
   * Toggle review approval / publication
   */
  toggleApproval: async (id: string, currentStatus: boolean): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('reviews').update({ is_approved: !currentStatus }).eq('id', id);
    if (error) {
      console.error('Failed to update review approval:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * Post an administrator reply / response to a customer review
   */
  respondToReview: async (id: string, responseText: string, adminUserId?: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    const { error } = await supabase
      .from('reviews')
      .update({
        admin_response: responseText.trim(),
        admin_responded_at: new Date().toISOString(),
        admin_responder_id: adminUserId || null,
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to update review response:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * Delete review
   */
  deleteReview: async (id: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete review:', error.message);
      throw new Error(error.message);
    }
  },
};

export function formatReviewRow(row: any): Review {
  return {
    id: row.id,
    productId: row.product_id || undefined,
    productName: row.product_name || undefined,
    orderId: row.order_id || undefined,
    userId: row.user_id || undefined,
    authorName: row.author_name,
    authorAvatar: row.author_avatar || undefined,
    rating: Number(row.rating),
    title: row.title || undefined,
    comment: row.comment,
    date: row.date,
    isApproved: Boolean(row.is_approved),
    verifiedPurchase: Boolean(row.verified_purchase),
    adminResponse: row.admin_response || undefined,
    adminRespondedAt: row.admin_responded_at || undefined,
    createdAt: row.created_at,
  };
}
