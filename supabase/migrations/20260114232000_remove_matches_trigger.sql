-- =====================================================
-- REMOVE MATCHES UPDATE TRIGGER TEMPORARILY
-- =====================================================
-- The trigger is causing issues with updates
-- Remove it temporarily to allow match updates to work
-- =====================================================

-- Drop the trigger completely
DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;

-- We'll manually update updated_at in the application code instead
