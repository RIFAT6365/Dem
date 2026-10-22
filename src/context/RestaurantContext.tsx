import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  Category,
  Order,
  CartItem,
  Reservation,
  Review,
  Coupon,
  GalleryItem,
  WebsiteSettings,
  NavigationLink,
  ActivityLog,
  NotificationItem,
  OrderStatus,
  ReservationStatus,
  Customer,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_RESERVATIONS,
  INITIAL_REVIEWS,
  INITIAL_COUPONS,
  INITIAL_GALLERY,
  INITIAL_SETTINGS,
  INITIAL_NAV_LINKS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/initialData';
import { isSupabaseConfigured, testSupabaseConnection, ConnectionStatus, supabase } from '../lib/supabase';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { orderService, formatOrderFromRow } from '../services/orderService';
import { reservationService, formatReservationRow } from '../services/reservationService';
import { couponService } from '../services/couponService';
import { reviewService, formatReviewRow } from '../services/reviewService';
import { galleryService } from '../services/galleryService';
import { contentService } from '../services/contentService';
import { activityService } from '../services/activityService';
import { notificationService } from '../services/notificationService';
import { authService, UserProfile } from '../services/authService';
import { useAuth } from './AuthContext';
import { broadcastRealtimeEvent, subscribeToRealtimeSync } from '../lib/realtimeSync';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface RestaurantContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  reservations: Reservation[];
  reviews: Review[];
  coupons: Coupon[];
  gallery: GalleryItem[];
  settings: WebsiteSettings;
  navLinks: NavigationLink[];
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
  customers: Customer[];
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  toasts: ToastInfo[];
  supabaseStatus: ConnectionStatus | null;
  isBackendConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  refreshFromSupabase: () => Promise<void>;
  registeredProfiles: UserProfile[];
  playNotificationSound: () => void;
  pushNotification: (
    title: string,
    message: string,
    type: 'order' | 'reservation' | 'promo' | 'system' | 'review',
    link?: string,
    relatedEntityId?: string,
    targetUserId?: string
  ) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Cart actions
  addToCart: (product: Product, quantity?: number, selectedOptions?: { addonId: string; name: string; price: number }[], specialInstructions?: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  setCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCouponCode: () => void;

  // Order actions
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, riderInfo?: { riderName?: string; riderPhone?: string }) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  archiveOrder: (orderId: string) => Promise<void>;
  unarchiveOrder: (orderId: string) => Promise<void>;
  deleteOrder: (orderId: string) => void;

  // Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product | null;

  // Category CRUD
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => { success: boolean; message?: string };

  // Reservation CRUD
  createReservation: (resData: Omit<Reservation, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status'>) => Reservation;
  updateReservationStatus: (id: string, status: ReservationStatus, tableAssigned?: string) => void;
  deleteReservation: (id: string) => void;

  // Review CRUD
  addReview: (review: Omit<Review, 'id' | 'date' | 'isApproved'> & { title?: string; orderId?: string }) => Promise<Review>;
  respondToReview: (id: string, response: string) => Promise<void>;
  toggleReviewApproval: (id: string) => Promise<void>;
  deleteReview: (id: string) => void;

  // Coupon CRUD
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => Coupon;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;

  // Gallery CRUD
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  deleteGalleryItem: (id: string) => void;

  // Settings & CMS
  updateSettings: (newSettings: Partial<WebsiteSettings>) => void;
  updateNavLinks: (newLinks: NavigationLink[]) => void;

  // Activity & Notifications
  addActivityLog: (action: string, details: string, category: ActivityLog['category']) => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // System
  resetDemoData: () => void;
  restoreRestaurantBackup: (backupData: any) => { success: boolean; message: string };
  checkBackendConnection: () => Promise<ConnectionStatus>;
  cartTotals: {
    itemCount: number;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    total: number;
  };
}

const STORAGE_KEYS = {
  PRODUCTS: 'demo_restaurant_products_v2',
  CATEGORIES: 'demo_restaurant_categories_v2',
  ORDERS: 'demo_restaurant_orders_v2',
  RESERVATIONS: 'demo_restaurant_reservations_v2',
  REVIEWS: 'demo_restaurant_reviews_v2',
  COUPONS: 'demo_restaurant_coupons_v2',
  GALLERY: 'demo_restaurant_gallery_v2',
  SETTINGS: 'demo_restaurant_settings_v2',
  NAV_LINKS: 'demo_restaurant_nav_v2',
  ACTIVITY: 'demo_restaurant_activity_v2',
  CART: 'demo_restaurant_cart_v2',
  NOTIFICATIONS: 'demo_restaurant_notifications_v2',
};

