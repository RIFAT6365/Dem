/**
 * Supabase Notification Service
 * Manages persisted user and admin notifications in public.notifications
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { NotificationItem } from '../types';

export const notificationService = {
  /**
   * Fetch notifications for the current authenticated user (or all if admin)
   */
  fetchUserNotifications: async (userId?: string, isAdmin = false): Promise<NotificationItem[]> => {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!isAdmin && userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        // Table might be awaiting schema migration or permission
        console.warn('Notifications fetch issue:', error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: String(row.id),
        userId: row.user_id || undefined,
        title: row.title,
        message: row.message,
        type: row.type || 'system',
        link: row.link || undefined,
        relatedEntityId: row.related_entity_id || undefined,
        read: Boolean(row.is_read),
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Exception querying notifications:', err);
      return [];
    }
  },

  /**
   * Create a persisted notification
   */
  createNotification: async (params: {
    userId?: string;
    title: string;
    message: string;
    type: 'order' | 'reservation' | 'promo' | 'system' | 'review';
    link?: string;
    relatedEntityId?: string;
  }): Promise<NotificationItem | null> => {
    const fallbackId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const notifItem: NotificationItem = {
      id: fallbackId,
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
      relatedEntityId: params.relatedEntityId,
      read: false,
      createdAt: now,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            user_id: params.userId || null,
            title: params.title,
            message: params.message,
            type: params.type,
            link: params.link || null,
            related_entity_id: params.relatedEntityId || null,
            is_read: false,
          })
          .select()
          .maybeSingle();

        if (error) {
          console.warn('Could not persist notification to Supabase:', error.message);
          return notifItem;
        }

        if (data) {
          return {
            id: String(data.id),
            userId: data.user_id || undefined,
            title: data.title,
            message: data.message,
            type: data.type || 'system',
            link: data.link || undefined,
            relatedEntityId: data.related_entity_id || undefined,
            read: Boolean(data.is_read),
            createdAt: data.created_at,
          };
        }
      } catch (err) {
        console.warn('Exception inserting notification:', err);
      }
    }

    return notifItem;
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.warn('Failed to mark notification read in Supabase:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead: async (userId?: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) return true;

    try {
      let query = supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { error } = await query;
      if (error) {
        console.warn('Failed to mark all notifications read:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },
};
