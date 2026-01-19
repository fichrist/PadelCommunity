-- =====================================================
-- ADD INSERT POLICY FOR NOTIFICATIONS
-- =====================================================
-- Allow authenticated users to create notifications for any user
-- This is needed for the match notification feature where
-- a user creating a match can notify other users
-- =====================================================

CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add comment
COMMENT ON POLICY "Authenticated users can insert notifications" ON public.notifications IS
'Allows authenticated users to create notifications for any user - needed for match notifications';
