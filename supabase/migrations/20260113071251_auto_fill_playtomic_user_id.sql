-- =====================================================
-- AUTO-FILL PLAYTOMIC USER ID IN PROFILES
-- =====================================================
-- This trigger automatically fills playtomic_user_id in profiles
-- when a new participant is added to a match
-- =====================================================

-- Create function to auto-fill playtomic_user_id
CREATE OR REPLACE FUNCTION auto_fill_playtomic_user_id()
RETURNS TRIGGER AS $$
DECLARE
  matching_profiles_count INTEGER;
  matching_profile_id UUID;
BEGIN
  -- Only proceed if the participant has a playtomic_user_id and name
  IF NEW.playtomic_user_id IS NOT NULL AND NEW.name IS NOT NULL THEN

    -- Find profiles where playtomic_user_id is null and display_name matches (case-insensitive)
    SELECT COUNT(*), MIN(id)
    INTO matching_profiles_count, matching_profile_id
    FROM profiles
    WHERE playtomic_user_id IS NULL
      AND LOWER(display_name) = LOWER(NEW.name);

    -- Only update if exactly one profile is found
    IF matching_profiles_count = 1 THEN
      UPDATE profiles
      SET playtomic_user_id = NEW.playtomic_user_id
      WHERE id = matching_profile_id;

      RAISE NOTICE 'Updated playtomic_user_id for profile % (name: %)', matching_profile_id, NEW.name;
    ELSIF matching_profiles_count > 1 THEN
      RAISE NOTICE 'Multiple profiles found for name %, skipping to avoid ambiguity', NEW.name;
    ELSE
      RAISE NOTICE 'No matching profile found for name %', NEW.name;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run after participant insert
CREATE TRIGGER trigger_auto_fill_playtomic_user_id
AFTER INSERT ON match_participants
FOR EACH ROW
EXECUTE FUNCTION auto_fill_playtomic_user_id();

-- Add comment
COMMENT ON FUNCTION auto_fill_playtomic_user_id() IS
  'Automatically fills playtomic_user_id in profiles when a participant is added to a match, matching by display name';
