-- Add intentions array field to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS intentions TEXT[] DEFAULT '{}';

-- Add comment to describe the field
COMMENT ON COLUMN public.events.intentions IS 'Array of intention names associated with the event';
