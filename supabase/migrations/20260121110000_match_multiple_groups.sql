-- Allow matches to belong to multiple groups

-- Step 1: Drop the existing group_id column and its index
DROP INDEX IF EXISTS idx_matches_group_id;
ALTER TABLE public.matches DROP COLUMN IF EXISTS group_id;

-- Step 2: Add group_ids array column
ALTER TABLE public.matches
ADD COLUMN group_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- Step 3: Create GIN index on group_ids for faster array queries
CREATE INDEX idx_matches_group_ids ON public.matches USING GIN(group_ids);

-- Step 4: Add comment
COMMENT ON COLUMN public.matches.group_ids IS 'Array of group IDs this match belongs to';
