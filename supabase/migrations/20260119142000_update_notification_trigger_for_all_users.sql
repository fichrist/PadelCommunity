-- =====================================================
-- UPDATE NOTIFICATION TRIGGER TO INCLUDE ALL USERS
-- =====================================================
-- This migration updates the notification trigger to send
-- notifications to ALL users (except creator), not just those
-- with filters. Users without filters get all notifications.
-- =====================================================

-- Updated function to create notifications for new matches
CREATE OR REPLACE FUNCTION notify_users_of_new_match()
RETURNS TRIGGER AS $$
DECLARE
  v_user RECORD;
  v_has_filter BOOLEAN;
BEGIN
  -- Only create notifications for confirmed matches (not pending)
  IF NEW.status = 'confirmed' THEN
    -- Loop through all users except the creator
    FOR v_user IN
      SELECT id
      FROM auth.users
      WHERE id != NEW.created_by
    LOOP
      -- Check if user has a notification filter
      SELECT EXISTS (
        SELECT 1
        FROM notification_match_filters
        WHERE user_id = v_user.id
      ) INTO v_has_filter;

      -- If user has a filter, check if match meets criteria
      -- If user has no filter, always send notification
      IF NOT v_has_filter OR check_match_notification_filter(v_user.id, NEW.id) THEN
        -- Create notification
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          link,
          match_id,
          created_at
        )
        VALUES (
          v_user.id,
          'new_match',
          'New Match Available',
          CASE
            WHEN NEW.venue_name IS NOT NULL THEN
              'New match at ' || NEW.venue_name || ' on ' || to_char(NEW.match_date, 'FMDay, FMMonth FMDD')
            ELSE
              'New match on ' || to_char(NEW.match_date, 'FMDay, FMMonth FMDD')
          END,
          '/events?match=' || NEW.id,
          NEW.id,
          NOW()
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION notify_users_of_new_match IS
'Creates notifications for all users when a new match is created. Users with filters only get notified if match meets their criteria. Users without filters get all notifications.';
