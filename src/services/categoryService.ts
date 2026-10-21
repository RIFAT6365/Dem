/**
 * Supabase Category Service
 * Handles food menu categories in public.categories
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Category } from '../types';

export const categoryService = {
  fetchCategories: async (): Promise<Category[] | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Error fetching categories from Supabase:', error.message);
        return null;
      }

      return (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description || '',
        image: row.image || '',
        displayOrder: row.display_order || 0,
        isActive: Boolean(row.is_active),
      }));
    } catch (err) {
      console.warn('Supabase category query exception:', err);
      return null;
    }
  },

  createCategory: async (cat: Omit<Category, 'id'>): Promise<Category> => {
    const newId = `cat-${Date.now()}`;

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('categories').insert({
        id: newId,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        display_order: cat.displayOrder,
        is_active: cat.isActive,
      });

      if (error) {
        console.warn('Failed to insert category into Supabase:', error.message);
      }
    }

    return {
      ...cat,
      id: newId,
    };
  },

  updateCategory: async (id: string, updates: Partial<Category>): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.image !== undefined) payload.image = updates.image;
    if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    const { error } = await supabase.from('categories').update(payload).eq('id', id);
    if (error) {
      console.warn('Failed to update category in Supabase:', error.message);
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.warn('Failed to delete category in Supabase:', error.message);
    }
  },
};
