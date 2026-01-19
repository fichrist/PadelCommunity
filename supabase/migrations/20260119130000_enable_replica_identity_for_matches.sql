-- =====================================================
-- ENABLE REPLICA IDENTITY FOR MATCHES
-- =====================================================
-- This migration ensures that real-time subscriptions work
-- properly for all events including DELETE on matches
-- =====================================================

-- Enable replica identity for matches to support DELETE events in real-time
-- FULL means all columns are included in the replication, which allows subscribers
-- to see the old values when a row is deleted
ALTER TABLE public.matches REPLICA IDENTITY FULL;

-- Note: matches is already in supabase_realtime publication

-- Add comment
COMMENT ON TABLE public.matches IS
'Matches table with full replica identity for real-time DELETE support';
