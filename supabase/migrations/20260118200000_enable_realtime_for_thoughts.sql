-- =====================================================
-- ENABLE REALTIME FOR THOUGHTS
-- =====================================================
-- This migration enables real-time subscriptions for
-- the thoughts table so users can see new comments in real-time
-- =====================================================

-- Enable realtime for thoughts table
ALTER PUBLICATION supabase_realtime ADD TABLE thoughts;
