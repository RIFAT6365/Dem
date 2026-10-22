/**
 * Supabase Order Service
 * Manages orders, items snapshots, delivery tracking, and order_status_history
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, OrderStatus } from '../types';
import { notificationService } from './notificationService';

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

  /**
   * Create order in Supabase. Strictly requires authenticated user ID.
   * Throws an error on failure — never creates fake success.
   */
  createOrder: async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<Order> => {
    if (!userId) {
      throw new Error('Authentication required: You must have an account and be signed in to place an order.');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase database is not configured.');
    }

    const timestamp = Date.now();
    const orderNumber = `DEM-${Math.floor(100000 + Math.random() * 900000)}`;
    const newId = `ord-${timestamp}`;
    const now = new Date().toISOString();

    const insertPayload = {
      id: newId,
      order_number: orderNumber,
      user_id: userId,
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
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Failed to create order in Supabase:', error.message);
      throw new Error(`Order placement failed: ${error.message}`);
    }

    const createdOrder = formatOrderFromRow(data);

    // Record initial status history
    try {
      await supabase.from('order_status_history').insert({
        order_id: newId,
        status: orderData.orderStatus,
        notes: `Order created via ${orderData.paymentMethod}`,
        changed_by: userId,
      });
    } catch (historyErr) {
      console.warn('Could not record order history:', historyErr);
    }

    // Trigger in-app notification to customer
    try {
      await notificationService.createNotification({
        userId,
        title: 'Order Confirmed!',
        message: `Your order #${orderNumber} for ${orderData.total} has been received and is being prepared.`,
        type: 'order',
        link: `/account/orders/${newId}`,
        relatedEntityId: newId,
      });
    } catch (notifErr) {
      console.warn('Could not dispatch order notification:', notifErr);
    }

    return createdOrder;
  },

  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus,
    riderInfo?: { riderName?: string; riderPhone?: string }
  ): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    // Get current order to find user_id for notification
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('user_id, order_number')
      .eq('id', orderId)
      .maybeSingle();

    const payload: Record<string, any> = {
      order_status: status,
      updated_at: new Date().toISOString(),
    };
    if (riderInfo?.riderName !== undefined) payload.rider_name = riderInfo.riderName;
    if (riderInfo?.riderPhone !== undefined) payload.rider_phone = riderInfo.riderPhone;

    const { error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', orderId);

    if (error) {
      console.error('Failed to update order status in Supabase:', error.message);
      throw new Error(error.message);
    }

    // Record status progression audit
    try {
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        status,
        notes: riderInfo?.riderName
          ? `Assigned to rider ${riderInfo.riderName}`
          : `Status advanced to ${status}`,
      });
    } catch (auditErr) {
      console.warn('Status history insert failed:', auditErr);
    }

    // Dispatch notification to customer
    if (currentOrder?.user_id) {
      try {
        let msg = `Order #${currentOrder.order_number} is now ${status}.`;
        if (status === 'Ready') {
          msg = `Order #${currentOrder.order_number} is packed and ready for delivery/pickup!`;
        } else if (status === 'Out for Delivery') {
          msg = `Order #${currentOrder.order_number} is out for delivery with our rider!`;
        } else if (status === 'Completed') {
          msg = `Order #${currentOrder.order_number} has been delivered. Enjoy your meal! Please leave a review.`;
        } else if (status === 'Canceled') {
          msg = `Order #${currentOrder.order_number} was canceled.`;
        }

        await notificationService.createNotification({
          userId: currentOrder.user_id,
          title: `Order Status: ${status}`,
          message: msg,
          type: 'order',
          link: `/account/orders/${orderId}`,
          relatedEntityId: orderId,
        });
      } catch (e) {
        console.warn('Notification dispatch error:', e);
      }
    }
  },

  archiveOrder: async (orderId: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase
      .from('orders')
      .update({ is_archived: true, archived_at: new Date().toISOString() })
      .eq('id', orderId);
    if (error) {
      console.error('Failed to archive order in Supabase:', error.message);
      throw new Error(error.message);
    }
  },

  unarchiveOrder: async (orderId: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase
      .from('orders')
      .update({ is_archived: false, archived_at: null })
      .eq('id', orderId);
    if (error) {
      console.error('Failed to unarchive order in Supabase:', error.message);
      throw new Error(error.message);
    }
  },

  deleteOrder: async (orderId: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      console.error('Failed to delete order:', error.message);
      throw new Error(error.message);
    }
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
    userId: row.user_id || undefined,
    isArchived: Boolean(row.is_archived),
    archivedAt: row.archived_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
