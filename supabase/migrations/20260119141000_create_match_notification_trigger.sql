-- =====================================================
-- CREATE MATCH NOTIFICATION TRIGGER
-- =====================================================
-- This trigger creates notifications for users when a new match
-- is created that matches their notification filter preferences
-- =====================================================

-- Function to check if a match meets a user's notification criteria
CREATE OR REPLACE FUNCTION check_match_notification_filter(
  p_user_id UUID,
  p_match_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_filter RECORD;
  v_match RECORD;
  v_distance_km DOUBLE PRECISION;
  v_match_date TIMESTAMPTZ;
  v_date_start TIMESTAMPTZ;
  v_date_end TIMESTAMPTZ;
  v_has_matching_level BOOLEAN;
BEGIN
  -- Get user's notification filter
  SELECT * INTO v_filter
  FROM notification_match_filters
  WHERE user_id = p_user_id;

  -- If no filter exists, don't send notification
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get match details
  SELECT * INTO v_match
  FROM matches
  WHERE id = p_match_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check location filter
  IF v_filter.location_enabled THEN
    -- Calculate distance if both match and filter have coordinates
    IF v_match.latitude IS NOT NULL
       AND v_match.longitude IS NOT NULL
       AND v_filter.location_latitude IS NOT NULL
       AND v_filter.location_longitude IS NOT NULL THEN

      -- Calculate distance using Haversine formula (approximate)
      v_distance_km := (
        6371 * acos(
          cos(radians(v_filter.location_latitude)) *
          cos(radians(v_match.latitude)) *
          cos(radians(v_match.longitude) - radians(v_filter.location_longitude)) +
          sin(radians(v_filter.location_latitude)) *
          sin(radians(v_match.latitude))
        )
      );

      -- If match is outside radius, don't send notification
      IF v_distance_km > v_filter.location_radius_km THEN
        RETURN FALSE;
      END IF;
    END IF;
  END IF;

  -- Check date filter
  IF v_filter.date_enabled AND v_match.match_date IS NOT NULL THEN
    v_match_date := v_match.match_date;

    -- Calculate date range based on filter
    CASE v_filter.date_range
      WHEN 'today' THEN
        v_date_start := CURRENT_DATE;
        v_date_end := CURRENT_DATE + INTERVAL '1 day';
      WHEN 'tomorrow' THEN
        v_date_start := CURRENT_DATE + INTERVAL '1 day';
        v_date_end := CURRENT_DATE + INTERVAL '2 days';
      WHEN 'next-week' THEN
        v_date_start := CURRENT_DATE;
        v_date_end := CURRENT_DATE + INTERVAL '7 days';
      WHEN 'next-3-weeks' THEN
        v_date_start := CURRENT_DATE;
        v_date_end := CURRENT_DATE + INTERVAL '21 days';
      ELSE
        v_date_start := CURRENT_DATE;
        v_date_end := CURRENT_DATE + INTERVAL '21 days';
    END CASE;

    -- If match is outside date range, don't send notification
    IF v_match_date < v_date_start OR v_match_date >= v_date_end THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- Check ranking filter
  IF v_filter.ranking_enabled AND v_filter.ranking_levels IS NOT NULL AND array_length(v_filter.ranking_levels, 1) > 0 THEN
    -- Check if any of the match's levels are in the user's selected levels
    SELECT EXISTS (
      SELECT 1
      FROM unnest(v_match.match_levels) AS match_level
      WHERE match_level = ANY(v_filter.ranking_levels)
    ) INTO v_has_matching_level;

    -- If no matching level, don't send notification
    IF NOT v_has_matching_level THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- All filters passed
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications for new matches
CREATE OR REPLACE FUNCTION notify_users_of_new_match()
RETURNS TRIGGER AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Only create notifications for confirmed matches (not pending)
  IF NEW.status = 'confirmed' THEN
    -- Loop through all users with notification filters
    FOR v_user IN
      SELECT DISTINCT user_id
      FROM notification_match_filters
      WHERE user_id != NEW.created_by  -- Don't notify the creator
    LOOP
      -- Check if this match meets the user's criteria
      IF check_match_notification_filter(v_user.user_id, NEW.id) THEN
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
          v_user.user_id,
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

-- Create trigger for new matches
DROP TRIGGER IF EXISTS trigger_notify_users_of_new_match ON matches;
CREATE TRIGGER trigger_notify_users_of_new_match
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_users_of_new_match();

-- Create trigger for match updates (when status changes to confirmed)
DROP TRIGGER IF EXISTS trigger_notify_users_of_updated_match ON matches;
CREATE TRIGGER trigger_notify_users_of_updated_match
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (OLD.status != 'confirmed' AND NEW.status = 'confirmed')
  EXECUTE FUNCTION notify_users_of_new_match();

-- Add comment
COMMENT ON FUNCTION check_match_notification_filter IS
'Checks if a match meets a users notification filter criteria';

COMMENT ON FUNCTION notify_users_of_new_match IS
'Creates notifications for users when a new match is created that matches their filter preferences';
