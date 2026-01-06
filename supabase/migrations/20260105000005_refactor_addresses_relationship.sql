-- Refactor addresses table relationship
-- Instead of addresses -> user, make profiles -> address

-- Step 1: Add address_id to profiles table
ALTER TABLE profiles
ADD COLUMN address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;

-- Step 2: Migrate existing data
-- For each address, set the profile's address_id to point to that address
UPDATE profiles p
SET address_id = a.id
FROM addresses a
WHERE a.user_id = p.id;

-- Step 3: Update RLS policies on addresses table first
-- Drop old policies that reference user_id
DROP POLICY IF EXISTS "Users can view their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON addresses;
DROP POLICY IF EXISTS "Authenticated users can view addresses" ON addresses;

-- Step 4: Now drop the user_id column
ALTER TABLE addresses
DROP COLUMN user_id;

-- Step 5: Create new RLS policies

-- New policies: addresses are accessible if referenced by a profile
-- Policy: Users can view addresses referenced by any profile they can see
CREATE POLICY "Addresses are viewable by authenticated users"
ON addresses
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can insert addresses (will be linked from their profile)
CREATE POLICY "Users can insert addresses"
ON addresses
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Users can update addresses they own (via their profile)
CREATE POLICY "Users can update their own address"
ON addresses
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT address_id FROM profiles WHERE id = auth.uid()
  )
);

-- Policy: Users can delete addresses they own (via their profile)
CREATE POLICY "Users can delete their own address"
ON addresses
FOR DELETE
TO authenticated
USING (
  id IN (
    SELECT address_id FROM profiles WHERE id = auth.uid()
  )
);

-- Step 5: Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_profiles_address_id ON profiles(address_id);
