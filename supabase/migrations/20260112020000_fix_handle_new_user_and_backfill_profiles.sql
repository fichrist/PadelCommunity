-- =====================================================
-- FIX HANDLE_NEW_USER TRIGGER AND BACKFILL PROFILES
-- =====================================================
-- This migration updates the handle_new_user function to remove is_healer
-- and backfills profiles for any existing users without profiles
-- =====================================================

-- Drop and recreate the function without is_healer
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
    street_name,
    city,
    postal_code,
    country,
    avatar_url
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', NULL),
    COALESCE(NEW.raw_user_meta_data->>'street_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'city', NULL),
    COALESCE(NEW.raw_user_meta_data->>'postal_code', NULL),
    COALESCE(NEW.raw_user_meta_data->>'country', NULL),
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

-- Backfill profiles for any existing users without profiles
INSERT INTO public.profiles (id)
SELECT au.id
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile record when a new user signs up';
