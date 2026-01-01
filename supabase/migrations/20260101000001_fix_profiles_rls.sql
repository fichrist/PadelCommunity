-- Fix RLS policies for profiles table to improve performance
-- Replace auth.uid() with (select auth.uid()) to avoid re-evaluation for each row

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING ((select auth.uid()) = id);
