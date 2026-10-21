-- ==============================================================================
-- DEM RESTAURANT — COMPLETE SUPABASE DATABASE SCHEMA & MIGRATION
-- Project ID: iqnhcovwjwjelinlhkmj
-- Project URL: https://iqnhcovwjwjelinlhkmj.supabase.co
-- Features: Auth, Profiles, Roles, Products, Categories, Orders, Status History,
--           Reservations, Reviews, Coupons, Settings, Navigation, Storage, RLS
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if needed (Clean rebuild)
-- DROP TABLE IF EXISTS activity_logs CASCADE;
-- DROP TABLE IF EXISTS navigation_items CASCADE;
-- DROP TABLE IF EXISTS site_settings CASCADE;
-- DROP TABLE IF EXISTS gallery_images CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS reservations CASCADE;
-- DROP TABLE IF EXISTS order_status_history CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS coupons CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS addresses CASCADE;
-- DROP TABLE IF EXISTS user_roles CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ==============================================================================
-- TABLE DEFINITIONS
-- ==============================================================================

-- 3. Profiles (Attached to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  loyalty_points INT DEFAULT 100,
  membership_tier TEXT DEFAULT 'Silver',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Roles (Separated RBAC authority)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'customer', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 5. Customer Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Dhaka',
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  flat_or_house TEXT,
  landmark TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Products
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  full_description TEXT,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  images JSONB DEFAULT '[]'::jsonb,
  price NUMERIC(10, 2) NOT NULL,
  sale_price NUMERIC(10, 2),
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  ingredients JSONB DEFAULT '[]'::jsonb,
  dietary_labels JSONB DEFAULT '[]'::jsonb,
  spice_level TEXT DEFAULT 'None',
  prep_time_minutes INT DEFAULT 20,
  addons JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Coupons & Promotions
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_value NUMERIC(10, 2) DEFAULT 0,
  max_discount NUMERIC(10, 2),
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  usage_limit INT DEFAULT 100,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  coupon_code TEXT,
  fulfillment_type TEXT NOT NULL DEFAULT 'Delivery',
  table_number TEXT,
  payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  order_status TEXT NOT NULL DEFAULT 'Pending',
  estimated_delivery_minutes INT DEFAULT 35,
  rider_name TEXT,
  rider_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Order Status History (Auditing status changes)
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Table Reservations
CREATE TABLE IF NOT EXISTS public.reservations (
  id TEXT PRIMARY KEY,
  reference_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  guests INT NOT NULL DEFAULT 2,
  seating_preference TEXT DEFAULT 'Indoor Dining',
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  table_assigned TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Customer Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  product_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  date TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Gallery Images
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Website Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  settings JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Navigation Menu Items
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  path TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  order_num INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Admin Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  category TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SECURITY & AUTHORIZATION (SECURITY DEFINER FUNCTION)
-- ==============================================================================

-- Function to check if a user is an admin without causing infinite recursion in RLS
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  );
$$;

-- Trigger to create profile and default customer role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;

  -- Default role is ALWAYS 'customer', never admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile; Admins can read all
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- User Roles: Users can read their own role; only Admins can manage roles
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins manage roles" ON public.user_roles;
CREATE POLICY "Only admins manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- Addresses: Customers manage their own addresses
DROP POLICY IF EXISTS "Customers manage own addresses" ON public.addresses;
CREATE POLICY "Customers manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Categories: Public read active; Admin full control
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL USING (public.is_admin(auth.uid()));

-- Products: Public read available; Admin full control
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products
  FOR SELECT USING (is_available = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL USING (public.is_admin(auth.uid()));

-- Coupons: Public read active; Admin manage
DROP POLICY IF EXISTS "Public read active coupons" ON public.coupons;
CREATE POLICY "Public read active coupons" ON public.coupons
  FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;
CREATE POLICY "Admins manage coupons" ON public.coupons
  FOR ALL USING (public.is_admin(auth.uid()));

-- Orders: Authenticated customers can read their own orders; anyone can insert (with checkout logic); Admins full control
DROP POLICY IF EXISTS "Customers read own orders" ON public.orders;
CREATE POLICY "Customers read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
CREATE POLICY "Customers can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL USING (public.is_admin(auth.uid()));

-- Order Status History:
DROP POLICY IF EXISTS "View order history" ON public.order_status_history;
CREATE POLICY "View order history" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins insert order history" ON public.order_status_history;
CREATE POLICY "Admins insert order history" ON public.order_status_history
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Reservations:
DROP POLICY IF EXISTS "Customers view own reservations" ON public.reservations;
CREATE POLICY "Customers view own reservations" ON public.reservations
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can create reservation" ON public.reservations;
CREATE POLICY "Anyone can create reservation" ON public.reservations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage reservations" ON public.reservations;
CREATE POLICY "Admins manage reservations" ON public.reservations
  FOR ALL USING (public.is_admin(auth.uid()));

-- Reviews: Public read approved; Anyone submit; Admin manage
DROP POLICY IF EXISTS "Public read approved reviews" ON public.reviews;
CREATE POLICY "Public read approved reviews" ON public.reviews
  FOR SELECT USING (is_approved = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Customers can submit reviews" ON public.reviews;
CREATE POLICY "Customers can submit reviews" ON public.reviews
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;
CREATE POLICY "Admins manage reviews" ON public.reviews
  FOR ALL USING (public.is_admin(auth.uid()));

-- Gallery: Public read; Admin manage
DROP POLICY IF EXISTS "Public read gallery" ON public.gallery_images;
CREATE POLICY "Public read gallery" ON public.gallery_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage gallery" ON public.gallery_images;
CREATE POLICY "Admins manage gallery" ON public.gallery_images
  FOR ALL USING (public.is_admin(auth.uid()));

-- Site Settings: Public read; Admin manage
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
CREATE POLICY "Public read settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins update settings" ON public.site_settings;
CREATE POLICY "Admins update settings" ON public.site_settings
  FOR ALL USING (public.is_admin(auth.uid()));

-- Navigation Items: Public read; Admin manage
DROP POLICY IF EXISTS "Public read navigation" ON public.navigation_items;
CREATE POLICY "Public read navigation" ON public.navigation_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage navigation" ON public.navigation_items;
CREATE POLICY "Admins manage navigation" ON public.navigation_items
  FOR ALL USING (public.is_admin(auth.uid()));

-- Activity Logs: Admins only
DROP POLICY IF EXISTS "Admins read and write activity logs" ON public.activity_logs;
CREATE POLICY "Admins read and write activity logs" ON public.activity_logs
  FOR ALL USING (public.is_admin(auth.uid()));

-- ==============================================================================
-- STORAGE BUCKETS CONFIGURATION (Run in Supabase SQL Editor)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-gallery', 'restaurant-gallery', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Public can read; Admins can upload and delete
CREATE POLICY "Public Read Gallery Bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('restaurant-gallery', 'product-images'));

CREATE POLICY "Admin Upload to Buckets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('restaurant-gallery', 'product-images') AND public.is_admin(auth.uid()));

CREATE POLICY "Admin Delete from Buckets"
  ON storage.objects FOR DELETE
  USING (bucket_id IN ('restaurant-gallery', 'product-images') AND public.is_admin(auth.uid()));

-- ==============================================================================
-- FIRST-ADMIN PROVISIONING SCRIPT (Execute after registering your user)
-- ==============================================================================
-- Replace 'your-email@example.com' with the email you signed up with:
--
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'parsonalrifat@gmail.com'
-- ON CONFLICT (user_id, role) DO NOTHING;
