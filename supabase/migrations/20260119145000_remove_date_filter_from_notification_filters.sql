-- =====================================================
-- REMOVE DATE FILTER FROM NOTIFICATION MATCH FILTERS
-- =====================================================
-- Remove date_enabled, date_range, date_from, and date_to columns
-- Users will receive notifications for all matches regardless of date
-- =====================================================

ALTER TABLE public.notification_match_filters
DROP COLUMN IF EXISTS date_enabled,
DROP COLUMN IF EXISTS date_range,
DROP COLUMN IF EXISTS date_from,
DROP COLUMN IF EXISTS date_to;

-- Add comment
COMMENT ON TABLE public.notification_match_filters IS
'Notification match filters - users can filter by location and ranking level';
