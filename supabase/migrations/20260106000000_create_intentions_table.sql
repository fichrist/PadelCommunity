-- Create intentions table
CREATE TABLE IF NOT EXISTS public.intentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.intentions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read intentions
CREATE POLICY "Allow public read access to intentions" ON public.intentions
  FOR SELECT
  USING (true);

-- Insert sample intentions data
INSERT INTO public.intentions (name, description) VALUES
  ('Healing', 'Seeking physical, emotional, or spiritual healing'),
  ('Peace', 'Finding inner peace and tranquility'),
  ('Love', 'Opening heart to give and receive love'),
  ('Abundance', 'Attracting prosperity and abundance'),
  ('Clarity', 'Gaining mental clarity and insight'),
  ('Balance', 'Finding balance in life'),
  ('Growth', 'Personal and spiritual growth'),
  ('Gratitude', 'Cultivating thankfulness and appreciation'),
  ('Protection', 'Seeking spiritual protection'),
  ('Connection', 'Connecting with higher self or divine'),
  ('Transformation', 'Personal transformation and change'),
  ('Forgiveness', 'Letting go and forgiving'),
  ('Joy', 'Embracing happiness and joy'),
  ('Strength', 'Building inner strength and resilience'),
  ('Wisdom', 'Seeking wisdom and understanding'),
  ('Creativity', 'Unleashing creative potential'),
  ('Grounding', 'Staying grounded and present'),
  ('Release', 'Releasing negative energy or patterns'),
  ('Manifestation', 'Manifesting desires and goals'),
  ('Compassion', 'Developing compassion for self and others');

-- Create index for faster lookups
CREATE INDEX idx_intentions_name ON public.intentions(name);
