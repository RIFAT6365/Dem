/**
 * Supabase Reservation Service
 * Handles table bookings, statuses, and customer reservation histories
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Reservation, ReservationStatus } from '../types';

export const reservationService = {
  fetchReservations: async (): Promise<Reservation[] | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching reservations:', error.message);
        return null;
      }

      return (data || []).map(formatReservationRow);
    } catch {
      return null;
    }
  },

  fetchCustomerReservations: async (userId: string): Promise<Reservation[]> => {
    if (!isSupabaseConfigured() || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return [];
      return (data || []).map(formatReservationRow);
    } catch {
      return [];
    }
  },

  createReservation: async (
    resData: Omit<Reservation, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status'>,
    userId?: string
  ): Promise<Reservation> => {
    const newId = `res-${Date.now()}`;
    const referenceNumber = `RES-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const reservation: Reservation = {
      ...resData,
      id: newId,
      referenceNumber,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('reservations').insert({
          id: newId,
          reference_number: referenceNumber,
          user_id: userId || null,
          customer_name: resData.customerName,
          customer_email: resData.customerEmail,
          customer_phone: resData.customerPhone,
          date: resData.date,
          time_slot: resData.timeSlot,
          guests: resData.guests,
          seating_preference: resData.seatingPreference,
          special_requests: resData.specialRequests || null,
          status: 'Pending',
        });
      } catch (err) {
        console.warn('Failed to insert reservation into Supabase:', err);
      }
    }

    return reservation;
  },

  updateReservationStatus: async (
    id: string,
    status: ReservationStatus,
    tableAssigned?: string
  ): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    const payload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (tableAssigned) payload.table_assigned = tableAssigned;

    await supabase.from('reservations').update(payload).eq('id', id);
  },

  deleteReservation: async (id: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    await supabase.from('reservations').delete().eq('id', id);
  },
};

export function formatReservationRow(row: any): Reservation {
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    date: row.date,
    timeSlot: row.time_slot,
    guests: row.guests,
    seatingPreference: row.seating_preference,
    specialRequests: row.special_requests || undefined,
    status: row.status,
    tableAssigned: row.table_assigned || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
