-- Add message column to matches table

-- Step 1: Add message column (nullable, text)
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS message TEXT;

-- Step 2: Add comment
COMMENT ON COLUMN public.matches.message IS 'Optional message/description from the match creator';
