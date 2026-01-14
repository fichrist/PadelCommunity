-- =====================================================
-- DROP HEALER TABLES MIGRATION
-- =====================================================
-- This migration removes healer-related functionality
-- =====================================================

-- Drop healer_profile_id column from thoughts table
ALTER TABLE public.thoughts DROP COLUMN IF EXISTS healer_profile_id;

-- Drop the healer_profiles table
DROP TABLE IF EXISTS public.healer_profiles CASCADE;

-- Remove is_healer column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_healer;

-- Note: We're keeping the profiles table structure intact
-- as it's used for regular user profiles
