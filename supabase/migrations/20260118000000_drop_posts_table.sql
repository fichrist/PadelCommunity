-- =====================================================
-- DROP POSTS TABLE AND DEPENDENCIES
-- =====================================================
-- This migration removes the posts table and all its dependencies
-- since the app is focused on padel events and matches
-- =====================================================

-- Step 1: Drop the check constraint that requires post_id
ALTER TABLE public.thoughts
DROP CONSTRAINT IF EXISTS thoughts_post_or_match_check;

-- Step 2: Add new check constraint that doesn't require post_id
-- A thought must have either event_id OR match_id
ALTER TABLE public.thoughts
ADD CONSTRAINT thoughts_entity_check
CHECK (event_id IS NOT NULL OR match_id IS NOT NULL);

-- Step 3: Drop the foreign key constraint and index for post_id
ALTER TABLE public.thoughts
DROP CONSTRAINT IF EXISTS thoughts_post_id_fkey;

DROP INDEX IF EXISTS public.thoughts_post_id_idx;

-- Step 4: Drop the post_id column from thoughts
ALTER TABLE public.thoughts
DROP COLUMN IF EXISTS post_id;

-- Step 5: Drop the posts table (this will cascade to any remaining dependencies)
DROP TABLE IF EXISTS public.posts CASCADE;

-- Note: The posts storage bucket should be deleted manually via Supabase dashboard
-- or with a separate migration that uses the storage API
