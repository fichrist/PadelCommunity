-- =====================================================
-- CREATE TP MEMBERS TABLE
-- =====================================================
-- Table to store Tennis & Padel Vlaanderen members
-- =====================================================

-- Create tp_members table
CREATE TABLE IF NOT EXISTS public.tp_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  tp_membership_number TEXT,
  tp_user_id INTEGER UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on tp_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_tp_members_tp_user_id ON public.tp_members(tp_user_id);

-- Create index on tp_membership_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_tp_members_tp_membership_number ON public.tp_members(tp_membership_number);

-- Enable RLS
ALTER TABLE public.tp_members ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read
CREATE POLICY "Allow public read access to tp_members"
ON public.tp_members
FOR SELECT
TO public
USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert tp_members"
ON public.tp_members
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update tp_members"
ON public.tp_members
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.tp_members IS 'Tennis & Padel Vlaanderen members scraped from their website';
