-- Drop old location fields from profiles table
-- These have been migrated to the addresses table

ALTER TABLE profiles
DROP COLUMN IF EXISTS street,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS postal_code,
DROP COLUMN IF EXISTS country;
