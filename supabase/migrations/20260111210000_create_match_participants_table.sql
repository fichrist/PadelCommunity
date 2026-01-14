-- =====================================================
-- MATCH PARTICIPANTS TABLE MIGRATION
-- =====================================================
-- This migration creates a table to store participants in matches
-- =====================================================

-- Create match_participants table
CREATE TABLE IF NOT EXISTS public.match_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Reference to match
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,

  -- Participant info from Playtomic
  playtomic_user_id TEXT,
  name TEXT NOT NULL,
  team_id TEXT,
  gender TEXT,
  level_value DECIMAL(4,2),
  level_confidence DECIMAL(3,2),

  -- Payment info
  price TEXT,
  payment_status TEXT,
  registration_date TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all match participants
CREATE POLICY "Authenticated users can view all match participants"
ON public.match_participants
FOR SELECT
TO authenticated
USING (true);

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

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_match_participants_match_id ON public.match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_playtomic_user_id ON public.match_participants(playtomic_user_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_created_at ON public.match_participants(created_at DESC);

-- =====================================================
-- AUTOMATIC TIMESTAMP UPDATE TRIGGER
-- =====================================================

-- Trigger for automatic timestamp updates (reuse existing function)
CREATE TRIGGER update_match_participants_updated_at
BEFORE UPDATE ON public.match_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
