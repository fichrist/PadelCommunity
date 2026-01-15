-- =====================================================
-- FIX MATCHES UPDATE TRIGGER
-- =====================================================
-- Drop and recreate the trigger to ensure it works properly
-- =====================================================

-- Drop existing trigger
DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;

-- Recreate the function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
