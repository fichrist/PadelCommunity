-- =====================================================
-- DROP BROKEN MATCH NOTIFICATION TRIGGER
-- =====================================================
-- The database trigger notify_users_of_new_match() calls
-- check_match_notification_filter() which references columns
-- that were dropped in earlier migrations:
--   - location_enabled (dropped in 20260129140000)
--   - date_enabled, date_range (dropped in 20260119145000)
--   - ranking_enabled, ranking_levels (dropped in 20260121170000)
--   - match_levels on matches (dropped in 20260121170000)
--
-- Match notifications are now handled client-side by
-- createMatchNotifications() in notifications.ts.
-- =====================================================

-- Drop triggers on matches table
DROP TRIGGER IF EXISTS trigger_notify_users_of_new_match ON matches;
DROP TRIGGER IF EXISTS trigger_notify_users_of_updated_match ON matches;
DROP TRIGGER IF EXISTS trigger_notify_new_match ON matches;

-- Drop the stale functions
DROP FUNCTION IF EXISTS notify_users_of_new_match();
DROP FUNCTION IF EXISTS check_match_notification_filter(UUID, UUID);
