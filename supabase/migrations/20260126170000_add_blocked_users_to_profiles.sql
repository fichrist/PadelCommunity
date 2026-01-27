-- =====================================================
-- ADD BLOCKED USERS TO PROFILES
-- =====================================================
-- This migration adds blocked_users array for storing
-- users that this user has blocked. Blocked users won't
-- see this user's matches.
-- =====================================================

-- Add blocked_users column (array of user IDs)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS blocked_users UUID[] DEFAULT ARRAY[]::UUID[];

-- Create index for blocked user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_blocked_users
ON public.profiles USING GIN (blocked_users);

-- Add comment
COMMENT ON COLUMN public.profiles.blocked_users IS
'Array of user IDs that this user has blocked. Blocked users cannot see this user''s matches.';
