-- =====================================================
-- ADD SCRAPED_FROM_PLAYTOMIC FLAG TO MATCH_PARTICIPANTS
-- =====================================================
-- This migration adds a boolean flag to indicate whether
-- a participant was scraped from Playtomic or manually added
-- =====================================================

-- Add scraped_from_playtomic column to match_participants
ALTER TABLE public.match_participants
ADD COLUMN IF NOT EXISTS scraped_from_playtomic BOOLEAN NOT NULL DEFAULT false;

-- Update existing participants that have playtomic_user_id to be marked as scraped
UPDATE public.match_participants
SET scraped_from_playtomic = true
WHERE playtomic_user_id IS NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.match_participants.scraped_from_playtomic IS
'Indicates whether this participant was scraped from Playtomic (true) or manually added via UI (false)';
