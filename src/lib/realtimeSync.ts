/**
 * Realtime Synchronization Engine
 * Bridges Supabase Realtime (WebSocket Broadcast + Postgres Changes)
 * and Browser BroadcastChannel (Instant Cross-Tab Zero-Latency Sync)
 */

import { supabase, isSupabaseConfigured } from './supabase';

export type RealtimeSyncEventType =
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'ORDER_ARCHIVED'
  | 'ORDER_DELETED'
  | 'RESERVATION_CREATED'
  | 'RESERVATION_UPDATED'
  | 'RESERVATION_DELETED'
  | 'REVIEW_CREATED'
  | 'REVIEW_UPDATED'
  | 'REVIEW_DELETED'
  | 'NOTIFICATION_CREATED'
  | 'NOTIFICATIONS_READ'
  | 'FORCE_SYNC';

export interface RealtimeSyncMessage {
  id: string;
  type: RealtimeSyncEventType;
  payload: any;
  senderId: string;
  timestamp: string;
}

type SyncHandler = (message: RealtimeSyncMessage) => void;

// Unique client identifier per page session to avoid self-echoing
export const CLIENT_SESSION_ID = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const CHANNEL_NAME = 'dem_restaurant_realtime_hub';
const BROADCAST_BUS_NAME = 'dem_restaurant_broadcast_bus';

let browserChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    browserChannel = new BroadcastChannel(BROADCAST_BUS_NAME);
  } catch (err) {
    console.warn('BroadcastChannel not supported in current environment:', err);
  }
}

const listeners = new Set<SyncHandler>();

// Attach browser channel listener
if (browserChannel) {
  browserChannel.onmessage = (event) => {
    const data = event.data as RealtimeSyncMessage;
    if (data && data.senderId !== CLIENT_SESSION_ID) {
      listeners.forEach((handler) => {
        try {
          handler(data);
        } catch (e) {
          console.error('Error in BroadcastChannel listener handler:', e);
        }
      });
    }
  };
}

// Attach window storage event fallback for cross-tab sync in restricted environments
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'dem_restaurant_sync_event' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue) as RealtimeSyncMessage;
        if (data && data.senderId !== CLIENT_SESSION_ID) {
          listeners.forEach((handler) => {
            try {
              handler(data);
            } catch (err) {
              console.error('Error in storage sync handler:', err);
            }
          });
        }
      } catch {
        // Ignore json parse error
      }
    }
  });
}

// Active Supabase Realtime channel instance
let supabaseRealtimeChannel: ReturnType<typeof supabase.channel> | null = null;

/**
 * Initialize or get Supabase Realtime channel with WebSocket broadcast subscription
 */
export function getSupabaseRealtimeChannel() {
  if (supabaseRealtimeChannel) return supabaseRealtimeChannel;

  if (!isSupabaseConfigured()) return null;

  try {
    const channel = supabase.channel(CHANNEL_NAME, {
      config: {
        broadcast: {
          self: false, // Don't echo to self
        },
      },
    });

    // Listen to WebSocket broadcasts from other clients/devices
    channel.on('broadcast', { event: 'REALTIME_BUS' }, ({ payload }) => {
      const message = payload as RealtimeSyncMessage;
      if (message && message.senderId !== CLIENT_SESSION_ID) {
        listeners.forEach((handler) => {
          try {
            handler(message);
          } catch (e) {
            console.error('Error executing realtime broadcast handler:', e);
          }
        });
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Connected to Supabase Realtime cluster
      }
    });

    supabaseRealtimeChannel = channel;
    return supabaseRealtimeChannel;
  } catch (err) {
    console.warn('Failed to initialize Supabase Realtime channel:', err);
    return null;
  }
}

/**
 * Register a listener to real-time events across all tabs, windows, and remote devices
 */
export function subscribeToRealtimeSync(handler: SyncHandler): () => void {
  listeners.add(handler);
  // Ensure Supabase channel is wired up
  getSupabaseRealtimeChannel();

  return () => {
    listeners.delete(handler);
  };
}

/**
 * Broadcast an event to all other clients, browser tabs, and remote devices
 */
export function broadcastRealtimeEvent(type: RealtimeSyncEventType, payload: any) {
  const message: RealtimeSyncMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    payload,
    senderId: CLIENT_SESSION_ID,
    timestamp: new Date().toISOString(),
  };

  // 1. Send via Browser BroadcastChannel (Instant 0ms multi-tab sync)
  if (browserChannel) {
    try {
      browserChannel.postMessage(message);
    } catch (err) {
      console.warn('BroadcastChannel postMessage error:', err);
    }
  }

  // 2. Storage event fallback for older or restricted webview tabs
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('dem_restaurant_sync_event', JSON.stringify(message));
    } catch {
      // LocalStorage might be full or private browsing
    }
  }

  // 3. Send via Supabase Realtime WebSocket broadcast (Multi-device, phone, remote clients)
  const channel = getSupabaseRealtimeChannel();
  if (channel) {
    try {
      channel.send({
        type: 'broadcast',
        event: 'REALTIME_BUS',
        payload: message,
      });
    } catch (err) {
      console.warn('Supabase Realtime broadcast send error:', err);
    }
  }
}
