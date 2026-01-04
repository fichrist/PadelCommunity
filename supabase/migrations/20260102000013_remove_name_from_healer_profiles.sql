-- Remove name column from healer_profiles table
-- Name should come from the profiles table instead
ALTER TABLE public.healer_profiles
DROP COLUMN IF EXISTS name;
