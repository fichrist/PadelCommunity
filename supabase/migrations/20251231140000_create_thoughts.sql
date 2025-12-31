-- Create thoughts table
CREATE TABLE IF NOT EXISTS public.thoughts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all thoughts
CREATE POLICY "Thoughts are viewable by everyone"
    ON public.thoughts FOR SELECT
    USING (true);

-- Policy: Users can insert their own thoughts
CREATE POLICY "Users can insert their own thoughts"
    ON public.thoughts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own thoughts
CREATE POLICY "Users can update their own thoughts"
    ON public.thoughts FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own thoughts
CREATE POLICY "Users can delete their own thoughts"
    ON public.thoughts FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX thoughts_post_id_idx ON public.thoughts(post_id);
CREATE INDEX thoughts_user_id_idx ON public.thoughts(user_id);
CREATE INDEX thoughts_created_at_idx ON public.thoughts(created_at DESC);

-- Create updated_at trigger
CREATE TRIGGER set_thoughts_updated_at
    BEFORE UPDATE ON public.thoughts
    FOR EACH ROW
