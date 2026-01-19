-- =====================================================
-- ALLOW READING ALL NOTIFICATION FILTERS
-- =====================================================
-- Users need to be able to read all filters when creating
-- notifications for a new match, not just their own filter
-- =====================================================

-- Drop the restrictive read policy
DROP POLICY IF EXISTS "Users can read own notification filters" ON public.notification_match_filters;

-- Create a new policy that allows reading all filters
CREATE POLICY "Authenticated users can read all notification filters"
ON public.notification_match_filters
FOR SELECT
TO authenticated
USING (true);

-- Add comment
COMMENT ON POLICY "Authenticated users can read all notification filters" ON public.notification_match_filters IS
'Allows authenticated users to read all notification filters - needed for creating notifications when a match is created';
