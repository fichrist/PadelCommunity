-- Add contact fields to healer_profiles table

ALTER TABLE public.healer_profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT;
