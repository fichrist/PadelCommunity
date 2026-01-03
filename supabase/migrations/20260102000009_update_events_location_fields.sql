-- Add separate location fields to events table
ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT;

-- Migrate existing location data to city field
UPDATE events 
SET city = location 
WHERE location IS NOT NULL AND city IS NULL;

-- Drop the old location column (after data migration)
ALTER TABLE events DROP COLUMN IF EXISTS location;
