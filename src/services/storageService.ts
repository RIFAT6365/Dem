/**
 * Supabase Storage Service
 * Handles uploading food images, dish photos, and banners to Supabase Storage buckets
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const storageService = {
  /**
   * Upload image to Supabase Storage bucket ('product-images' or 'restaurant-gallery')
   */
  uploadImage: async (
    file: File,
    bucket: 'product-images' | 'restaurant-gallery' = 'product-images'
  ): Promise<{ url: string; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return {
        url: '',
        error: 'Supabase is not configured. Please supply VITE_SUPABASE_PUBLISHABLE_KEY or use an image URL.',
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        url: '',
        error: 'Invalid file format. Allowed formats: JPG, PNG, WEBP, GIF.',
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        url: '',
        error: 'File size exceeds maximum allowed limit (5 MB).',
      };
    }

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return { url: '', error: error.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: publicUrlData.publicUrl };
    } catch (err: any) {
      return { url: '', error: err?.message || 'Failed to upload image' };
    }
  },

  /**
   * Remove image from bucket
   */
  deleteImage: async (
    filePath: string,
    bucket: 'product-images' | 'restaurant-gallery' = 'product-images'
  ): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.storage.from(bucket).remove([filePath]);
    } catch (err) {
      console.warn('Failed to delete image from Supabase storage:', err);
    }
  },
};
