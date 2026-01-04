-- Add healer_profile_id column to thoughts table (references auth.users for user profiles)
ALTER TABLE thoughts ADD COLUMN healer_profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the existing constraint that only allowed post_id OR event_id
ALTER TABLE thoughts DROP CONSTRAINT IF EXISTS thought_link_check;

-- Add new constraint to ensure thought is linked to either a post, an event, OR a healer profile (but only one)
ALTER TABLE thoughts ADD CONSTRAINT thought_link_check 
  CHECK (
    (post_id IS NOT NULL AND event_id IS NULL AND healer_profile_id IS NULL) OR 
    (post_id IS NULL AND event_id IS NOT NULL AND healer_profile_id IS NULL) OR
    (post_id IS NULL AND event_id IS NULL AND healer_profile_id IS NOT NULL)
  );

-- Add index for healer_profile_id for better query performance
CREATE INDEX idx_thoughts_healer_profile_id ON thoughts(healer_profile_id);
