-- Create message_reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);

-- Enable Row Level Security
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_reactions
-- Users can view reactions on messages they can see
CREATE POLICY "Users can view reactions on accessible messages"
  ON message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN conversation_participants ON messages.conversation_id = conversation_participants.conversation_id
      WHERE messages.id = message_reactions.message_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Users can add reactions to messages in their conversations
CREATE POLICY "Users can add reactions to accessible messages"
  ON message_reactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM messages
      JOIN conversation_participants ON messages.conversation_id = conversation_participants.conversation_id
      WHERE messages.id = message_reactions.message_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions"
  ON message_reactions FOR DELETE
  USING (user_id = auth.uid());

-- Enable realtime for message_reactions table
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
