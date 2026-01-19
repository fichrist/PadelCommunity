-- =====================================================
-- CREATE NOTIFICATION MATCH FILTERS TABLE
-- =====================================================
-- This table stores user preferences for match notifications
-- Users can set filters for location, date range, and ranking levels
-- =====================================================

-- Create notification_match_filters table
CREATE TABLE IF NOT EXISTS public.notification_match_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Location filters
  location_enabled BOOLEAN DEFAULT true,
  location_address TEXT,
  location_latitude DOUBLE PRECISION,
  location_longitude DOUBLE PRECISION,
  location_radius_km INTEGER DEFAULT 50,

  -- Date filters
  date_enabled BOOLEAN DEFAULT true,
  date_range TEXT DEFAULT 'next-3-weeks', -- 'today', 'tomorrow', 'next-week', 'next-3-weeks', 'custom'
  date_from TIMESTAMPTZ,
  date_to TIMESTAMPTZ,

  -- Ranking/Level filters
  ranking_enabled BOOLEAN DEFAULT true,
  ranking_levels TEXT[], -- Array of ranking levels like ['p400-p500', 'p500-p700']

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one filter per user
  CONSTRAINT unique_user_filter UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.notification_match_filters ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own filters
CREATE POLICY "Users can read own notification filters"
ON public.notification_match_filters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own filters
CREATE POLICY "Users can insert own notification filters"
ON public.notification_match_filters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own filters
CREATE POLICY "Users can update own notification filters"
ON public.notification_match_filters
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own filters
CREATE POLICY "Users can delete own notification filters"
ON public.notification_match_filters
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS notification_match_filters_user_id_idx
ON public.notification_match_filters(user_id);

-- Add comment
COMMENT ON TABLE public.notification_match_filters IS
'Stores user preferences for match notifications including location, date, and ranking filters';
