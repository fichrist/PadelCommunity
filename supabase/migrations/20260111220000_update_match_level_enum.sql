-- =====================================================
-- UPDATE MATCH LEVEL ENUM MIGRATION
-- =====================================================
-- This migration updates the match_level enum to use
-- Playtomic ranking system (P50-P1000+)
-- =====================================================

-- Step 1: Add new enum values to match_level type
ALTER TYPE match_level ADD VALUE IF NOT EXISTS 'p50-p100';
ALTER TYPE match_level ADD VALUE IF NOT EXISTS 'p100-p200';
ALTER TYPE match_level ADD VALUE IF NOT EXISTS 'p200-p300';
ALTER TYPE match_level ADD VALUE IF NOT EXISTS 'p300-p400';
ALTER TYPE match_level ADD VALUE IF NOT EXISTS 'p400-p500';
ALTER TYPE match_level ADD VALUE IF NOT EXISTS 'p500-p700';
ALTER TYPE match_level ADD VALUE IF NOT EXISTS 'p700-p1000';
ALTER TYPE match_level ADD VALUE IF NOT EXISTS 'p1000+';

-- Note: PostgreSQL doesn't allow removing enum values easily
-- The old values (beginner, intermediate, advanced, professional) will remain
-- but the UI will only show the new Playtomic ranking options
