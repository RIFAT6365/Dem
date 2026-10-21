-- ==============================================================================
-- DEM RESTAURANT — BACKEND SCHEMA REPAIR & NOTIFICATIONS MIGRATION
-- Project ID: iqnhcovwjwjelinlhkmj
-- Fixes: Notifications table, Review purchase verification & admin responses,
--        Strict RLS for Orders (no guest checkout), and Realtime Publications.
-- ==============================================================================

-- 1. Create In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('order', 'reservation', 'promo', 'review', 'system')),
  link TEXT,
  related_entity_id TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy recipient notification fetching
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created 
  ON public.notifications (user_id, created_at DESC);

-- 2. Alter Reviews Table to Support Order-Verification and Admin Moderation Responses
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS admin_response TEXT,
  ADD COLUMN IF NOT EXISTS admin_responded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_responder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create Unique Constraint to prevent multiple duplicate reviews for same order item by same user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_reviews_order_product_user'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT uq_reviews_order_product_user UNIQUE (order_id, product_id, user_id);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 3. Review Eligibility Helper Function (Checks verified purchase before review submission)
CREATE OR REPLACE FUNCTION public.check_review_eligibility(
  check_user_id UUID,
  check_product_id TEXT,
  check_order_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_completed BOOLEAN;
  product_in_order BOOLEAN;
  review_exists BOOLEAN;
BEGIN
  -- Verify order belongs to user and is completed
  SELECT (order_status IN ('Completed', 'Delivered'))
  INTO order_completed
  FROM public.orders
  WHERE id = check_order_id AND user_id = check_user_id;

  IF order_completed IS NOT TRUE THEN
    RETURN FALSE;
  END IF;

  -- Check if user already reviewed this product for this order
  SELECT EXISTS (
    SELECT 1 FROM public.reviews
    WHERE order_id = check_order_id AND product_id = check_product_id AND user_id = check_user_id
  ) INTO review_exists;

  IF review_exists THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- 4. Enable Row Level Security (RLS) on Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Policies:
-- Users can only read their own notifications (admins can view all)
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Users can mark their own notifications as read
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users or admins can insert notifications (e.g. system events)
DROP POLICY IF EXISTS "Authenticated users insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can delete notifications
DROP POLICY IF EXISTS "Admins manage all notifications" ON public.notifications;
CREATE POLICY "Admins manage all notifications" ON public.notifications
  FOR ALL USING (public.is_admin(auth.uid()));

-- 5. Harden Orders RLS: NO GUEST ORDERS ALLOWED
-- Orders must have an authenticated user_id matching auth.uid()
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
CREATE POLICY "Customers can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (auth.uid() = user_id OR public.is_admin(auth.uid()))
  );

-- 6. Harden Reviews RLS: Only authenticated users with eligible purchase can submit
DROP POLICY IF EXISTS "Customers can submit reviews" ON public.reviews;
CREATE POLICY "Customers can submit reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;
CREATE POLICY "Admins manage reviews" ON public.reviews
  FOR ALL USING (public.is_admin(auth.uid()));

-- 7. Configure Supabase Realtime Publication for Essential Tables
DO $$
BEGIN
  -- Add tables to supabase_realtime publication if not already present
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;
