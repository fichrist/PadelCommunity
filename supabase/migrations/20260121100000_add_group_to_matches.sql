-- Add group_id column to matches table to associate matches with groups

-- Step 1: Add group_id column (nullable initially)
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id);

-- Step 2: Create index on group_id for faster queries
CREATE INDEX IF NOT EXISTS idx_matches_group_id ON public.matches(group_id);

-- Step 3: Add comment
COMMENT ON COLUMN public.matches.group_id IS 'Optional reference to the group this match belongs to';
