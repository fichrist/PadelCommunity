-- =====================================================
-- ADD RESTRICTED USERS TO MATCHES
-- =====================================================
-- This migration adds restricted_users field to matches table
-- When populated, only users in this array can see the match
-- =====================================================

-- Add restricted_users column
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS restricted_users UUID[] DEFAULT NULL;

-- Create index for restricted users lookups
CREATE INDEX IF NOT EXISTS idx_matches_restricted_users
ON public.matches USING GIN (restricted_users);

-- Add comment
COMMENT ON COLUMN public.matches.restricted_users IS
'Array of user IDs who can see this match. If NULL or empty, match is visible to all users based on normal filters. If populated, only these users (and the creator) can see the match.';
