-- =====================================================
-- MATCHES TABLE MIGRATION
-- =====================================================
-- This migration creates a matches table to store padel matches
-- with URL for future data fetching
-- =====================================================

-- Create match_level enum type
CREATE TYPE match_level AS ENUM ('beginner', 'intermediate', 'advanced', 'professional');

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Match URL for data fetching
  url TEXT NOT NULL,

  -- Match level
  match_level match_level NOT NULL,

  -- Future fields (to be populated later via URL scraping)
  match_date TIMESTAMP WITH TIME ZONE,
  match_time TIME,
  location TEXT,
  venue_name TEXT,

  -- Creator reference
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all matches
CREATE POLICY "Authenticated users can view all matches"
ON public.matches
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can create their own matches
CREATE POLICY "Users can create their own matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update their own matches
CREATE POLICY "Users can update their own matches"
ON public.matches
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Policy: Users can delete their own matches
CREATE POLICY "Users can delete their own matches"
ON public.matches
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_matches_created_by ON public.matches(created_by);
CREATE INDEX IF NOT EXISTS idx_matches_match_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_match_level ON public.matches(match_level);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.matches(created_at DESC);

-- =====================================================
-- AUTOMATIC TIMESTAMP UPDATE TRIGGER
-- =====================================================

-- Trigger for automatic timestamp updates (reuse existing function)
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
