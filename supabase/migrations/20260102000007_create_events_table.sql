-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    full_description TEXT,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    date_to TEXT,
    time TEXT,
    prices JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    additional_options JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
-- Anyone can view events
CREATE POLICY "Events are viewable by everyone"
    ON public.events FOR SELECT
    USING (true);

-- Users can insert their own events
CREATE POLICY "Users can insert their own events"
    ON public.events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
CREATE POLICY "Users can update their own events"
    ON public.events FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own events
CREATE POLICY "Users can delete their own events"
    ON public.events FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
