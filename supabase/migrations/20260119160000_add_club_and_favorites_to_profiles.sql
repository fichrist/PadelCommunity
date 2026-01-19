-- =====================================================
-- ADD CLUB NAME AND FAVORITES TO PROFILES
-- =====================================================
-- This migration adds club_name field (from Tennis Padel Vlaanderen)
-- and favorite_users array for storing user's favorite players
-- =====================================================

-- Add club_name column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS club_name TEXT;

-- Add favorite_users column (array of user IDs)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS favorite_users UUID[] DEFAULT ARRAY[]::UUID[];

-- Create index for favorite lookups
CREATE INDEX IF NOT EXISTS idx_profiles_favorite_users
ON public.profiles USING GIN (favorite_users);

-- Add comments
COMMENT ON COLUMN public.profiles.club_name IS
'Club name from Tennis & Padel Vlaanderen profile';

COMMENT ON COLUMN public.profiles.favorite_users IS
'Array of user IDs that this user has marked as favorites';
