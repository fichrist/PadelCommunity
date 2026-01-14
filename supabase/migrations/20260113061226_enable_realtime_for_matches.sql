-- =====================================================
-- ENABLE REALTIME FOR MATCHES AND PARTICIPANTS
-- =====================================================
-- This migration enables real-time subscriptions for
-- matches and match_participants tables
-- =====================================================

-- Enable realtime for matches table
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Enable realtime for match_participants table
ALTER PUBLICATION supabase_realtime ADD TABLE match_participants;
