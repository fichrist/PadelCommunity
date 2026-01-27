-- =====================================================
-- ALLOW MULTIPLE EMOJI REACTIONS PER USER PER THOUGHT
-- =====================================================
-- Change the UNIQUE constraint from (thought_id, user_id) to
-- (thought_id, user_id, emoji) so that a user can react with
-- multiple different emojis on the same thought.
-- =====================================================

-- Drop the old constraint (one reaction per user per thought)
ALTER TABLE public.thought_reactions
DROP CONSTRAINT IF EXISTS thought_reactions_thought_id_user_id_key;

-- Add the new constraint (one reaction per emoji per user per thought)
ALTER TABLE public.thought_reactions
ADD CONSTRAINT thought_reactions_thought_id_user_id_emoji_key UNIQUE (thought_id, user_id, emoji);
