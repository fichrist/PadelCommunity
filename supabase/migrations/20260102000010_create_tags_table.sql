-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL, -- 'specialty', 'event', 'general', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read tags
CREATE POLICY "Allow public read access to tags" ON public.tags
    FOR SELECT
    USING (true);

-- Create policy to allow authenticated users to insert tags (for future admin functionality)
CREATE POLICY "Allow authenticated users to insert tags" ON public.tags
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Insert specialty tags (from healer profile specialties)
INSERT INTO public.tags (name, category) VALUES
    ('Sound Healing', 'specialty'),
    ('Crystal Healing', 'specialty'),
    ('Energy Work', 'specialty'),
    ('Reiki', 'specialty'),
    ('Chakra Balancing', 'specialty'),
    ('Meditation', 'specialty'),
    ('Yoga', 'specialty'),
    ('Breathwork', 'specialty'),
    ('Shamanic Healing', 'specialty'),
    ('Acupuncture', 'specialty'),
    ('Herbalism', 'specialty'),
    ('Tarot Reading', 'specialty'),
    ('Astrology', 'specialty'),
    ('Numerology', 'specialty'),
    ('Sacred Geometry', 'specialty'),
    ('Light Language', 'specialty'),
    ('Past Life Regression', 'specialty'),
    ('Quantum Healing', 'specialty'),
    ('Intuitive Healing', 'specialty'),
    ('Animal Communication', 'specialty')
ON CONFLICT (name) DO NOTHING;

-- Insert event tags
INSERT INTO public.tags (name, category) VALUES
    ('Movement', 'event'),
    ('Dance', 'event'),
    ('Exhibition', 'event'),
    ('Festival', 'event'),
    ('Garden', 'event'),
    ('Workshop', 'event'),
    ('Education', 'event'),
    ('Sound Bath', 'event'),
    ('Chakras', 'event'),
    ('Ceremony', 'event'),
    ('Full Moon', 'event'),
    ('Morning Practice', 'event'),
    ('Nature', 'event'),
    ('Walking', 'event'),
    ('Mindfulness', 'event')
ON CONFLICT (name) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS tags_category_idx ON public.tags(category);
CREATE INDEX IF NOT EXISTS tags_name_idx ON public.tags(name);
