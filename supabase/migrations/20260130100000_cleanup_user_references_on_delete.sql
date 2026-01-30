-- Trigger function: clean up user ID from array fields when a user is deleted
CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove from blocked_users on all profiles
  UPDATE public.profiles
  SET blocked_users = array_remove(blocked_users, OLD.id)
  WHERE blocked_users @> ARRAY[OLD.id];

  -- Remove from favorite_users on all profiles
  UPDATE public.profiles
  SET favorite_users = array_remove(favorite_users, OLD.id)
  WHERE favorite_users @> ARRAY[OLD.id];

  -- Remove from restricted_users on all matches
  UPDATE public.matches
  SET restricted_users = array_remove(restricted_users, OLD.id)
  WHERE restricted_users @> ARRAY[OLD.id];

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users BEFORE DELETE
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deleted();
