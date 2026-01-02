-- Allow public (anonymous) access to view profiles
-- This is needed so that healer profiles can be viewed by anyone, not just authenticated users

-- Add policy for anonymous users to view profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
TO anon
USING (true);
