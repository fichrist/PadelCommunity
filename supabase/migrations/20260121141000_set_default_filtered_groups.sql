-- Function to automatically set all groups in filtered_groups for new profiles
CREATE OR REPLACE FUNCTION set_default_filtered_groups()
RETURNS TRIGGER AS $$
BEGIN
  -- Get all group IDs and set them as the default filtered_groups
  NEW.filtered_groups := ARRAY(SELECT id FROM groups);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set default filtered_groups on profile creation
CREATE TRIGGER set_default_filtered_groups_trigger
BEFORE INSERT ON profiles
FOR EACH ROW
WHEN (NEW.filtered_groups IS NULL OR NEW.filtered_groups = '{}')
EXECUTE FUNCTION set_default_filtered_groups();

-- Update existing profiles that don't have filtered_groups set
UPDATE profiles
SET filtered_groups = ARRAY(SELECT id FROM groups)
WHERE filtered_groups IS NULL OR filtered_groups = '{}';
