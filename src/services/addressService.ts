/**
 * Customer Addresses Service
 * Manages saved delivery locations in public.addresses
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isValidUuid, toValidUuidOrNull } from '../lib/uuid';

export interface CustomerAddress {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  area: string;
  address: string;
  flatOrHouse?: string;
  landmark?: string;
  isDefault: boolean;
  createdAt?: string;
}

export const addressService = {
  getUserAddresses: async (userId: string): Promise<CustomerAddress[]> => {
    if (!isSupabaseConfigured() || !userId || !isValidUuid(userId)) return [];

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) {
      console.warn('Error fetching addresses:', error.message);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      label: row.label || 'Home',
      fullName: row.full_name,
      phone: row.phone,
      city: row.city || 'Dhaka',
      area: row.area,
      address: row.address,
      flatOrHouse: row.flat_or_house,
      landmark: row.landmark,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
    }));
  },

  addAddress: async (address: Omit<CustomerAddress, 'id'>): Promise<CustomerAddress> => {
    const safeUserId = toValidUuidOrNull(address.userId);
    if (!isSupabaseConfigured() || !safeUserId) {
      return {
        ...address,
        id: `addr-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
    }

    // If marked default, unset others first
    if (address.isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', safeUserId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: safeUserId,
        label: address.label,
        full_name: address.fullName,
        phone: address.phone,
        city: address.city,
        area: address.area,
        address: address.address,
        flat_or_house: address.flatOrHouse,
        landmark: address.landmark,
        is_default: address.isDefault,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      label: data.label,
      fullName: data.full_name,
      phone: data.phone,
      city: data.city,
      area: data.area,
      address: data.address,
      flatOrHouse: data.flat_or_house,
      landmark: data.landmark,
      isDefault: Boolean(data.is_default),
      createdAt: data.created_at,
    };
  },

  updateAddress: async (id: string, updates: Partial<CustomerAddress>): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    const payload: Record<string, any> = {};
    if (updates.label !== undefined) payload.label = updates.label;
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.area !== undefined) payload.area = updates.area;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.flatOrHouse !== undefined) payload.flat_or_house = updates.flatOrHouse;
    if (updates.landmark !== undefined) payload.landmark = updates.landmark;
    if (updates.isDefault !== undefined) payload.is_default = updates.isDefault;

    const { error } = await supabase
      .from('addresses')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
  },

  deleteAddress: async (id: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) throw error;
  },
};
