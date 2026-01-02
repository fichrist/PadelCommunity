-- Fix RLS policies for profiles table to allow viewing other profiles
-- This restores the ability for authenticated users to view healer profiles

-- Drop if exists and recreate to ensure proper configuration
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;

-- Add back the public view policy for authenticated users
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
