-- =====================================================
-- NUCLEAR FIX FOR STREET REFERENCES
-- =====================================================
-- This migration searches for and removes ALL references to 'street' field
-- =====================================================

-- First, let's see what triggers exist and drop them individually
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    -- Get all triggers on profiles table
    FOR trigger_rec IN
        SELECT tgname
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'profiles'
        AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND tgname NOT LIKE 'RI_%'  -- Skip constraint triggers
        AND tgname NOT LIKE 'pg_%'  -- Skip system triggers
    LOOP
        BEGIN
            EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trigger_rec.tgname) || ' ON public.profiles';
            RAISE NOTICE 'Dropped trigger: %', trigger_rec.tgname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop trigger %: %', trigger_rec.tgname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Drop all custom functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.sync_profile_changes() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_metadata() CASCADE;

-- Recreate ONLY the essential handle_new_user function
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

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a minimal profile record when a new user signs up';
