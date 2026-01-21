-- Add filtered_groups and filtered location columns to profiles table
-- These columns store the user's filter preferences for the community page

ALTER TABLE profiles
ADD COLUMN filtered_groups uuid[] DEFAULT '{}',
ADD COLUMN filtered_address text,
ADD COLUMN filtered_latitude double precision,
ADD COLUMN filtered_longitude double precision,
ADD COLUMN filtered_radius_km integer DEFAULT 30;

-- Add comments to explain the columns
COMMENT ON COLUMN profiles.filtered_groups IS 'Array of group IDs that the user wants to filter by on the community page';
COMMENT ON COLUMN profiles.filtered_address IS 'Address used for location filtering on the community page';
COMMENT ON COLUMN profiles.filtered_latitude IS 'Latitude coordinate for location filtering';
COMMENT ON COLUMN profiles.filtered_longitude IS 'Longitude coordinate for location filtering';
COMMENT ON COLUMN profiles.filtered_radius_km IS 'Radius in kilometers for location filtering';
