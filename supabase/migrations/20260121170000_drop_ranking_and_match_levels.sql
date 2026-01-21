-- Drop ranking_levels from notification_match_filters (use group_ids instead)
-- Drop match_levels from matches (use group_ids instead)

-- Remove ranking_levels column from notification_match_filters
ALTER TABLE public.notification_match_filters
DROP COLUMN IF EXISTS ranking_levels;

-- Remove ranking_enabled column from notification_match_filters (no longer needed)
ALTER TABLE public.notification_match_filters
DROP COLUMN IF EXISTS ranking_enabled;

-- Remove match_levels column from matches
ALTER TABLE public.matches
DROP COLUMN IF EXISTS match_levels;

-- Add comment to clarify the new approach
COMMENT ON COLUMN public.notification_match_filters.group_ids IS 'Array of group IDs that the user wants to receive notifications for. Replaces ranking_levels.';
