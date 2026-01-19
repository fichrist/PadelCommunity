-- =====================================================
-- ADD PLAYER_PROFILE_ID TO MATCH_PARTICIPANTS
-- =====================================================
-- This migration adds a player_profile_id field to match_participants
-- to link participants to their profiles based on playtomic_user_id
-- =====================================================

-- Add player_profile_id column to match_participants
ALTER TABLE public.match_participants
ADD COLUMN IF NOT EXISTS player_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS match_participants_player_profile_id_idx
ON public.match_participants(player_profile_id);

-- Add comment to explain the column
COMMENT ON COLUMN public.match_participants.player_profile_id IS
'References the profile of the player participating in the match, linked via playtomic_user_id';
