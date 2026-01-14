-- =====================================================
-- ADD MATCH DETAILS FIELDS MIGRATION
-- =====================================================
-- This migration adds additional fields to store match details
-- fetched from Playtomic URLs
-- =====================================================

-- Add new columns to matches table
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS duration INTEGER, -- in minutes
  ADD COLUMN IF NOT EXISTS court_number TEXT,
  ADD COLUMN IF NOT EXISTS price_per_person DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS match_type TEXT, -- friendly, competitive, tournament
  ADD COLUMN IF NOT EXISTS surface_type TEXT, -- indoor, outdoor
  ADD COLUMN IF NOT EXISTS players_registered INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_spots INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS organizer_name TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_matches_city ON public.matches(city);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_location ON public.matches(latitude, longitude);

-- Add comment to table
COMMENT ON TABLE public.matches IS 'Stores padel match information with details fetched from booking URLs';
