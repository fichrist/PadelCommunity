-- =====================================================
-- ALLOW PUBLIC (ANONYMOUS) USERS TO VIEW MATCHES
-- =====================================================
-- This migration adds a policy to allow unauthenticated users
-- to view matches (read-only access)
-- =====================================================

-- Policy: Anyone can view all matches (including anonymous users)
CREATE POLICY "Anyone can view all matches"
ON public.matches
FOR SELECT
TO anon
USING (true);

-- Also allow anonymous users to view match_participants
CREATE POLICY "Anyone can view match participants"
ON public.match_participants
FOR SELECT
TO anon
USING (true);
