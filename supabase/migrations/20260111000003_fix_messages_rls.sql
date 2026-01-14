-- Fix RLS policies for messages table

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can create messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;
DROP POLICY IF EXISTS "Users can delete messages" ON messages;

-- Allow authenticated users to view all messages (we control access via conversation_participants)
CREATE POLICY "Users can view messages"
  ON messages FOR SELECT
  USING (true);

-- Allow authenticated users to create messages
CREATE POLICY "Users can create messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND sender_id = auth.uid());

-- Allow users to update their own messages
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Allow users to delete their own messages
CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (sender_id = auth.uid());
