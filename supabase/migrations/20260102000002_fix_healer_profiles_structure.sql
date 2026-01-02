-- Restructure healer_profiles table to use user_id as primary key
-- This makes healer_profiles inherit from profiles properly

-- Drop the existing table and recreate with correct structure
DROP TABLE IF EXISTS public.healer_profiles CASCADE;

-- Create healer_profiles table with user_id as primary key
CREATE TABLE public.healer_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialties TEXT[] DEFAULT '{}',
  bio TEXT,
  full_bio TEXT,
  role TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  name TEXT,
  company TEXT,
  video TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.healer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view healer profiles
CREATE POLICY "Anyone can view healer profiles"
ON public.healer_profiles
FOR SELECT
USING (true);

-- Users can insert their own healer profile
CREATE POLICY "Users can insert their own healer profile"
ON public.healer_profiles
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- Users can update their own healer profile
CREATE POLICY "Users can update their own healer profile"
ON public.healer_profiles
FOR UPDATE
USING ((select auth.uid()) = user_id);

-- Users can delete their own healer profile
CREATE POLICY "Users can delete their own healer profile"
ON public.healer_profiles
FOR DELETE
USING ((select auth.uid()) = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_healer_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_healer_profiles_updated_at
BEFORE UPDATE ON public.healer_profiles
FOR EACH ROW
EXECUTE FUNCTION update_healer_profiles_updated_at();
