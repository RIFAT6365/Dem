/**
 * Supabase Gallery Service
 * Manages gallery images in public.gallery_images
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GalleryItem } from '../types';

export const galleryService = {
  fetchGallery: async (): Promise<GalleryItem[] | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return null;

      return (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        imageUrl: row.image_url,
        caption: row.caption || undefined,
      }));
    } catch {
      return null;
    }
  },

  addGalleryItem: async (item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> => {
    const newId = `gal-${Date.now()}`;
    const newItem: GalleryItem = { ...item, id: newId };

    if (isSupabaseConfigured()) {
      await supabase.from('gallery_images').insert({
        id: newId,
        title: item.title,
        category: item.category,
        image_url: item.imageUrl,
        caption: item.caption || null,
      });
    }

    return newItem;
  },

  deleteGalleryItem: async (id: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    await supabase.from('gallery_images').delete().eq('id', id);
  },
};
