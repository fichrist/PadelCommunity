-- =====================================================
-- CHANGE MATCH LEVEL TO ARRAY MIGRATION
-- =====================================================
-- This migration changes match_level from a single enum
-- to an array of enums to support multiple skill levels
-- =====================================================

-- Step 1: Add new column for multiple levels
ALTER TABLE public.matches ADD COLUMN match_levels match_level[];

-- Step 2: Migrate existing data from match_level to match_levels
UPDATE public.matches
SET match_levels = ARRAY[match_level]::match_level[]
WHERE match_level IS NOT NULL;

-- Step 3: Drop the old match_level column
ALTER TABLE public.matches DROP COLUMN match_level;

-- Step 4: Drop the old index
DROP INDEX IF EXISTS idx_matches_match_level;

-- Step 5: Create new index for array queries
CREATE INDEX IF NOT EXISTS idx_matches_match_levels ON public.matches USING GIN(match_levels);

-- Add comment
COMMENT ON COLUMN public.matches.match_levels IS 'Array of skill levels allowed for this match (e.g., ["p50-p100", "p100-p200"])';
