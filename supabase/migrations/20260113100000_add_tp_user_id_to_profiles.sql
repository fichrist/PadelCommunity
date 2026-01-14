-- =====================================================
-- ADD TP_USER_ID TO PROFILES TABLE
-- =====================================================
-- Add tp_user_id column to profiles table to store the
-- Tennis & Padel Vlaanderen user ID
-- =====================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tp_user_id INTEGER;

-- Add comment
COMMENT ON COLUMN public.profiles.tp_user_id IS
  'Tennis & Padel Vlaanderen user ID extracted from player profile';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_tp_user_id ON public.profiles(tp_user_id);
