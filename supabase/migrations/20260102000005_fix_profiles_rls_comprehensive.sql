-- Comprehensive fix for profiles RLS policies
-- This replaces all previous SELECT policies with a single comprehensive one

-- Drop all existing SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a single comprehensive SELECT policy that allows:
-- 1. Users to view their own profile
-- 2. Authenticated users to view all profiles
-- 3. Anonymous users to view all profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Keep the existing INSERT and UPDATE policies as they are
-- (These were not causing issues)
