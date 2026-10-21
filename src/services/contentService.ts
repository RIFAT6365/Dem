/**
 * Supabase Content & Settings Service
 * Manages site_settings, navigation_items, and CMS content
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WebsiteSettings, NavigationLink } from '../types';

export const contentService = {
  fetchSettings: async (): Promise<WebsiteSettings | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('settings')
        .eq('id', 'current')
        .maybeSingle();

      if (error || !data?.settings) return null;
      return data.settings as WebsiteSettings;
    } catch {
      return null;
    }
  },

  updateSettings: async (settings: WebsiteSettings): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('site_settings').upsert({
        id: 'current',
        settings,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to persist site settings to Supabase:', err);
    }
  },

  fetchNavigation: async (): Promise<NavigationLink[] | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('order_num', { ascending: true });

      if (error || !data || data.length === 0) return null;

      return data.map((row) => ({
        id: row.id,
        label: row.label,
        path: row.path,
        isVisible: Boolean(row.is_visible),
        order: row.order_num || 0,
      }));
    } catch {
      return null;
    }
  },

  updateNavigation: async (links: NavigationLink[]): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    try {
      for (const link of links) {
        await supabase.from('navigation_items').upsert({
          id: link.id,
          label: link.label,
          path: link.path,
          is_visible: link.isVisible,
          order_num: link.order,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Failed to update navigation items in Supabase:', err);
    }
  },
};
