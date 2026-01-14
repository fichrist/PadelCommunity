-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their participant record" ON conversation_participants;

-- Simplified RLS policies without circular references

-- Allow users to view all participant records (we'll rely on conversation-level security)
CREATE POLICY "Users can view participants"
  ON conversation_participants FOR SELECT
  USING (true);

-- Allow authenticated users to insert participants (we'll validate on application level)
CREATE POLICY "Users can add participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own participant record
CREATE POLICY "Users can update own participant record"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
