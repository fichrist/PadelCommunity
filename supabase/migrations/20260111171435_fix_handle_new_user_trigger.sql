-- =====================================================
-- FIX HANDLE_NEW_USER TRIGGER
-- =====================================================
-- This migration fixes the handle_new_user function to be more robust
-- and handle cases where user metadata might not be present
-- =====================================================

-- Drop and recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a profile record for the new user
  -- Use COALESCE to handle null metadata gracefully
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    phone_number,
    street,
    city,
    postal_code,
    country,
    is_healer,
    avatar_url
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', NULL),
    COALESCE(NEW.raw_user_meta_data->>'street', NULL),
    COALESCE(NEW.raw_user_meta_data->>'city', NULL),
    COALESCE(NEW.raw_user_meta_data->>'postal_code', NULL),
    COALESCE(NEW.raw_user_meta_data->>'country', NULL),
    COALESCE((NEW.raw_user_meta_data->>'is_healer')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
