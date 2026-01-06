-- Add place_id, latitude, and longitude to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS place_id TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Create index for geographical queries
CREATE INDEX IF NOT EXISTS idx_profiles_coordinates ON profiles(latitude, longitude);
