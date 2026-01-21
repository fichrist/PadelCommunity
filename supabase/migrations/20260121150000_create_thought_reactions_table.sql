-- Create thought_reactions table
CREATE TABLE IF NOT EXISTS public.thought_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thought_id UUID REFERENCES public.thoughts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Ensure one reaction per user per thought
    UNIQUE(thought_id, user_id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.thought_reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all reactions
CREATE POLICY "Reactions are viewable by everyone"
    ON public.thought_reactions FOR SELECT
    USING (true);

-- Policy: Users can insert their own reactions
CREATE POLICY "Users can insert their own reactions"
    ON public.thought_reactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reactions
CREATE POLICY "Users can update their own reactions"
    ON public.thought_reactions FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions"
    ON public.thought_reactions FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX thought_reactions_thought_id_idx ON public.thought_reactions(thought_id);
CREATE INDEX thought_reactions_user_id_idx ON public.thought_reactions(user_id);
CREATE INDEX thought_reactions_created_at_idx ON public.thought_reactions(created_at DESC);

-- Enable realtime for thought_reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.thought_reactions;
