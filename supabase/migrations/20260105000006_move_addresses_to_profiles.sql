-- Move all address fields to profiles table and drop addresses table

-- Step 1: Add address fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS street_name TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS formatted_address TEXT;

-- Step 2: Migrate data from addresses to profiles
UPDATE profiles p
SET 
  street_name = a.street_name,
  city = a.city,
  postal_code = a.postal_code,
  country = a.country,
  formatted_address = a.formatted_address
FROM addresses a
WHERE p.address_id = a.id;

-- Step 3: Drop the addresses table entirely (CASCADE will drop policies)
DROP TABLE IF EXISTS addresses CASCADE;

-- Step 4: Now drop the address_id column from profiles
ALTER TABLE profiles
DROP COLUMN IF EXISTS address_id;

-- Step 5: Create indexes for new location fields
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
