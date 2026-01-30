-- =====================================================
-- ALLOW RESTRICTED USERS TO UPDATE MATCHES
-- =====================================================
-- Updates the RLS policy so that users listed in the
-- restricted_users array can also update the match,
-- not just the organizer (created_by).
-- =====================================================

-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update their own matches" ON public.matches;

-- Recreate with broader access: organizer OR restricted user
CREATE POLICY "Users can update their own matches"
  ON public.matches
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR auth.uid() = ANY(restricted_users)
  );
