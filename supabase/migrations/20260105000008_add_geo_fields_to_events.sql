-- Add geo fields to events table to match profiles

ALTER TABLE events
ADD COLUMN IF NOT EXISTS place_id TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS formatted_address TEXT;

-- Create index for geographical queries
CREATE INDEX IF NOT EXISTS idx_events_coordinates ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_place_id ON events(place_id);
