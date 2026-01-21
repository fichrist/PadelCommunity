-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_type TEXT NOT NULL CHECK (group_type IN ('General', 'Ranked')),
  ranking_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint: ranking_level should be null for General groups, and required for Ranked groups
ALTER TABLE public.groups
ADD CONSTRAINT check_ranking_level
CHECK (
  (group_type = 'General' AND ranking_level IS NULL) OR
  (group_type = 'Ranked' AND ranking_level IS NOT NULL)
);

-- Create index on group_type for faster queries
CREATE INDEX IF NOT EXISTS idx_groups_group_type ON public.groups(group_type);

-- Create index on ranking_level for faster queries
CREATE INDEX IF NOT EXISTS idx_groups_ranking_level ON public.groups(ranking_level);

-- Insert initial data: one general group
INSERT INTO public.groups (name, group_type, ranking_level) VALUES
  ('General Community', 'General', NULL);

-- Insert ranked groups for each ranking level
INSERT INTO public.groups (name, group_type, ranking_level) VALUES
  ('P50-P100', 'Ranked', 'p50-p100'),
  ('P100-P200', 'Ranked', 'p100-p200'),
  ('P200-P300', 'Ranked', 'p200-p300'),
  ('P300-P400', 'Ranked', 'p300-p400'),
  ('P400-P500', 'Ranked', 'p400-p500'),
  ('P500-P700', 'Ranked', 'p500-p700'),
  ('P700-P1000', 'Ranked', 'p700-p1000'),
  ('P1000+', 'Ranked', 'p1000+');

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create policy: Everyone can read groups
CREATE POLICY "Groups are viewable by everyone"
  ON public.groups
  FOR SELECT
  USING (true);

-- Create policy: Only authenticated users can insert/update/delete groups (for future admin features)
CREATE POLICY "Only authenticated users can modify groups"
  ON public.groups
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Add comment to table
COMMENT ON TABLE public.groups IS 'Groups for organizing users by ranking levels or general community';
COMMENT ON COLUMN public.groups.group_type IS 'Type of group: General or Ranked';
COMMENT ON COLUMN public.groups.ranking_level IS 'Ranking level for Ranked groups (e.g., p300-p400), NULL for General groups';
