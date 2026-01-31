-- =====================================================
-- ALLOW ANONYMOUS ENROLLMENT
-- =====================================================
-- Users do not need to be logged in to enroll.
-- Replace the authenticated-only INSERT policy with
-- one that allows anyone (anon + authenticated).
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert upanddown enrollments"
  ON public.upanddown_enrollments;

CREATE POLICY "Anyone can insert upanddown enrollments"
  ON public.upanddown_enrollments
  FOR INSERT
  WITH CHECK (true);
