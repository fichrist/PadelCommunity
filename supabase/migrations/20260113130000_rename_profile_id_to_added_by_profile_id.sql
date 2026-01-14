-- =====================================================
-- RENAME PROFILE_ID TO ADDED_BY_PROFILE_ID
-- =====================================================
-- This migration renames profile_id to added_by_profile_id
-- to better reflect that it tracks which user added the participant
-- =====================================================

-- Drop all existing policies that reference profile_id from previous migration
DROP POLICY IF EXISTS "Match creators can insert participants" ON public.match_participants;
DROP POLICY IF EXISTS "Users can block spots for themselves" ON public.match_participants;
DROP POLICY IF EXISTS "Match creators can update participants" ON public.match_participants;
DROP POLICY IF EXISTS "Users can update their own blocked spots" ON public.match_participants;
DROP POLICY IF EXISTS "Match creators can delete participants" ON public.match_participants;
DROP POLICY IF EXISTS "Users can delete their own blocked spots" ON public.match_participants;
DROP POLICY IF EXISTS "Users can add generic spot reservations" ON public.match_participants;

-- Rename the column
ALTER TABLE public.match_participants
RENAME COLUMN profile_id TO added_by_profile_id;

-- Recreate policies with new column name

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

-- Policy: Users can add participants they create (generic spot reservations)
CREATE POLICY "Users can add participants they create"
ON public.match_participants
FOR INSERT
TO authenticated
WITH CHECK (added_by_profile_id = auth.uid());

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

-- Policy: Users can update participants they added
CREATE POLICY "Users can update participants they added"
ON public.match_participants
FOR UPDATE
TO authenticated
USING (added_by_profile_id = auth.uid());

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

-- Policy: Users can delete participants they added
CREATE POLICY "Users can delete participants they added"
ON public.match_participants
FOR DELETE
TO authenticated
USING (added_by_profile_id = auth.uid());
