-- =====================================================
-- ADD PROFILE_ID TO MATCH_PARTICIPANTS
-- =====================================================
-- This migration adds profile_id to match_participants to track
-- users who block/reserve spots in matches
-- =====================================================

-- Add profile_id column to match_participants
ALTER TABLE public.match_participants
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_match_participants_profile_id ON public.match_participants(profile_id);

-- =====================================================
-- UPDATE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Match creators can insert participants" ON public.match_participants;
DROP POLICY IF EXISTS "Match creators can update participants" ON public.match_participants;
DROP POLICY IF EXISTS "Match creators can delete participants" ON public.match_participants;

-- Policy: Match creators can insert participants for their matches
CREATE POLICY "Match creators can insert participants"
ON public.match_participants
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = match_id
    AND matches.created_by = auth.uid()
  )
);

-- Policy: Users can block a spot for themselves
CREATE POLICY "Users can block spots for themselves"
ON public.match_participants
FOR INSERT
TO authenticated
WITH CHECK (profile_id = auth.uid());

-- Policy: Match creators can update participants for their matches
CREATE POLICY "Match creators can update participants"
ON public.match_participants
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = match_id
    AND matches.created_by = auth.uid()
  )
);

-- Policy: Users can update their own blocked spots
CREATE POLICY "Users can update their own blocked spots"
ON public.match_participants
FOR UPDATE
TO authenticated
USING (profile_id = auth.uid());

-- Policy: Match creators can delete participants for their matches
CREATE POLICY "Match creators can delete participants"
ON public.match_participants
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = match_id
    AND matches.created_by = auth.uid()
  )
);

-- Policy: Users can delete their own blocked spots
CREATE POLICY "Users can delete their own blocked spots"
ON public.match_participants
FOR DELETE
TO authenticated
USING (profile_id = auth.uid());

-- Policy: Users can add generic spot reservations
CREATE POLICY "Users can add generic spot reservations"
ON public.match_participants
FOR INSERT
TO authenticated
WITH CHECK (
  profile_id IS NULL
  AND playtomic_user_id IS NULL
  AND name = 'Spot reserved'
);
