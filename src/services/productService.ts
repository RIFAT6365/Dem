/**
 * Supabase Product Service
 * Manages restaurant products, availability, prices, images, and add-ons
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';

export const productService = {
  fetchProducts: async (): Promise<Product[] | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching products from Supabase:', error.message);
        return null;
      }

      return (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        shortDescription: row.short_description || '',
        fullDescription: row.full_description || '',
        categoryId: row.category_id || '',
        images: Array.isArray(row.images) ? row.images : [],
        price: Number(row.price),
        salePrice: row.sale_price ? Number(row.sale_price) : undefined,
        isAvailable: Boolean(row.is_available),
        isFeatured: Boolean(row.is_featured),
        isBestseller: Boolean(row.is_bestseller),
        ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
        dietaryLabels: Array.isArray(row.dietary_labels) ? row.dietary_labels : [],
        spiceLevel: row.spice_level || 'None',
        prepTimeMinutes: row.prep_time_minutes || 20,
        addons: Array.isArray(row.addons) ? row.addons : [],
        rating: Number(row.rating || 5.0),
        reviewCount: Number(row.review_count || 0),
        seoTitle: row.seo_title,
        seoDescription: row.seo_description,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.warn('Supabase product query exception:', err);
      return null;
    }
  },

  createProduct: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const newId = `prod-${Date.now()}`;
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          id: newId,
          name: product.name,
          slug: product.slug,
          short_description: product.shortDescription,
          full_description: product.fullDescription,
          category_id: product.categoryId || null,
          images: product.images,
          price: product.price,
          sale_price: product.salePrice || null,
          is_available: product.isAvailable,
          is_featured: product.isFeatured,
          is_bestseller: product.isBestseller,
          ingredients: product.ingredients,
          dietary_labels: product.dietaryLabels,
          spice_level: product.spiceLevel,
          prep_time_minutes: product.prepTimeMinutes,
          addons: product.addons || [],
          rating: product.rating,
          review_count: product.reviewCount,
          seo_title: product.seoTitle,
          seo_description: product.seoDescription,
        })
        .select()
        .single();

      if (error) {
        console.warn('Failed to insert product into Supabase:', error.message);
      }
    }

    return {
      ...product,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.shortDescription !== undefined) payload.short_description = updates.shortDescription;
    if (updates.fullDescription !== undefined) payload.full_description = updates.fullDescription;
    if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
    if (updates.images !== undefined) payload.images = updates.images;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.salePrice !== undefined) payload.sale_price = updates.salePrice;
    if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;
    if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;
    if (updates.isBestseller !== undefined) payload.is_bestseller = updates.isBestseller;
    if (updates.ingredients !== undefined) payload.ingredients = updates.ingredients;
    if (updates.dietaryLabels !== undefined) payload.dietary_labels = updates.dietaryLabels;
    if (updates.spiceLevel !== undefined) payload.spice_level = updates.spiceLevel;
    if (updates.prepTimeMinutes !== undefined) payload.prep_time_minutes = updates.prepTimeMinutes;
    if (updates.addons !== undefined) payload.addons = updates.addons;
    if (updates.rating !== undefined) payload.rating = updates.rating;
    if (updates.reviewCount !== undefined) payload.review_count = updates.reviewCount;
    if (updates.seoTitle !== undefined) payload.seo_title = updates.seoTitle;
    if (updates.seoDescription !== undefined) payload.seo_description = updates.seoDescription;

    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) {
      console.warn('Failed to update product in Supabase:', error.message);
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.warn('Failed to delete product in Supabase:', error.message);
    }
  },
};
