-- RPC function to allow a user to delete their own account
-- This deletes from auth.users, which cascades to profiles and triggers
-- handle_user_deleted() to clean up array references
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void AS $$
BEGIN
  -- Delete the auth user (cascades to profiles, matches, notifications, etc.)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
