-- =====================================================
-- CHECK AND FIX ALL STREET TRIGGERS
-- =====================================================
-- This migration finds and fixes all triggers that reference 'street'
-- =====================================================

-- Drop specific custom triggers only (not constraint triggers)
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
DROP TRIGGER IF EXISTS sync_profile_to_auth ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_change ON public.profiles;

-- Drop ALL functions that might reference street
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.sync_profile_changes() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Recreate handle_new_user function (for new user signups)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Don't sync back to auth.users - we don't need that
-- The profile is the source of truth

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile record when a new user signs up';
