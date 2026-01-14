-- =====================================================
-- ADD PLAYTOMIC USER ID TO PROFILES
-- =====================================================
-- This migration adds playtomic_user_id field to profiles
-- =====================================================

-- Add playtomic_user_id column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS playtomic_user_id TEXT;

COMMENT ON COLUMN public.profiles.playtomic_user_id IS 'Playtomic user ID - automatically filled when user posts their first match';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_playtomic_user_id ON public.profiles(playtomic_user_id);
