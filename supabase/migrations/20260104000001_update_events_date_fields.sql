-- Add new date columns as DATE type
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date DATE;

-- Migrate existing data from old text fields to new date fields
UPDATE events 
SET start_date = CASE 
    WHEN date IS NOT NULL AND date != '' THEN date::DATE 
    ELSE NULL 
END
WHERE date IS NOT NULL;

UPDATE events 
SET end_date = CASE 
    WHEN date_to IS NOT NULL AND date_to != '' THEN date_to::DATE 
    ELSE NULL 
END
WHERE date_to IS NOT NULL;

-- Drop old text-based date columns
ALTER TABLE events DROP COLUMN IF EXISTS date;
ALTER TABLE events DROP COLUMN IF EXISTS date_to;

-- Make start_date required (NOT NULL)
ALTER TABLE events ALTER COLUMN start_date SET NOT NULL;

-- Update indexes
DROP INDEX IF EXISTS idx_events_date;
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);
