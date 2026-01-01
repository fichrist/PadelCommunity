-- Add parent_thought_id column to thoughts table for replies
ALTER TABLE public.thoughts ADD COLUMN IF NOT EXISTS parent_thought_id UUID REFERENCES public.thoughts(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_thoughts_parent_thought_id ON public.thoughts(parent_thought_id);
