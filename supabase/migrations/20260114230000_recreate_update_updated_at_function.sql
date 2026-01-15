-- =====================================================
-- RECREATE UPDATE_UPDATED_AT_COLUMN FUNCTION
-- =====================================================
-- This function was dropped in a previous migration but is still needed
-- by triggers on matches and match_participants tables
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS
  'Automatically updates the updated_at column to the current timestamp';
