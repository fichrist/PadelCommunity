-- Fix function search path security warning by recreating with proper settings
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

-- Recreate the triggers
CREATE TRIGGER update_personal_events_updated_at
BEFORE UPDATE ON public.personal_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_notes_updated_at
BEFORE UPDATE ON public.calendar_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();