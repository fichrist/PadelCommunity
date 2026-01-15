-- =====================================================
-- FIX UPDATE_UPDATED_AT_COLUMN FUNCTION
-- =====================================================
-- Recreate the function with proper RECORD handling
-- =====================================================

-- Drop and recreate the function to ensure it's correct
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS
  'Automatically updates the updated_at column to the current timestamp';

-- Recreate the trigger
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
