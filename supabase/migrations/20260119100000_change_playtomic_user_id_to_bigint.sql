-- =====================================================
-- CHANGE PLAYTOMIC_USER_ID TO BIGINT
-- =====================================================
-- This migration changes playtomic_user_id from text to bigint
-- in both profiles and match_participants tables
-- =====================================================

-- Step 1: Drop the index on profiles.playtomic_user_id
DROP INDEX IF EXISTS profiles_playtomic_user_id_idx;

-- Step 2: Convert empty strings to NULL in profiles
UPDATE public.profiles
SET playtomic_user_id = NULL
WHERE playtomic_user_id = '' OR playtomic_user_id !~ '^[0-9]+$';

-- Step 3: Convert empty strings to NULL in match_participants
UPDATE public.match_participants
SET playtomic_user_id = NULL
WHERE playtomic_user_id = '' OR playtomic_user_id !~ '^[0-9]+$';

-- Step 4: Change playtomic_user_id type in profiles table
-- Using USING clause to convert existing text values to bigint
ALTER TABLE public.profiles
ALTER COLUMN playtomic_user_id TYPE bigint USING playtomic_user_id::bigint;

-- Step 5: Change playtomic_user_id type in match_participants table
ALTER TABLE public.match_participants
ALTER COLUMN playtomic_user_id TYPE bigint USING playtomic_user_id::bigint;

-- Step 4: Recreate the index on profiles.playtomic_user_id
CREATE INDEX IF NOT EXISTS profiles_playtomic_user_id_idx
ON public.profiles(playtomic_user_id);

-- Step 5: Add comment
COMMENT ON COLUMN public.profiles.playtomic_user_id IS
'Playtomic user ID as integer for matching with participant data';

COMMENT ON COLUMN public.match_participants.playtomic_user_id IS
'Playtomic user ID as integer from scraped match data';
