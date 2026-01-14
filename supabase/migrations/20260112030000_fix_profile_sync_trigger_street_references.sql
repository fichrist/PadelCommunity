-- =====================================================
-- FIX PROFILE SYNC TRIGGER STREET REFERENCES
-- =====================================================
-- This migration fixes any remaining references to 'street'
-- that should be 'street_name' in profile sync triggers
-- =====================================================

-- Drop the old sync_profile_changes function if it exists
DROP FUNCTION IF EXISTS public.sync_profile_changes() CASCADE;

-- Recreate sync_profile_changes function without 'street' references
CREATE OR REPLACE FUNCTION public.sync_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user metadata with profile changes
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'first_name', NEW.first_name,
    'last_name', NEW.last_name,
    'phone_number', NEW.phone_number,
    'street_name', NEW.street_name,
    'city', NEW.city,
    'postal_code', NEW.postal_code,
    'country', NEW.country,
    'avatar_url', NEW.avatar_url,
    'padel_level', NEW.padel_level,
    'ranking', NEW.ranking
  )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_changes();

-- Add comment
COMMENT ON FUNCTION public.sync_profile_changes() IS 'Syncs profile changes back to auth.users metadata';
