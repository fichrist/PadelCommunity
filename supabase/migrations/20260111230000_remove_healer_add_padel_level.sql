-- =====================================================
-- REMOVE IS_HEALER AND ADD PADEL_LEVEL MIGRATION
-- =====================================================
-- This migration removes the is_healer boolean field
-- and adds a padel_level field with Playtomic ranking values
-- =====================================================

-- Step 1: Create padel_level enum type
CREATE TYPE padel_level AS ENUM ('P50', 'P100', 'P200', 'P300', 'P400', 'P500', 'P700', 'P1000');

-- Step 2: Add padel_level column to profiles table
ALTER TABLE public.profiles ADD COLUMN padel_level padel_level;

-- Step 3: Drop the is_healer index
DROP INDEX IF EXISTS idx_profiles_is_healer;

-- Step 4: Remove is_healer column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_healer;

-- Step 5: Create index for padel_level for performance
CREATE INDEX IF NOT EXISTS idx_profiles_padel_level ON public.profiles(padel_level);

-- Step 6: Update handle_new_user function to remove is_healer and add padel_level
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    phone_number,
    street,
    city,
    postal_code,
    country,
    padel_level,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'street',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'postal_code',
    NEW.raw_user_meta_data->>'country',
    CASE
      WHEN NEW.raw_user_meta_data->>'padel_level' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'padel_level')::padel_level
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Update sync_profile_to_user_metadata function to remove is_healer and add padel_level
CREATE OR REPLACE FUNCTION public.sync_profile_to_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'first_name', NEW.first_name,
    'last_name', NEW.last_name,
    'phone_number', NEW.phone_number,
    'street', NEW.street,
    'city', NEW.city,
    'postal_code', NEW.postal_code,
    'country', NEW.country,
    'padel_level', NEW.padel_level,
    'avatar_url', NEW.avatar_url,
    'display_name', NEW.display_name
  )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
