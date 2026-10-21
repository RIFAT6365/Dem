/**
 * Supabase Order Service
 * Manages orders, items snapshots, delivery tracking, and order_status_history
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, OrderStatus } from '../types';

export const orderService = {
  fetchOrders: async (): Promise<Order[] | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching orders from Supabase:', error.message);
        return null;
      }

      return (data || []).map(formatOrderFromRow);
    } catch (err) {
      console.warn('Supabase order query exception:', err);
      return null;
    }
  },

  fetchCustomerOrders: async (userId: string): Promise<Order[]> => {
    if (!isSupabaseConfigured() || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching customer orders:', error.message);
        return [];
      }

      return (data || []).map(formatOrderFromRow);
    } catch {
      return [];
    }
  },

  getOrderById: async (orderId: string): Promise<Order | null> => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${orderId},order_number.eq.${orderId}`)
      .maybeSingle();

    if (error || !data) return null;
    return formatOrderFromRow(data);
  },

  createOrder: async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>,
    userId?: string
  ): Promise<Order> => {
    const timestamp = Date.now();
    const orderNumber = `DEM-${Math.floor(100000 + Math.random() * 900000)}`;
    const newId = `ord-${timestamp}`;
    const now = new Date().toISOString();

    const createdOrder: Order = {
      ...orderData,
      id: newId,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('orders').insert({
          id: newId,
          order_number: orderNumber,
          user_id: userId || null,
          customer: orderData.customer,
          items: orderData.items,
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          delivery_fee: orderData.deliveryFee,
          discount: orderData.discount,
          total: orderData.total,
          coupon_code: orderData.couponCode || null,
          fulfillment_type: orderData.fulfillmentType,
          table_number: orderData.tableNumber || null,
          payment_method: orderData.paymentMethod,
          payment_status: orderData.paymentStatus,
          order_status: orderData.orderStatus,
          estimated_delivery_minutes: orderData.estimatedDeliveryMinutes || 35,
          rider_name: orderData.riderName || null,
          rider_phone: orderData.riderPhone || null,
        });

        if (error) {
          console.warn('Failed to insert order into Supabase:', error.message);
        } else {
          // Record initial status history
          await supabase.from('order_status_history').insert({
            order_id: newId,
            status: orderData.orderStatus,
            notes: `Order placed via ${orderData.paymentMethod}`,
            changed_by: userId || null,
          });
        }
      } catch (err) {
        console.warn('Supabase order creation exception:', err);
      }
    }

    return createdOrder;
  },

  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus,
    riderInfo?: { riderName?: string; riderPhone?: string }
  ): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    const payload: Record<string, any> = {
      order_status: status,
      updated_at: new Date().toISOString(),
    };
    if (riderInfo?.riderName) payload.rider_name = riderInfo.riderName;
    if (riderInfo?.riderPhone) payload.rider_phone = riderInfo.riderPhone;

    const { error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', orderId);

    if (!error) {
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        status,
        notes: riderInfo?.riderName ? `Assigned to rider ${riderInfo.riderName}` : `Status updated to ${status}`,
      });
    }
  },

  deleteOrder: async (orderId: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    await supabase.from('orders').delete().eq('id', orderId);
  },
};

export function formatOrderFromRow(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: row.customer,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    deliveryFee: Number(row.delivery_fee),
    discount: Number(row.discount),
    total: Number(row.total),
    couponCode: row.coupon_code || undefined,
    fulfillmentType: row.fulfillment_type || 'Delivery',
    tableNumber: row.table_number || undefined,
    paymentMethod: row.payment_method || 'Cash on Delivery',
    paymentStatus: row.payment_status || 'Pending',
    orderStatus: row.order_status || 'Pending',
    estimatedDeliveryMinutes: row.estimated_delivery_minutes || 35,
    riderName: row.rider_name || undefined,
    riderPhone: row.rider_phone || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
