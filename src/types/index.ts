export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Out for Delivery' | 'Completed' | 'Canceled';
export type PaymentMethod = 'Cash on Delivery' | 'Online Payment' | 'bKash / Mobile Banking';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type FulfillmentType = 'Delivery' | 'Takeaway' | 'Dine-in';
export type ReservationStatus = 'Pending' | 'Confirmed' | 'Seated' | 'Completed' | 'Canceled';
export type SpiceLevel = 'Mild' | 'Medium' | 'Hot' | 'Extra Hot' | 'None';

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  images: string[];
  price: number;
  salePrice?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  ingredients: string[];
  dietaryLabels: string[]; // e.g. "Halal", "Vegetarian", "Gluten-Free", "Chef's Special"
  spiceLevel: SpiceLevel;
  prepTimeMinutes: number;
  addons?: ProductAddon[];
  rating: number;
  reviewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
  itemCount?: number;
}

export interface CartItemOption {
  addonId: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // unique item id (productId + serialized options)
  productId: string;
  productName: string;
  productImage: string;
  price: number; // unit price with options
  basePrice: number;
  quantity: number;
  selectedOptions: CartItemOption[];
  specialInstructions?: string;
}

export interface CustomerLocation {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  area: string;
  address: string;
  flatOrHouse?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
  optionsSummary?: string;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerLocation;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  fulfillmentType: FulfillmentType;
  tableNumber?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  estimatedDeliveryMinutes?: number;
  riderName?: string;
  riderPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  referenceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  guests: number;
  seatingPreference: 'Indoor Dining' | 'Outdoor Patio' | 'Private Room' | 'Window Booth';
  specialRequests?: string;
  status: ReservationStatus;
  tableAssigned?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city?: string;
  area: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  lastReservationDate?: string;
  joinedAt: string;
}

export interface Review {
  id: string;
  productId?: string;
  productName?: string;
  orderId?: string;
  userId?: string;
  authorName: string;
  authorAvatar?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  date: string;
  isApproved: boolean;
  verifiedPurchase: boolean;
  adminResponse?: string;
  adminRespondedAt?: string;
  createdAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Dishes' | 'Ambience' | 'Kitchen' | 'Events';
  imageUrl: string;
  caption?: string;
}

export interface WebsiteSettings {
  restaurantName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  googleMapsEmbedUrl?: string;
  openingHours: string;
  currency: string;
  currencySymbol: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  taxRatePercent: number;
  minOrderAmount: number;
  allowPickup: boolean;
  allowCashOnDelivery: boolean;
  allowOnlinePayment: boolean;
  reservationNotice: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  category: 'order' | 'product' | 'reservation' | 'coupon' | 'settings' | 'review';
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'order' | 'reservation' | 'promo' | 'system' | 'review';
  link?: string;
  relatedEntityId?: string;
  read: boolean;
  createdAt: string;
}

export interface NavigationLink {
  id: string;
  label: string;
  path: string;
  isVisible: boolean;
  order: number;
}
