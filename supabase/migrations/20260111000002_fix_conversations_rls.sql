-- Fix RLS policies for conversations table to allow creating conversations

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations" ON conversations;

-- Allow authenticated users to view all conversations (we control access via conversation_participants)
CREATE POLICY "Users can view conversations"
  ON conversations FOR SELECT
  USING (true);

-- Allow authenticated users to create conversations
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update conversations (for updating timestamps, names, etc.)
CREATE POLICY "Users can update conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
