-- =====================================================
-- REMOVE NOTIFICATION TRIGGERS
-- =====================================================
-- This migration removes the automatic notification triggers
-- Notification logic will be handled in the application code
-- =====================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_notify_users_of_new_match ON matches;
DROP TRIGGER IF EXISTS trigger_notify_users_of_updated_match ON matches;

-- Drop functions (CASCADE to handle any remaining dependencies)
DROP FUNCTION IF EXISTS notify_users_of_new_match() CASCADE;
DROP FUNCTION IF EXISTS check_match_notification_filter(UUID, UUID) CASCADE;

-- Add comment
COMMENT ON TABLE notifications IS
'Notifications table - notifications are created via application code, not database triggers';
