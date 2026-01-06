-- Add intentions array field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS intentions TEXT[] DEFAULT '{}';

-- Add comment to describe the field
COMMENT ON COLUMN public.profiles.intentions IS 'Array of intention names that the user has selected';
