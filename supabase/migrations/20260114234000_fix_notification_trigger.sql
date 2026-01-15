-- =====================================================
-- FIX NOTIFICATION TRIGGER
-- =====================================================
-- Fix the notify_users_of_new_match function to use TEXT instead of RECORD
-- for match level iteration
-- =====================================================

CREATE OR REPLACE FUNCTION notify_users_of_new_match()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
  user_ranking_value INTEGER;
  match_level_text TEXT;  -- Changed from RECORD to TEXT
  level_min INTEGER;
  level_max INTEGER;
  should_notify BOOLEAN;
BEGIN
  -- Only process confirmed matches with match_date
  IF NEW.status != 'confirmed' OR NEW.match_date IS NULL THEN
    RETURN NEW;
  END IF;

  -- Loop through all users with a ranking
  FOR user_record IN
    SELECT id, ranking
    FROM profiles
    WHERE ranking IS NOT NULL
    AND id != NEW.created_by -- Don't notify the creator
  LOOP
    -- Extract numeric value from user's ranking (e.g., "P450" -> 450)
    user_ranking_value := (regexp_match(user_record.ranking, 'P?(\d+)', 'i'))[1]::INTEGER;

    IF user_ranking_value IS NULL THEN
      CONTINUE;
    END IF;

    should_notify := FALSE;

    -- Check if user's ranking falls within any of the match levels
    FOREACH match_level_text IN ARRAY NEW.match_levels  -- Changed variable name
    LOOP
      -- Parse the match level to get min and max values
      CASE match_level_text  -- Changed from match_level_record::TEXT
        WHEN 'p50-p100' THEN
          level_min := 50;
          level_max := 100;
        WHEN 'p100-p200' THEN
          level_min := 100;
          level_max := 200;
        WHEN 'p200-p300' THEN
          level_min := 200;
          level_max := 300;
        WHEN 'p300-p400' THEN
          level_min := 300;
          level_max := 400;
        WHEN 'p400-p500' THEN
          level_min := 400;
          level_max := 500;
        WHEN 'p500-p700' THEN
          level_min := 500;
          level_max := 700;
        WHEN 'p700-p1000' THEN
          level_min := 700;
          level_max := 1000;
        WHEN 'p1000+' THEN
          level_min := 1000;
          level_max := 999999;
        ELSE
          CONTINUE;
      END CASE;

      -- Check if user's ranking is within this level
      IF user_ranking_value >= level_min AND user_ranking_value <= level_max THEN
        should_notify := TRUE;
        EXIT; -- Found a matching level, no need to check others
      END IF;
    END LOOP;

    -- Create notification if user's ranking matches
    IF should_notify THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        user_record.id,
        'new_match',
        'New Match Available',
        COALESCE(
          'A new match at ' || NEW.venue_name || ' on ' ||
          TO_CHAR(NEW.match_date, 'DD/MM/YYYY') ||
          COALESCE(' at ' || NEW.match_time, ''),
          'A new match has been posted that matches your ranking'
        ),
        jsonb_build_object(
          'match_id', NEW.id,
          'venue_name', NEW.venue_name,
          'match_date', NEW.match_date,
          'match_time', NEW.match_time,
          'match_levels', NEW.match_levels
        )
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
