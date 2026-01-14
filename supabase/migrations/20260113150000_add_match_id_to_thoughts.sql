-- =====================================================
-- ADD MATCH_ID TO THOUGHTS TABLE
-- =====================================================
-- This migration adds match_id to the thoughts table to allow
-- thoughts to be associated with matches
-- =====================================================

-- Add match_id column to thoughts (nullable since thoughts can be for posts OR matches)
ALTER TABLE public.thoughts
ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE;

-- Make post_id nullable since a thought can now be for a match instead
ALTER TABLE public.thoughts
ALTER COLUMN post_id DROP NOT NULL;

-- Add constraint to ensure a thought has either a post_id or match_id (but not both required)
ALTER TABLE public.thoughts
ADD CONSTRAINT thoughts_post_or_match_check
CHECK (post_id IS NOT NULL OR match_id IS NOT NULL);

-- Create index for match_id for better query performance
CREATE INDEX IF NOT EXISTS thoughts_match_id_idx ON public.thoughts(match_id);
