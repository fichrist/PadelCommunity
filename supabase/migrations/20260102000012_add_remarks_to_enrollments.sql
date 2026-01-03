-- Add remarks column to enrollments table
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Add comment to column
COMMENT ON COLUMN public.enrollments.remarks IS 'Optional remarks or notes from the user during enrollment';
