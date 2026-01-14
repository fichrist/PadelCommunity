-- Add foreign key relationships for conversation_participants table

-- Add foreign key to profiles table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'conversation_participants_user_id_fkey'
  ) THEN
    ALTER TABLE conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key to conversations table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'conversation_participants_conversation_id_fkey'
  ) THEN
    ALTER TABLE conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey
    FOREIGN KEY (conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key to messages table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'messages_sender_id_fkey'
  ) THEN
    ALTER TABLE messages
    ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'messages_conversation_id_fkey'
  ) THEN
    ALTER TABLE messages
    ADD CONSTRAINT messages_conversation_id_fkey
    FOREIGN KEY (conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE;
  END IF;
END $$;
