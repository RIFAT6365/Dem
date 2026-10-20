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

  // Cart actions
  addToCart: (product: Product, quantity?: number, selectedOptions?: { addonId: string; name: string; price: number }[], specialInstructions?: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  setCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCouponCode: () => void;

  // Order actions
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, riderInfo?: { riderName?: string; riderPhone?: string }) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
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
  addReview: (review: Omit<Review, 'id' | 'date' | 'isApproved'>) => void;
  toggleReviewApproval: (id: string) => void;
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
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // System
  resetDemoData: () => void;
  restoreRestaurantBackup: (backupData: any) => { success: boolean; message: string };
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
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS));
  const [reservations, setReservations] = useState<Reservation[]>(() => loadFromStorage(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS));
  const [reviews, setReviews] = useState<Review[]>(() => loadFromStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS));
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadFromStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => loadFromStorage(STORAGE_KEYS.GALLERY, INITIAL_GALLERY));
  const [settings, setSettings] = useState<WebsiteSettings>(() => loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS));
  const [navLinks, setNavLinks] = useState<NavigationLink[]>(() => loadFromStorage(STORAGE_KEYS.NAV_LINKS, INITIAL_NAV_LINKS));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadFromStorage(STORAGE_KEYS.ACTIVITY, INITIAL_ACTIVITY_LOGS));
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage(STORAGE_KEYS.CART, []));
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, [
    {
      id: 'notif-1',
      title: 'Order Status Update',
      message: 'Order #ORD-1001 is now Ready for delivery/pickup!',
      type: 'order',
      link: '/track-order?id=ORD-1001',
      read: false,
      createdAt: '2026-10-19T08:50:00Z',
    },
    {
      id: 'notif-2',
      title: 'Special Feast Discount',
      message: 'Use code ROYALSPICE to enjoy 15% off orders over ৳ 600.',
      type: 'promo',
      link: '/offers',
      read: false,
      createdAt: '2026-10-19T08:00:00Z',
    },
  ]));

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

  // Activity Logger
  const addActivityLog = (action: string, details: string, category: ActivityLog['category']) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      action,
      details,
      category,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]); // keep recent 50
  };

  // Notification creator
  const pushNotification = (title: string, message: string, type: NotificationItem['type'], link?: string) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      link,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Cart operations
  const addToCart = (
    product: Product,
    quantity = 1,
    selectedOptions: { addonId: string; name: string; price: number }[] = [],
    specialInstructions = ''
  ) => {
    const effectiveBasePrice = product.salePrice ?? product.price;
    const optionsTotal = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
    const unitPrice = effectiveBasePrice + optionsTotal;

    const optionsKey = selectedOptions
      .map((o) => o.addonId)
      .sort()
      .join('-');
    const cartItemId = `${product.id}_${optionsKey}_${specialInstructions ? encodeURIComponent(specialInstructions) : 'none'}`;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === cartItemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
        price: unitPrice,
        basePrice: effectiveBasePrice,
        quantity,
        selectedOptions,
        specialInstructions,
      };
      return [...prevCart, newItem];
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
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order => {
    const count = orders.length + 1001;
    const orderNumber = `ORD-${count}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update coupon usage if used
    if (newOrder.couponCode) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.code.toUpperCase() === newOrder.couponCode?.toUpperCase()
            ? { ...c, usedCount: c.usedCount + 1 }
            : c
        )
      );
    }

    addActivityLog(
      'Order Placed',
      `Order #${orderNumber} placed by ${newOrder.customer.fullName} (${settings.currencySymbol} ${newOrder.total})`,
      'order'
    );

    pushNotification(
      'New Order Received',
      `Order #${orderNumber} has been placed for ${settings.currencySymbol} ${newOrder.total}.`,
      'order',
      `/track-order?id=${orderNumber}`
    );

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    riderInfo?: { riderName?: string; riderPhone?: string }
  ) => {
    let orderNum = '';
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.orderNumber === orderId) {
          orderNum = order.orderNumber;
          return {
            ...order,
            orderStatus: status,
            riderName: riderInfo?.riderName ?? order.riderName,
            riderPhone: riderInfo?.riderPhone ?? order.riderPhone,
            updatedAt: new Date().toISOString(),
          };
        }
        return order;
      })
    );

    addActivityLog('Order Status Updated', `Order #${orderNum || orderId} changed to "${status}"`, 'order');

    pushNotification(
      'Order Status Updated',
      `Your order #${orderNum || orderId} is now ${status}!`,
      'order',
      `/track-order?id=${orderNum || orderId}`
    );

    showToast(`Order status updated to "${status}"!`);
  };

  const cancelOrder = (orderId: string, reason = 'Cancelled by administrator') => {
    let orderNum = '';
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.orderNumber === orderId) {
          orderNum = order.orderNumber;
          return {
            ...order,
            orderStatus: 'Canceled',
            updatedAt: new Date().toISOString(),
          };
        }
        return order;
      })
    );
    addActivityLog('Order Canceled', `Order #${orderNum || orderId} was cancelled (${reason})`, 'order');
    showToast(`Order #${orderNum || orderId} cancelled`, 'info');
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    addActivityLog('Order Deleted', `Order ID ${orderId} was removed from records`, 'order');
    showToast('Order record deleted', 'info');
  };

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    addActivityLog('Product Created', `Added new menu item "${newProduct.name}"`, 'product');
    showToast(`Product "${newProduct.name}" created successfully!`);
    return newProduct;
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) =>
        prod.id === id ? { ...prod, ...updated, updatedAt: new Date().toISOString() } : prod
      )
    );
    addActivityLog('Product Updated', `Updated product ID: ${id}`, 'product');
    showToast('Product updated successfully!');
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addActivityLog('Product Deleted', `Deleted product "${target?.name || id}"`, 'product');
    showToast(`Product deleted`, 'info');
  };

  const duplicateProduct = (id: string): Product | null => {
    const target = products.find((p) => p.id === id);
    if (!target) return null;
    const duplicated: Product = {
      ...target,
      id: `prod-${Date.now()}`,
      name: `${target.name} (Copy)`,
      slug: `${target.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [duplicated, ...prev]);
    addActivityLog('Product Duplicated', `Duplicated "${target.name}" to "${duplicated.name}"`, 'product');
    showToast(`Product duplicated!`);
    return duplicated;
  };

  // Category CRUD
  const addCategory = (catData: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    addActivityLog('Category Created', `Created category "${newCat.name}"`, 'product');
    showToast(`Category "${newCat.name}" created!`);
    return newCat;
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    addActivityLog('Category Updated', `Updated category ID: ${id}`, 'product');
    showToast('Category updated!');
  };

  const deleteCategory = (id: string): { success: boolean; message?: string } => {
    const hasProducts = products.some((p) => p.categoryId === id);
    if (hasProducts) {
      showToast('Cannot delete category: products are assigned to it.', 'error');
      return { success: false, message: 'Products are still assigned to this category.' };
    }
    const target = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addActivityLog('Category Deleted', `Deleted category "${target?.name || id}"`, 'product');
    showToast('Category deleted', 'info');
    return { success: true };
  };

  // Reservation CRUD
  const createReservation = (
    resData: Omit<Reservation, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): Reservation => {
    const refNum = `RES-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRes: Reservation = {
      ...resData,
      id: `res-${Date.now()}`,
      referenceNumber: refNum,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setReservations((prev) => [newRes, ...prev]);
    addActivityLog('Reservation Booked', `Table booked by ${newRes.customerName} for ${newRes.guests} guests (${refNum})`, 'reservation');
    pushNotification('Reservation Confirmed', `Booking ${refNum} for ${newRes.date} at ${newRes.timeSlot} is confirmed.`, 'reservation', '/reservations');
    showToast(`Reservation #${refNum} confirmed!`);
    return newRes;
  };

  const updateReservationStatus = (id: string, status: ReservationStatus, tableAssigned?: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              tableAssigned: tableAssigned !== undefined ? tableAssigned : r.tableAssigned,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
    addActivityLog('Reservation Status Updated', `Reservation ${id} marked as ${status}`, 'reservation');
    showToast(`Reservation marked as ${status}`);
  };

  const deleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    addActivityLog('Reservation Deleted', `Deleted reservation ${id}`, 'reservation');
    showToast('Reservation deleted', 'info');
  };

  // Review CRUD
  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'isApproved'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: 'Just now',
      isApproved: true, // auto approve in demo
    };
    setReviews((prev) => [newRev, ...prev]);
    addActivityLog('Review Submitted', `New ${newRev.rating}-star review by ${newRev.authorName}`, 'review');
    showToast('Thank you for your review!');
  };

  const toggleReviewApproval = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isApproved: !r.isApproved } : r))
    );
    showToast('Review visibility updated');
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast('Review deleted', 'info');
  };

  // Coupon CRUD
  const addCoupon = (coupData: Omit<Coupon, 'id' | 'usedCount'>): Coupon => {
    const newCoupon: Coupon = {
      ...coupData,
      id: `coup-${Date.now()}`,
      usedCount: 0,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    addActivityLog('Coupon Created', `Created promo code ${newCoupon.code}`, 'coupon');
    showToast(`Coupon "${newCoupon.code}" created!`);
    return newCoupon;
  };

  const updateCoupon = (id: string, updated: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    addActivityLog('Coupon Updated', `Updated coupon ID: ${id}`, 'coupon');
    showToast('Coupon updated!');
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    addActivityLog('Coupon Deleted', `Deleted coupon ${id}`, 'coupon');
    showToast('Coupon deleted', 'info');
  };

  // Gallery CRUD
  const addGalleryItem = (itemData: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = {
      ...itemData,
      id: `gal-${Date.now()}`,
    };
    setGallery((prev) => [newItem, ...prev]);
    showToast('Gallery image added!');
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((g) => g.id !== id));
    showToast('Gallery image removed', 'info');
  };

  // Settings & CMS
  const updateSettings = (newSettings: Partial<WebsiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addActivityLog('Settings Updated', 'Restaurant configuration parameters updated', 'settings');
    showToast('Website settings saved successfully!');
  };

  const updateNavLinks = (newLinks: NavigationLink[]) => {
    setNavLinks(newLinks);
    showToast('Navigation links updated!');
  };

  // Derive Customers from Orders and Reservations
  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();

    orders.forEach((o) => {
      const key = o.customer.phone || o.customer.email || o.customer.fullName;
      const existing = map.get(key);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += o.total;
        if (!existing.lastOrderDate || new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = o.createdAt;
        }
      } else {
        map.set(key, {
          id: `cust-${key.replace(/[^a-zA-Z0-9]/g, '')}`,
          name: o.customer.fullName,
          phone: o.customer.phone,
          email: o.customer.email,
          area: o.customer.area,
          address: o.customer.address,
          totalOrders: 1,
          totalSpent: o.total,
          lastOrderDate: o.createdAt,
          joinedAt: o.createdAt,
        });
      }
    });

    reservations.forEach((r) => {
      const key = r.customerPhone || r.customerEmail || r.customerName;
      const existing = map.get(key);
      if (existing) {
        if (!existing.lastReservationDate || new Date(r.createdAt) > new Date(existing.lastReservationDate)) {
          existing.lastReservationDate = r.createdAt;
        }
      } else {
        map.set(key, {
          id: `cust-${key.replace(/[^a-zA-Z0-9]/g, '')}`,
          name: r.customerName,
          phone: r.customerPhone,
          email: r.customerEmail,
          area: 'Dhanmondi',
          address: 'Demo Address',
          totalOrders: 0,
          totalSpent: 0,
          lastReservationDate: r.createdAt,
          joinedAt: r.createdAt,
        });
      }
    });

    return Array.from(map.values());
  }, [orders, reservations]);

  // Reset Demo Data
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
    setNotifications([
      {
        id: 'notif-reset',
        title: 'Demo Data Restored',
        message: 'All restaurant records have been reset to factory defaults.',
        type: 'system',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    localStorage.clear();
    showToast('Demo data reset to original defaults!', 'info');
  };

  // Restore Restaurant Data from Google Drive Backup
  const restoreRestaurantBackup = (backupData: any): { success: boolean; message: string } => {
    try {
      if (!backupData || typeof backupData !== 'object') {
        return { success: false, message: 'Invalid backup file structure.' };
      }
      if (Array.isArray(backupData.products)) {
        setProducts(backupData.products);
        saveToStorage(STORAGE_KEYS.PRODUCTS, backupData.products);
      }
      if (Array.isArray(backupData.categories)) {
        setCategories(backupData.categories);
        saveToStorage(STORAGE_KEYS.CATEGORIES, backupData.categories);
      }
      if (Array.isArray(backupData.orders)) {
        setOrders(backupData.orders);
        saveToStorage(STORAGE_KEYS.ORDERS, backupData.orders);
      }
      if (Array.isArray(backupData.reservations)) {
        setReservations(backupData.reservations);
        saveToStorage(STORAGE_KEYS.RESERVATIONS, backupData.reservations);
      }
      if (Array.isArray(backupData.reviews)) {
        setReviews(backupData.reviews);
        saveToStorage(STORAGE_KEYS.REVIEWS, backupData.reviews);
      }
      if (Array.isArray(backupData.coupons)) {
        setCoupons(backupData.coupons);
        saveToStorage(STORAGE_KEYS.COUPONS, backupData.coupons);
      }
      if (Array.isArray(backupData.gallery)) {
        setGallery(backupData.gallery);
        saveToStorage(STORAGE_KEYS.GALLERY, backupData.gallery);
      }
      if (backupData.settings && typeof backupData.settings === 'object') {
        setSettings(backupData.settings);
        saveToStorage(STORAGE_KEYS.SETTINGS, backupData.settings);
      }
      if (Array.isArray(backupData.navLinks)) {
        setNavLinks(backupData.navLinks);
        saveToStorage(STORAGE_KEYS.NAV_LINKS, backupData.navLinks);
      }
      addActivityLog('Google Drive Restore', 'Restored restaurant database from Google Drive backup file', 'settings');
      showToast('Restaurant database restored from Google Drive successfully!', 'success');
      return { success: true, message: 'All restaurant records successfully restored.' };
    } catch (err: any) {
      console.error('Failed to restore backup:', err);
      showToast(`Restore failed: ${err.message}`, 'error');
      return { success: false, message: err.message || 'Failed to restore backup.' };
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
