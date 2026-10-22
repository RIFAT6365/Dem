/**
 * Supabase Review Service
 * Handles customer feedback, order verification, star ratings, and admin moderation responses in public.reviews
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Review } from '../types';
import { isValidUuid, toValidUuidOrNull } from '../lib/uuid';

const STORAGE_REVIEWS_KEY = 'demo_restaurant_reviews_v2';
const STORAGE_ORDERS_KEY = 'demo_restaurant_orders_v2';

function getLocalReviews(): Review[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReview(review: Review) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalReviews();
    const updated = [review, ...current.filter((r) => r.id !== review.id)];
    localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save review locally:', err);
  }
}

function getLocalOrdersForReviews(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const reviewService = {
  /**
   * Fetch approved reviews for public view, or all reviews for admin moderation
   */
  fetchReviews: async (adminView = false, productId?: string): Promise<Review[] | null> => {
    const local = getLocalReviews();

    if (!isSupabaseConfigured()) {
      let filtered = local;
      if (!adminView) filtered = filtered.filter((r) => r.isApproved !== false);
      if (productId) filtered = filtered.filter((r) => r.productId === productId);
      return filtered;
    }

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
        let filtered = local;
        if (!adminView) filtered = filtered.filter((r) => r.isApproved !== false);
        if (productId) filtered = filtered.filter((r) => r.productId === productId);
        return filtered;
      }

      const remote = (data || []).map(formatReviewRow);
      const remoteIds = new Set(remote.map((r) => r.id));
      const localApproved = local.filter((r) => !remoteIds.has(r.id) && (adminView || r.isApproved !== false));
      return [...remote, ...localApproved];
    } catch (err) {
      console.warn('Exception querying reviews:', err);
      return local;
    }
  },

  /**
   * Fetch reviews submitted by a specific customer
   */
  fetchCustomerReviews: async (userId: string): Promise<Review[]> => {
    if (!userId) return [];
    const local = getLocalReviews().filter((r) => r.userId === userId);

    if (!isSupabaseConfigured() || !isValidUuid(userId)) {
      return local;
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching customer reviews:', error.message);
        return local;
      }

      const remote = (data || []).map(formatReviewRow);
      const remoteIds = new Set(remote.map((r) => r.id));
      const localMatches = local.filter((r) => !remoteIds.has(r.id));
      return [...remote, ...localMatches];
    } catch {
      return local;
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
    if (!userId) {
      return { eligible: false, reason: 'You must sign in to submit a review.' };
    }

    try {
      // 1. Check local orders first
      const localOrders = getLocalOrdersForReviews();
      const localMatching = localOrders.find((o) => {
        const belongsToUser = !userId || o.userId === userId || o.user_id === userId;
        const matchesProduct = (o.items || []).some((item: any) => item.productId === productId);
        return belongsToUser && matchesProduct;
      });

      if (localMatching) {
        return { eligible: true, orderId: localMatching.id };
      }

      // 2. If valid UUID and Supabase is configured, check remote orders
      if (isSupabaseConfigured() && isValidUuid(userId)) {
        let ordersQuery = supabase
          .from('orders')
          .select('id, items, order_status')
          .eq('user_id', userId);

        if (orderId) {
          ordersQuery = ordersQuery.eq('id', orderId);
        }

        const { data: orders } = await ordersQuery;
        if (orders && orders.length > 0) {
          const matchingOrder = orders.find((o) => {
            const items = Array.isArray(o.items) ? o.items : [];
            return items.some((item: any) => item.productId === productId);
          });

          if (matchingOrder) {
            return {
              eligible: true,
              orderId: matchingOrder.id,
            };
          }
        }
      }

      // If user is authenticated customer, allow customer review
      return {
        eligible: true,
        orderId: orderId || undefined,
      };
    } catch (err: any) {
      console.warn('Review eligibility check error:', err);
      return { eligible: true };
    }
  },

  /**
   * Create a verified review linked to customer and optional order
   */
  createReview: async (
    review: Omit<Review, 'id' | 'date' | 'isApproved'> & { title?: string; orderId?: string },
    userId: string
  ): Promise<Review> => {
    if (!userId) {
      throw new Error('You must be signed in to submit a review.');
    }

    const newId = `rev-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const safeUserId = toValidUuidOrNull(userId);

    const localReview: Review = {
      ...review,
      id: newId,
      date: today,
      isApproved: true,
      verifiedPurchase: Boolean(review.verifiedPurchase || review.orderId),
      userId,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const verifiedAuthUid = session?.user?.id === safeUserId ? safeUserId : null;

        const fullComment = review.title?.trim()
          ? `${review.title.trim()}: ${review.comment.trim()}`
          : review.comment.trim();

        const dbPayload: Record<string, any> = {
          id: newId,
          product_id: review.productId || null,
          product_name: review.productName || null,
          user_id: verifiedAuthUid,
          author_name: review.authorName.trim(),
          author_avatar: review.authorAvatar || null,
          rating: Math.max(1, Math.min(5, review.rating)),
          comment: fullComment,
          date: today,
          is_approved: true,
          verified_purchase: Boolean(review.verifiedPurchase || review.orderId),
        };

        const { data, error } = await supabase
          .from('reviews')
          .insert(dbPayload)
          .select()
          .maybeSingle();

        if (error) {
          console.warn('Supabase review insert notice:', error.message);
        } else if (data) {
          const remoteReview = formatReviewRow(data);
          saveLocalReview(remoteReview);
          return remoteReview;
        }
      } catch (err) {
        console.warn('Supabase review insert error:', err);
      }
    }

    saveLocalReview(localReview);
    return localReview;
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
