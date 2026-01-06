-- Fix the sync_profile_to_user_metadata trigger to remove address field references
-- These fields have been moved to the addresses table

CREATE OR REPLACE FUNCTION public.sync_profile_to_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'first_name', NEW.first_name,
    'last_name', NEW.last_name,
    'phone_number', NEW.phone_number,
    'is_healer', NEW.is_healer,
    'avatar_url', NEW.avatar_url,
    'display_name', NEW.display_name
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
