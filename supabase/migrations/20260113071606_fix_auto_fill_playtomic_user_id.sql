-- =====================================================
-- FIX AUTO-FILL PLAYTOMIC USER ID FUNCTION
-- =====================================================
-- Fix the function to avoid MIN() on UUID type
-- =====================================================

-- Drop and recreate the function with correct logic
CREATE OR REPLACE FUNCTION auto_fill_playtomic_user_id()
RETURNS TRIGGER AS $$
DECLARE
  matching_profile RECORD;
  matching_count INTEGER;
BEGIN
  -- Only proceed if the participant has a playtomic_user_id and name
  IF NEW.playtomic_user_id IS NOT NULL AND NEW.name IS NOT NULL THEN

    -- Count matching profiles
    SELECT COUNT(*)
    INTO matching_count
    FROM profiles
    WHERE playtomic_user_id IS NULL
      AND LOWER(display_name) = LOWER(NEW.name);

    -- Only update if exactly one profile is found
    IF matching_count = 1 THEN
      -- Get the matching profile
      SELECT id INTO matching_profile
      FROM profiles
      WHERE playtomic_user_id IS NULL
        AND LOWER(display_name) = LOWER(NEW.name)
      LIMIT 1;

      -- Update the profile
      UPDATE profiles
      SET playtomic_user_id = NEW.playtomic_user_id
      WHERE id = matching_profile.id;

      RAISE NOTICE 'Updated playtomic_user_id for profile % (name: %)', matching_profile.id, NEW.name;
    ELSIF matching_count > 1 THEN
      RAISE NOTICE 'Multiple profiles found for name %, skipping to avoid ambiguity', NEW.name;
    ELSE
      RAISE NOTICE 'No matching profile found for name %', NEW.name;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
