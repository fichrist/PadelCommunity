-- Add event_id column to thoughts table
ALTER TABLE thoughts ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Make post_id nullable since thoughts can now be linked to either posts OR events
ALTER TABLE thoughts ALTER COLUMN post_id DROP NOT NULL;

-- Add constraint to ensure thought is linked to either a post OR an event (but not both)
ALTER TABLE thoughts ADD CONSTRAINT thought_link_check 
  CHECK (
    (post_id IS NOT NULL AND event_id IS NULL) OR 
    (post_id IS NULL AND event_id IS NOT NULL)
  );

-- Add index for event_id for better query performance
CREATE INDEX idx_thoughts_event_id ON thoughts(event_id);

-- Update RLS policies to include event_id
DROP POLICY IF EXISTS "Users can view all thoughts" ON thoughts;
CREATE POLICY "Users can view all thoughts"
  ON thoughts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create thoughts" ON thoughts;
CREATE POLICY "Users can create thoughts"
  ON thoughts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own thoughts" ON thoughts;
CREATE POLICY "Users can update own thoughts"
  ON thoughts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own thoughts" ON thoughts;
CREATE POLICY "Users can delete own thoughts"
  ON thoughts FOR DELETE
  USING (auth.uid() = user_id);
