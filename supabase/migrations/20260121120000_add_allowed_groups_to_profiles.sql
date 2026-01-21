-- Add allowed_groups column to profiles table
-- This column stores the group IDs that the user is allowed to see/access

ALTER TABLE profiles
ADD COLUMN allowed_groups uuid[] DEFAULT '{}';

-- Add a comment to explain the column
COMMENT ON COLUMN profiles.allowed_groups IS 'Array of group IDs that the user is allowed to see and access';
