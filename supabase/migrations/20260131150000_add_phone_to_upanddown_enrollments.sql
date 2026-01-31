-- =====================================================
-- ADD PHONE NUMBER TO UPANDDOWN ENROLLMENTS
-- =====================================================
-- Adds phone_number column and makes email columns nullable
-- since the enrollment form no longer collects email.
-- =====================================================

ALTER TABLE public.upanddown_enrollments
ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE public.upanddown_enrollments
ALTER COLUMN email DROP NOT NULL;

-- Allow anonymous inserts (no login required for Up & Down)
DROP POLICY IF EXISTS "Authenticated users can insert upanddown enrollments" ON public.upanddown_enrollments;
DROP POLICY IF EXISTS "Anyone can insert upanddown enrollments" ON public.upanddown_enrollments;
CREATE POLICY "Anyone can insert upanddown enrollments"
  ON public.upanddown_enrollments
  FOR INSERT
  WITH CHECK (true);