const RestaurantContext = createContext<RestaurantContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error loading ${key} from localStorage:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, role, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage(STORAGE_KEYS.ORDERS, []));
  const [reservations, setReservations] = useState<Reservation[]>(() => loadFromStorage(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS));
  const [reviews, setReviews] = useState<Review[]>(() => loadFromStorage(STORAGE_KEYS.REVIEWS, []));
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadFromStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => loadFromStorage(STORAGE_KEYS.GALLERY, INITIAL_GALLERY));
  const [settings, setSettings] = useState<WebsiteSettings>(() => loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS));
  const [navLinks, setNavLinks] = useState<NavigationLink[]>(() => loadFromStorage(STORAGE_KEYS.NAV_LINKS, INITIAL_NAV_LINKS));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadFromStorage(STORAGE_KEYS.ACTIVITY, INITIAL_ACTIVITY_LOGS));
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage(STORAGE_KEYS.CART, []));
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<ConnectionStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [registeredProfiles, setRegisteredProfiles] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []));

  // Sync state to LocalStorage
  useEffect(() => saveToStorage(STORAGE_KEYS.PRODUCTS, products), [products]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CATEGORIES, categories), [categories]);
  useEffect(() => saveToStorage(STORAGE_KEYS.ORDERS, orders), [orders]);
  useEffect(() => saveToStorage(STORAGE_KEYS.RESERVATIONS, reservations), [reservations]);
  useEffect(() => saveToStorage(STORAGE_KEYS.REVIEWS, reviews), [reviews]);
  useEffect(() => saveToStorage(STORAGE_KEYS.COUPONS, coupons), [coupons]);
  useEffect(() => saveToStorage(STORAGE_KEYS.GALLERY, gallery), [gallery]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SETTINGS, settings), [settings]);
  useEffect(() => saveToStorage(STORAGE_KEYS.NAV_LINKS, navLinks), [navLinks]);
  useEffect(() => saveToStorage(STORAGE_KEYS.ACTIVITY, activityLogs), [activityLogs]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CART, cart), [cart]);
  useEffect(() => saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications), [notifications]);

  // Gentle synthesized audio chime for live order/reservation alerts
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio autoplay policy might restrict if no prior user gesture
    }
  };

  // Comprehensive Supabase Backend Sync
  const refreshFromSupabase = async () => {
    if (!isSupabaseConfigured()) return;
    setIsSyncing(true);

    try {
      const status = await testSupabaseConnection();
      setSupabaseStatus(status);

      if (!status.ok) {
        setIsSyncing(false);
        return;
      }

      const [
        prods,
        cats,
        ords,
        resvs,
        revs,
        cpns,
        gall,
        sttngs,
        navs,
        acts,
        profs,
        notifs,
      ] = await Promise.allSettled([
        productService.fetchProducts(),
        categoryService.fetchCategories(),
        isAdmin
          ? orderService.fetchOrders()
          : user?.id
          ? orderService.fetchCustomerOrders(user.id)
          : Promise.resolve([]),
        reservationService.fetchReservations(),
        reviewService.fetchReviews(isAdmin),
        couponService.fetchCoupons(),
        galleryService.fetchGallery(),
        contentService.fetchSettings(),
        contentService.fetchNavigation(),
        activityService.fetchActivityLogs(),
        isAdmin ? authService.getAllProfiles() : Promise.resolve([]),
        notificationService.fetchUserNotifications(user?.id, isAdmin),
      ]);

      if (prods.status === 'fulfilled' && prods.value !== null) {
        setProducts(prods.value);
      }
      if (cats.status === 'fulfilled' && cats.value !== null) {
        setCategories(cats.value);
      }
      if (ords.status === 'fulfilled' && ords.value !== null) {
        setOrders(ords.value);
      }
      if (resvs.status === 'fulfilled' && resvs.value !== null) {
        setReservations(resvs.value);
      }
      if (revs.status === 'fulfilled' && revs.value !== null) {
        setReviews(revs.value);
      }
      if (cpns.status === 'fulfilled' && cpns.value !== null) {
        setCoupons(cpns.value);
      }
      if (gall.status === 'fulfilled' && gall.value !== null) {
        setGallery(gall.value);
      }
      if (sttngs.status === 'fulfilled' && sttngs.value) {
        setSettings(sttngs.value);
      }
      if (navs.status === 'fulfilled' && navs.value !== null) {
        setNavLinks(navs.value);
      }
      if (acts.status === 'fulfilled' && acts.value !== null) {
        setActivityLogs(acts.value);
      }
      if (profs.status === 'fulfilled' && profs.value !== null) {
        setRegisteredProfiles(profs.value);
      }
      if (notifs.status === 'fulfilled' && notifs.value !== null) {
        setNotifications(notifs.value);
      }

      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Error during Supabase sync:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Re-sync when auth state or admin role activates
  useEffect(() => {
    refreshFromSupabase();
  }, [user?.id, role, isAdmin]);

  // Real-time synchronization across tabs, browsers, and remote devices
  useEffect(() => {
    // 1. Subscribe to Realtime Bus (Browser BroadcastChannel + Supabase WebSocket broadcast)
    const unsubscribeBus = subscribeToRealtimeSync((msg) => {
      switch (msg.type) {
        case 'ORDER_CREATED': {
          const newOrder = msg.payload as Order;
          setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
          if (isAdmin) {
            playNotificationSound();
            showToast(`New Live Order #${newOrder.orderNumber} received!`, 'success');
          } else if (user?.id && newOrder.userId === user.id) {
            showToast(`Order #${newOrder.orderNumber} updated!`, 'info');
          }
          break;
        }

        case 'ORDER_UPDATED': {
          const { orderId, status, riderInfo, updatedAt } = msg.payload;
          setOrders((prev) =>
            prev.map((o) => {
              if (o.id === orderId || o.orderNumber === orderId) {
                return {
                  ...o,
                  orderStatus: status,
                  riderName: riderInfo?.riderName !== undefined ? riderInfo.riderName : o.riderName,
                  riderPhone: riderInfo?.riderPhone !== undefined ? riderInfo.riderPhone : o.riderPhone,
                  updatedAt: updatedAt || new Date().toISOString(),
                };
              }
              return o;
            })
          );
          break;
        }

        case 'ORDER_ARCHIVED': {
          const { orderId, isArchived } = msg.payload;
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, isArchived } : o))
          );
          break;
        }

        case 'ORDER_DELETED': {
          const { orderId } = msg.payload;
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
          break;
        }

        case 'RESERVATION_CREATED': {
          const newRes = msg.payload as Reservation;
          setReservations((prev) => [newRes, ...prev.filter((r) => r.id !== newRes.id)]);
          if (isAdmin) {
            playNotificationSound();
            showToast(`New Table Reservation #${newRes.referenceNumber}!`, 'info');
          }
          break;
        }

        case 'RESERVATION_UPDATED': {
          const { id, status, tableAssigned, updatedAt } = msg.payload;
          setReservations((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status,
                    tableAssigned: tableAssigned !== undefined ? tableAssigned : r.tableAssigned,
                    updatedAt: updatedAt || new Date().toISOString(),
                  }
                : r
            )
          );
          break;
        }

        case 'RESERVATION_DELETED': {
          const { id } = msg.payload;
          setReservations((prev) => prev.filter((r) => r.id !== id));
          break;
        }

        case 'REVIEW_CREATED': {
          const newRev = msg.payload as Review;
          setReviews((prev) => [newRev, ...prev.filter((r) => r.id !== newRev.id)]);
          if (isAdmin) {
            showToast(`New customer review posted: ${newRev.rating}★`, 'info');
          }
          break;
        }

        case 'REVIEW_UPDATED': {
          const updates = msg.payload;
          setReviews((prev) =>
            prev.map((r) => (r.id === updates.id ? { ...r, ...updates } : r))
          );
          break;
        }

        case 'REVIEW_DELETED': {
          const { id } = msg.payload;
          setReviews((prev) => prev.filter((r) => r.id !== id));
          break;
        }

        case 'NOTIFICATION_CREATED': {
          const notif = msg.payload as NotificationItem;
          if (isAdmin || !notif.userId || notif.userId === user?.id) {
            setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
            playNotificationSound();
          }
          break;
        }

        case 'NOTIFICATIONS_READ': {
          const { id, all, userId: targetUid } = msg.payload;
          if (all) {
            if (isAdmin || !targetUid || targetUid === user?.id) {
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            }
          } else if (id) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
          }
          break;
        }

        case 'FORCE_SYNC': {
          refreshFromSupabase();
          break;
        }
      }
    });

    // 2. Direct Supabase Postgres Replication Channel
    let pgChannel: ReturnType<typeof supabase.channel> | null = null;
    if (isSupabaseConfigured()) {
      try {
        pgChannel = supabase
          .channel('dem_restaurant_postgres_replication')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newOrder = formatOrderFromRow(payload.new);
                setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
                if (isAdmin) {
                  playNotificationSound();
                  showToast(`New Live Order #${newOrder.orderNumber} received!`, 'success');
                }
              } else if (payload.eventType === 'UPDATE') {
                const updated = formatOrderFromRow(payload.new);
                setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
              } else if (payload.eventType === 'DELETE') {
                setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'reservations' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newRes = formatReservationRow(payload.new);
                setReservations((prev) => [newRes, ...prev.filter((r) => r.id !== newRes.id)]);
                if (isAdmin) {
                  playNotificationSound();
                  showToast(`New Table Reservation #${newRes.referenceNumber}!`, 'info');
                }
              } else if (payload.eventType === 'UPDATE') {
                const updated = formatReservationRow(payload.new);
                setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'reviews' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newRev = formatReviewRow(payload.new);
                setReviews((prev) => [newRev, ...prev.filter((r) => r.id !== newRev.id)]);
              } else if (payload.eventType === 'UPDATE') {
                const updated = formatReviewRow(payload.new);
                setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
              } else if (payload.eventType === 'DELETE') {
                setReviews((prev) => prev.filter((r) => r.id !== payload.old.id));
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products' },
            (payload) => {
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                productService.fetchProducts().then((data) => {
                  if (data) setProducts(data);
                });
              } else if (payload.eventType === 'DELETE') {
                setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Postgres replication channel setup notice:', err);
      }
    }

    // 3. Tab Visibility & Focus immediate freshness trigger
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshFromSupabase();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // 4. Background freshness poller (silent sync every 5 seconds)
    const backgroundPoller = setInterval(async () => {
      if (!isSupabaseConfigured()) return;
      try {
        const fetchedOrders = isAdmin
          ? await orderService.fetchOrders()
          : user?.id
          ? await orderService.fetchCustomerOrders(user.id)
          : null;

        if (fetchedOrders && fetchedOrders.length > 0) {
          setOrders((prev) => {
            const prevIds = new Set(prev.map((o) => o.id));
            const brandNewOrders = fetchedOrders.filter((o) => !prevIds.has(o.id));

            if (brandNewOrders.length > 0 && isAdmin) {
              playNotificationSound();
              showToast(`New Live Order #${brandNewOrders[0].orderNumber} received!`, 'success');
            }

            // Detect if status or rider assignment changed remotely
            let hasChanged = brandNewOrders.length > 0;
            if (!hasChanged) {
              const currentMap = new Map(prev.map((o) => [o.id, o]));
              for (const f of fetchedOrders) {
                const match = currentMap.get(f.id);
                if (
                  !match ||
                  match.orderStatus !== f.orderStatus ||
                  match.paymentStatus !== f.paymentStatus ||
                  match.riderName !== f.riderName ||
                  match.isArchived !== f.isArchived
                ) {
                  hasChanged = true;
                  break;
                }
              }
            }

            return hasChanged ? fetchedOrders : prev;
          });
        }

        // Silent reservation sync for admin
        if (isAdmin) {
          const fetchedRes = await reservationService.fetchReservations();
          if (fetchedRes) {
            setReservations((prev) => {
              const prevIds = new Set(prev.map((r) => r.id));
              const brandNew = fetchedRes.filter((r) => !prevIds.has(r.id));
              if (brandNew.length > 0) {
                playNotificationSound();
                showToast(`New Table Reservation #${brandNew[0].referenceNumber}!`, 'info');
                return fetchedRes;
              }
              const hasChange = fetchedRes.some((f) => {
                const existing = prev.find((r) => r.id === f.id);
                return existing && (existing.status !== f.status || existing.tableAssigned !== f.tableAssigned);
              });
              return hasChange ? fetchedRes : prev;
            });
          }
        }
      } catch {
        // Quietly absorb background poll errors
      }
    }, 5000);

    return () => {
      unsubscribeBus();
      if (pgChannel) {
        supabase.removeChannel(pgChannel);
      }
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      clearInterval(backgroundPoller);
    };
  }, [user?.id, isAdmin]);

  const checkBackendConnection = async (): Promise<ConnectionStatus> => {
    const status = await testSupabaseConnection();
    setSupabaseStatus(status);
    return status;
  };

  // Toast manager
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Enhanced Notification helper
  const pushNotification = (
    title: string,
    message: string,
    type: 'order' | 'reservation' | 'promo' | 'system' | 'review',
    link?: string,
    relatedEntityId?: string,
    targetUserId?: string
  ) => {
    const fallbackId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newNotif: NotificationItem = {
      id: fallbackId,
      userId: targetUserId || user?.id,
      title,
      message,
      type: type as any,
      link,
      relatedEntityId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Broadcast in real-time to other tabs and connected admin devices
    broadcastRealtimeEvent('NOTIFICATION_CREATED', newNotif);

    // Persist to Supabase if configured
    notificationService
      .createNotification({
        userId: targetUserId || user?.id,
        title,
        message,
        type: type as any,
        link,
        relatedEntityId,
      })
      .then((created) => {
        if (created && created.id !== fallbackId) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === fallbackId ? created : n))
          );
        }
      })
      .catch(() => {});
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    broadcastRealtimeEvent('NOTIFICATIONS_READ', { id, all: false });
    await notificationService.markAsRead(id);
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    broadcastRealtimeEvent('NOTIFICATIONS_READ', { all: true, userId: user?.id });
    await notificationService.markAllAsRead(user?.id);
    showToast('All notifications marked as read', 'info');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('All notifications cleared', 'info');
  };

  // Activity Log
  const addActivityLog = (
    action: string,
    details: string,
    category: ActivityLog['category']
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      action,
      details,
      category,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    activityService.logAction(action, details, category, user?.id);
  };

  // Cart actions
  const addToCart = (
    product: Product,
    quantity = 1,
    selectedOptions: { addonId: string; name: string; price: number }[] = [],
    specialInstructions = ''
  ) => {
    const optionsPrice = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
    const unitPrice = (product.salePrice ?? product.price) + optionsPrice;

    const optionsKey = selectedOptions
      .map((o) => `${o.addonId}:${o.price}`)
      .sort()
      .join('|');
    const cartItemId = `${product.id}_${optionsKey}_${specialInstructions.trim()}`;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === cartItemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          productName: product.name,
          productImage: product.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
          basePrice: product.salePrice ?? product.price,
          price: unitPrice,
          quantity,
          selectedOptions,
          specialInstructions: specialInstructions.trim() || undefined,
        };
        return [...prevCart, newItem];
      }
    });

    showToast(`Added ${quantity}x "${product.name}" to cart!`);
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const setCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
      );
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupon handling
  const applyCouponCode = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!coupon) {
      return { success: false, message: 'Invalid or inactive coupon code.' };
    }

    const currentSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (currentSubtotal < coupon.minOrderValue) {
      return {
        success: false,
        message: `Minimum order of ${settings.currencySymbol} ${coupon.minOrderValue} required for this coupon.`,
      };
    }

    if (coupon.validTo && new Date(coupon.validTo) < new Date()) {
      return { success: false, message: 'This coupon has expired.' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, message: 'Coupon usage limit reached.' };
    }

    setAppliedCoupon(coupon);
    showToast(`Coupon "${coupon.code}" applied successfully!`);
    return { success: true, message: 'Coupon applied successfully!' };
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Cart calculations
  const cartTotals = useMemo(() => {
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    let discount = 0;
    if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
      if (appliedCoupon.discountType === 'percentage') {
        discount = (subtotal * appliedCoupon.discountValue) / 100;
        if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
          discount = appliedCoupon.maxDiscount;
        }
      } else {
        discount = appliedCoupon.discountValue;
      }
    }

    const deliveryFee = subtotal === 0 || subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const tax = Math.round((taxableSubtotal * (settings.taxRatePercent / 100)) * 100) / 100;
    const total = Math.max(0, taxableSubtotal + tax + deliveryFee);

    return {
      itemCount,
      subtotal,
      tax,
      deliveryFee,
      discount,
      total,
    };
  }, [cart, appliedCoupon, settings]);

  // Order management
  const createOrder = async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<Order> => {
    if (!user?.id) {
      showToast('Authentication required: You must have an account and be signed in to place an order.', 'error');
      throw new Error('Authentication required: Please sign in or register before ordering.');
    }

    try {
      const createdOrder = await orderService.createOrder(orderData, user.id);
      setOrders((prev) => [createdOrder, ...prev.filter((o) => o.id !== createdOrder.id)]);

      // Broadcast order in real time to all tabs and admin portals
      broadcastRealtimeEvent('ORDER_CREATED', createdOrder);

      // Update coupon usage if used
      if (createdOrder.couponCode) {
        setCoupons((prev) =>
          prev.map((c) =>
            c.code.toUpperCase() === createdOrder.couponCode?.toUpperCase()
              ? { ...c, usedCount: c.usedCount + 1 }
              : c
          )
        );
      }

      addActivityLog(
        'Order Placed',
        `Order #${createdOrder.orderNumber} placed by ${createdOrder.customer.fullName} (${settings.currencySymbol} ${createdOrder.total})`,
        'order'
      );

      // Customer notification
      pushNotification(
        'Order Placed Successfully',
        `Your order #${createdOrder.orderNumber} for ${settings.currencySymbol} ${createdOrder.total} is placed. We are preparing it for you!`,
        'order',
        `/account/orders/${createdOrder.id}`,
        createdOrder.id,
        user.id
      );

      // Administrator notification
      pushNotification(
        'New Customer Order',
        `New order #${createdOrder.orderNumber} received for ${settings.currencySymbol} ${createdOrder.total} from ${createdOrder.customer.fullName}.`,
        'order',
        `/admin/orders?select=${createdOrder.id}`,
        createdOrder.id
      );

      clearCart();
      showToast(`Order #${createdOrder.orderNumber} placed successfully!`, 'success');
      return createdOrder;
    } catch (err: any) {
      showToast(err?.message || 'Failed to place order in database', 'error');
      throw err;
    }
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    riderInfo?: { riderName?: string; riderPhone?: string }
  ) => {
    let orderNum = '';
    let targetUserId = '';
    const nowIso = new Date().toISOString();
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.orderNumber === orderId) {
          orderNum = order.orderNumber;
          targetUserId = order.userId || '';
          return {
            ...order,
            orderStatus: status,
            riderName: riderInfo?.riderName ?? order.riderName,
            riderPhone: riderInfo?.riderPhone ?? order.riderPhone,
            updatedAt: nowIso,
          };
        }
        return order;
      })
    );

    // Broadcast status change immediately to all tabs, customer tracking, and admin views
    broadcastRealtimeEvent('ORDER_UPDATED', {
      orderId,
      status,
      riderInfo,
      updatedAt: nowIso,
    });

    // Sync to Supabase
    orderService.updateOrderStatus(orderId, status, riderInfo);

    addActivityLog('Order Status Updated', `Order #${orderNum || orderId} changed to "${status}"`, 'order');

    let notifTitle = `Order Status: ${status}`;
    let notifMsg = `Your order #${orderNum || orderId} is now ${status}!`;
    let notifLink = `/track-order?id=${orderNum || orderId}`;

    if (status === 'Preparing') {
      notifTitle = 'Food Preparation Started';
      notifMsg = `The kitchen has started crafting your dishes for order #${orderNum || orderId}!`;
    } else if (status === 'Ready') {
      notifTitle = 'Order Ready';
      notifMsg = `Order #${orderNum || orderId} is freshly prepared and ready for pickup or dispatch.`;
    } else if (status === 'Out for Delivery') {
      notifTitle = 'Order Out for Delivery';
      notifMsg = `Rider ${riderInfo?.riderName ? riderInfo.riderName : ''} is on the way with your order #${orderNum || orderId}!`;
    } else if (status === 'Completed') {
      notifTitle = 'Order Completed — Review Your Meal';
      notifMsg = `Your order #${orderNum || orderId} was delivered! Please rate your dishes and share feedback.`;
      notifLink = `/account/orders/${orderId}`;
    } else if (status === 'Canceled') {
      notifTitle = 'Order Cancelled';
      notifMsg = `Order #${orderNum || orderId} has been cancelled.`;
      notifLink = `/account/orders/${orderId}`;
    }

    pushNotification(
      notifTitle,
      notifMsg,
      'order',
      notifLink,
      orderId,
      targetUserId || user?.id
    );

    showToast(`Order status updated to "${status}"!`);
  };

  const cancelOrder = (orderId: string, reason = 'Cancelled by administrator') => {
    updateOrderStatus(orderId, 'Canceled');
    showToast(`Order has been marked as Canceled.`, 'info');
  };

  const archiveOrder = async (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, isArchived: true, archivedAt: new Date().toISOString() }
          : o
      )
    );
    broadcastRealtimeEvent('ORDER_ARCHIVED', { orderId, isArchived: true });
    await orderService.archiveOrder(orderId);
    addActivityLog('Order Archived', `Order #${orderId} removed from active management list`, 'order');
    showToast('Order safely archived from active list');
  };

  const unarchiveOrder = async (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, isArchived: false, archivedAt: undefined }
          : o
      )
    );
    broadcastRealtimeEvent('ORDER_ARCHIVED', { orderId, isArchived: false });
    await orderService.unarchiveOrder(orderId);
    addActivityLog('Order Restored', `Order #${orderId} restored to active management list`, 'order');
    showToast('Order restored to active list');
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    broadcastRealtimeEvent('ORDER_DELETED', { orderId });
    orderService.deleteOrder(orderId);
    showToast('Order record removed.', 'info');
  };

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...prodData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    productService.createProduct(prodData);
    addActivityLog('Added Product', `Created new menu item: "${newProduct.name}"`, 'product');
    showToast(`Product "${newProduct.name}" created!`);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    productService.updateProduct(id, updates);
    addActivityLog('Updated Product', `Updated details for product ID #${id}`, 'product');
    showToast('Product updated successfully!');
  };

  const deleteProduct = (id: string) => {
    const item = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    productService.deleteProduct(id);
    addActivityLog('Deleted Product', `Deleted product: "${item?.name || id}"`, 'product');
    showToast('Product deleted', 'info');
  };

  const duplicateProduct = (id: string): Product | null => {
    const source = products.find((p) => p.id === id);
    if (!source) return null;

    const duplicateData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      ...source,
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy-${Date.now().toString().slice(-4)}`,
    };
    return addProduct(duplicateData);
  };

  // Category CRUD
  const addCategory = (catData: Omit<Category, 'id'>): Category => {
    const newId = `cat-${Date.now()}`;
    const newCategory: Category = { ...catData, id: newId };
    setCategories((prev) => [...prev, newCategory]);
    categoryService.createCategory(catData);
    addActivityLog('Created Category', `Added menu category "${newCategory.name}"`, 'product');
    showToast(`Category "${newCategory.name}" added!`);
    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    categoryService.updateCategory(id, updates);
    addActivityLog('Updated Category', `Updated category ID #${id}`, 'product');
    showToast('Category updated successfully!');
  };

  const deleteCategory = (id: string): { success: boolean; message?: string } => {
    const hasProducts = products.some((p) => p.categoryId === id);
    if (hasProducts) {
      return {
        success: false,
        message: 'Cannot delete category containing food products. Please reassign products first.',
      };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    categoryService.deleteCategory(id);
    addActivityLog('Deleted Category', `Removed category ID #${id}`, 'product');
    showToast('Category deleted', 'info');
    return { success: true };
  };

  // Reservation CRUD
  const createReservation = (
    resData: Omit<Reservation, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): Reservation => {
    const refNum = `RES-${Math.floor(10000 + Math.random() * 90000)}`;
    const newReservation: Reservation = {
      ...resData,
      id: `res-${Date.now()}`,
      referenceNumber: refNum,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setReservations((prev) => [newReservation, ...prev]);
    broadcastRealtimeEvent('RESERVATION_CREATED', newReservation);
    reservationService.createReservation(resData, user?.id);

    addActivityLog(
      'Reservation Received',
      `Booking #${refNum} for ${newReservation.guests} guests by ${newReservation.customerName}`,
      'reservation'
    );

    // Notify customer
    pushNotification(
      'Reservation Request Submitted',
      `Table booking #${refNum} for ${newReservation.guests} guests on ${newReservation.date} at ${newReservation.timeSlot} is pending confirmation.`,
      'reservation',
      `/account/reservations`,
      newReservation.id,
      user?.id
    );

    // Notify admin
    pushNotification(
      'New Table Reservation',
      `Booking request #${refNum} for ${newReservation.guests} guests by ${newReservation.customerName} on ${newReservation.date}.`,
      'reservation',
      `/admin/reservations?select=${newReservation.id}`,
      newReservation.id
    );

    showToast('Reservation requested successfully! Our team will confirm shortly.');
    return newReservation;
  };

  const updateReservationStatus = (
    id: string,
    status: ReservationStatus,
    tableAssigned?: string
  ) => {
    let targetRef = '';
    const nowIso = new Date().toISOString();
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          targetRef = r.referenceNumber;
          return {
            ...r,
            status,
            tableAssigned: tableAssigned ?? r.tableAssigned,
            updatedAt: nowIso,
          };
        }
        return r;
      })
    );

    broadcastRealtimeEvent('RESERVATION_UPDATED', {
      id,
      status,
      tableAssigned,
      updatedAt: nowIso,
    });

    reservationService.updateReservationStatus(id, status, tableAssigned);
    addActivityLog('Reservation Status Updated', `Booking #${targetRef || id} marked as "${status}"`, 'reservation');

    // Notify customer
    pushNotification(
      `Table Reservation ${status}`,
      `Your table reservation #${targetRef || id} is now ${status}.${tableAssigned ? ` Assigned Table: ${tableAssigned}.` : ''}`,
      'reservation',
      `/account/reservations`,
      id
    );

    showToast(`Reservation marked as ${status}`);
  };

  const deleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    broadcastRealtimeEvent('RESERVATION_DELETED', { id });
    reservationService.deleteReservation(id);
    showToast('Reservation deleted', 'info');
  };

  // Review CRUD
  const addReview = async (
    reviewData: Omit<Review, 'id' | 'date' | 'isApproved'> & { title?: string; orderId?: string }
  ): Promise<Review> => {
    if (!user?.id) {
      showToast('You must be signed in to submit a review.', 'error');
      throw new Error('You must be signed in to submit a review.');
    }

    try {
      const created = await reviewService.createReview(reviewData, user.id);
      setReviews((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      broadcastRealtimeEvent('REVIEW_CREATED', created);
      addActivityLog('New Customer Review', `${created.authorName} left a ${created.rating}★ rating`, 'review');

      // Notify administrator
      pushNotification(
        'New Customer Review',
        `${created.authorName} submitted a ${created.rating}★ review: "${created.comment.substring(0, 45)}..."`,
        'review',
        `/admin/reviews?select=${created.id}`,
        created.id
      );

      showToast('Thank you! Your verified dining review has been posted.');
      return created;
    } catch (err: any) {
      showToast(err?.message || 'Failed to submit review.', 'error');
      throw err;
    }
  };

  const respondToReview = async (id: string, responseText: string): Promise<void> => {
    try {
      await reviewService.respondToReview(id, responseText, user?.id);
      const targetRev = reviews.find((r) => r.id === id);
      const nowIso = new Date().toISOString();
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, adminResponse: responseText.trim(), adminRespondedAt: nowIso }
            : r
        )
      );

      broadcastRealtimeEvent('REVIEW_UPDATED', {
        id,
        adminResponse: responseText.trim(),
        adminRespondedAt: nowIso,
      });

      // Notify customer of manager reply
      pushNotification(
        'Restaurant Replied to Your Review',
        `The restaurant responded to your feedback: "${responseText.substring(0, 60)}"`,
        'review',
        `/reviews`,
        id,
        targetRev?.userId
      );

      showToast('Response successfully published to review!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to post reply.', 'error');
      throw err;
    }
  };

  const toggleReviewApproval = async (id: string): Promise<void> => {
    const rev = reviews.find((r) => r.id === id);
    if (!rev) return;
    try {
      await reviewService.toggleApproval(id, rev.isApproved);
      const nextApproved = !rev.isApproved;
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved: nextApproved } : r))
      );
      broadcastRealtimeEvent('REVIEW_UPDATED', { id, isApproved: nextApproved });
      showToast(`Review visibility updated to ${nextApproved ? 'Visible' : 'Hidden'}`);
    } catch (err: any) {
      showToast('Failed to update review visibility', 'error');
      throw err;
    }
  };

  const deleteReview = async (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    broadcastRealtimeEvent('REVIEW_DELETED', { id });
    try {
      await reviewService.deleteReview(id);
      showToast('Review deleted', 'info');
    } catch (err: any) {
      showToast('Failed to delete review', 'error');
    }
  };

  // Coupon CRUD
  const addCoupon = (couponData: Omit<Coupon, 'id' | 'usedCount'>): Coupon => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `c-${Date.now()}`,
      usedCount: 0,
      code: couponData.code.toUpperCase().trim(),
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    couponService.createCoupon(couponData);
    addActivityLog('Created Deal/Coupon', `Added promo code: ${newCoupon.code}`, 'coupon');
    showToast(`Coupon "${newCoupon.code}" created!`);
    return newCoupon;
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              ...updates,
              code: updates.code ? updates.code.toUpperCase().trim() : c.code,
            }
          : c
      )
    );
    couponService.updateCoupon(id, updates);
    showToast('Coupon updated');
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    couponService.deleteCoupon(id);
    showToast('Coupon removed', 'info');
  };

  // Gallery CRUD
  const addGalleryItem = (itemData: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = { ...itemData, id: `gal-${Date.now()}` };
    setGallery((prev) => [newItem, ...prev]);
    galleryService.addGalleryItem(itemData);
    showToast('Photo added to gallery!');
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((g) => g.id !== id));
    galleryService.deleteGalleryItem(id);
    showToast('Gallery image removed', 'info');
  };

  // Settings & CMS
  const updateSettings = (newSettings: Partial<WebsiteSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      contentService.updateSettings(merged);
      return merged;
    });
    addActivityLog('Settings Saved', 'Updated restaurant configuration parameters', 'settings');
    showToast('Restaurant settings saved!');
  };

  const updateNavLinks = (newLinks: NavigationLink[]) => {
    setNavLinks(newLinks);
    contentService.updateNavigation(newLinks);
    showToast('Navigation menu updated!');
  };

  // Customers aggregation: includes registered Supabase users + delivery order guests
  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();

    // 1. Registered user profiles in Supabase
    registeredProfiles.forEach((p, idx) => {
      const key = p.email.toLowerCase().trim() || p.phone?.trim() || p.id;
      map.set(key, {
        id: p.id || `profile-${idx}`,
        name: p.fullName || 'Registered Guest',
        email: p.email,
        phone: p.phone || '',
        city: 'Dhaka',
        area: 'Dhanmondi',
        address: '',
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: p.createdAt || new Date().toISOString(),
        joinedAt: p.createdAt || new Date().toISOString(),
      });
    });

    // 2. Orders from Supabase / store
    orders.forEach((o) => {
      const key = o.customer.email.toLowerCase().trim() || o.customer.phone.trim();
      const existing = map.get(key);
      const spent = o.orderStatus !== 'Canceled' ? o.total : 0;

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += spent;
        existing.lastOrderDate = o.createdAt;
        if (o.customer.fullName && (!existing.name || existing.name === 'Registered Guest')) {
          existing.name = o.customer.fullName;
        }
        if (o.customer.address) existing.address = o.customer.address;
        if (o.customer.city) existing.city = o.customer.city;
        if (o.customer.area) existing.area = o.customer.area;
      } else {
        map.set(key, {
          id: `cust-${map.size + 1}`,
          name: o.customer.fullName,
          email: o.customer.email,
          phone: o.customer.phone,
          city: o.customer.city,
          area: o.customer.area,
          address: o.customer.address,
          totalOrders: 1,
          totalSpent: spent,
          lastOrderDate: o.createdAt,
          joinedAt: o.createdAt,
        });
      }
    });

    return Array.from(map.values());
  }, [orders, registeredProfiles]);

  // System
  const resetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setOrders(INITIAL_ORDERS);
    setReservations(INITIAL_RESERVATIONS);
    setReviews(INITIAL_REVIEWS);
    setCoupons(INITIAL_COUPONS);
    setGallery(INITIAL_GALLERY);
    setSettings(INITIAL_SETTINGS);
    setNavLinks(INITIAL_NAV_LINKS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setCart([]);
    setAppliedCoupon(null);
    showToast('System reset to verified demo dataset!');
  };

  const restoreRestaurantBackup = (backupData: any): { success: boolean; message: string } => {
    try {
      if (!backupData || typeof backupData !== 'object') {
        return { success: false, message: 'Invalid backup file format.' };
      }
      if (Array.isArray(backupData.products)) setProducts(backupData.products);
      if (Array.isArray(backupData.categories)) setCategories(backupData.categories);
      if (Array.isArray(backupData.orders)) setOrders(backupData.orders);
      if (Array.isArray(backupData.reservations)) setReservations(backupData.reservations);
      if (Array.isArray(backupData.reviews)) setReviews(backupData.reviews);
      if (Array.isArray(backupData.coupons)) setCoupons(backupData.coupons);
      if (Array.isArray(backupData.gallery)) setGallery(backupData.gallery);
      if (backupData.settings) setSettings(backupData.settings);
      if (Array.isArray(backupData.navLinks)) setNavLinks(backupData.navLinks);

      showToast('Restaurant backup restored successfully!');
      return { success: true, message: 'Backup restored successfully!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Restore error' };
    }
  };

  return (
    <RestaurantContext.Provider
      value={{
        products,
        categories,
        orders,
        reservations,
        reviews,
        coupons,
        gallery,
        settings,
        navLinks,
        activityLogs,
        notifications,
        customers,
        cart,
        appliedCoupon,
        toasts,
        supabaseStatus,
        isBackendConnected: Boolean(supabaseStatus?.ok),
        isSyncing,
        lastSyncedAt,
        refreshFromSupabase,
        registeredProfiles,
        playNotificationSound,
        pushNotification,
        deleteNotification,
        clearAllNotifications,
        addToCart,
        updateCartQuantity,
        setCartQuantity,
        removeFromCart,
        clearCart,
        applyCouponCode,
        removeCouponCode,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        archiveOrder,
        unarchiveOrder,
        deleteOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        createReservation,
        updateReservationStatus,
        deleteReservation,
        addReview,
        respondToReview,
        toggleReviewApproval,
        deleteReview,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        addGalleryItem,
        deleteGalleryItem,
        updateSettings,
        updateNavLinks,
        addActivityLog,
        markNotificationRead,
        markAllNotificationsRead,
        showToast,
        removeToast,
        resetDemoData,
        restoreRestaurantBackup,
        checkBackendConnection,
        cartTotals,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
