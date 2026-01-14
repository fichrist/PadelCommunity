-- =====================================================
-- ADD RANKING FIELD TO PROFILES
-- =====================================================
-- This migration adds a ranking field to store
-- Tennis & Padel Vlaanderen ranking data
-- =====================================================

-- Add ranking field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ranking TEXT;

-- Add comment
COMMENT ON COLUMN public.profiles.ranking IS 'Tennis & Padel Vlaanderen ranking (e.g., "P400", "P550")';

-- Create index for ranking queries
CREATE INDEX IF NOT EXISTS idx_profiles_ranking ON public.profiles(ranking);
