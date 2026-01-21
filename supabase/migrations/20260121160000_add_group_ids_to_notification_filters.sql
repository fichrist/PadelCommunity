-- Add group_ids column to notification_match_filters table
-- This allows filtering notifications by groups instead of ranking levels

ALTER TABLE public.notification_match_filters
ADD COLUMN group_ids UUID[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN public.notification_match_filters.group_ids IS 'Array of group IDs that the user wants to receive notifications for';

-- Create index for faster array operations
CREATE INDEX IF NOT EXISTS notification_match_filters_group_ids_idx
ON public.notification_match_filters USING GIN (group_ids);
