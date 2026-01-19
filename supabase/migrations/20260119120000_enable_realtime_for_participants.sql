-- =====================================================
-- ENABLE REALTIME FOR MATCH_PARTICIPANTS
-- =====================================================
-- This migration ensures that real-time subscriptions work
-- properly for all events including DELETE on match_participants
-- =====================================================

-- Enable replica identity for match_participants to support DELETE events in real-time
-- FULL means all columns are included in the replication, which allows subscribers
-- to see the old values when a row is deleted
ALTER TABLE public.match_participants REPLICA IDENTITY FULL;

-- Note: match_participants is already in supabase_realtime publication

-- Add comment
COMMENT ON TABLE public.match_participants IS
'Match participants table with full replica identity for real-time DELETE support';
