-- Rename street column to street_name in events table to match profiles naming

ALTER TABLE events
RENAME COLUMN street TO street_name;
