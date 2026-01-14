-- =====================================================
-- FIX TP MEMBERS RLS POLICIES
-- =====================================================
-- Allow anon users to insert and update tp_members
-- Similar to match_participants policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to insert tp_members" ON public.tp_members;
DROP POLICY IF EXISTS "Allow authenticated users to update tp_members" ON public.tp_members;

-- Create policy to allow anon to insert
CREATE POLICY "Allow anon to insert tp_members"
ON public.tp_members
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy to allow anon to update
CREATE POLICY "Allow anon to update tp_members"
ON public.tp_members
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.tp_members IS 'Tennis & Padel Vlaanderen members scraped from their website. Anon access allowed for backend scraping.';
