/**
 * Supabase Activity Log Service
 * Records audit logs for administrative actions in public.activity_logs
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ActivityLog } from '../types';

export const activityService = {
  fetchActivityLogs: async (): Promise<ActivityLog[] | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error || !data) return null;

      return data.map((row) => ({
        id: row.id,
        action: row.action,
        details: row.details,
        category: row.category,
        timestamp: row.timestamp,
      }));
    } catch {
      return null;
    }
  },

  logAction: async (
    action: string,
    details: string,
    category: ActivityLog['category'],
    userId?: string
  ): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('activity_logs').insert({
        id: `act-${Date.now()}`,
        action,
        details,
        category,
        user_id: userId || null,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to insert activity log to Supabase:', err);
    }
  },
};
