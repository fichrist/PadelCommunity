-- =====================================================
-- UP & DOWN EVENTS AND ENROLLMENTS
-- =====================================================
-- Creates tables for the Up & Down event enrollment system.
-- Events have a single price. Enrollments support an optional
-- partner (no account required). user_id is nullable for
-- future flexibility.
-- =====================================================

-- Up & Down Events
CREATE TABLE IF NOT EXISTS public.upanddown_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT,
  price NUMERIC(10,2) NOT NULL,
  max_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.upanddown_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view upanddown events"
  ON public.upanddown_events
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage upanddown events"
  ON public.upanddown_events
  FOR ALL
  USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_upanddown_events_date
  ON public.upanddown_events(event_date);

-- Up & Down Enrollments
CREATE TABLE IF NOT EXISTS public.upanddown_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.upanddown_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  partner_name TEXT,
  partner_email TEXT,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.upanddown_enrollments ENABLE ROW LEVEL SECURITY;

-- Everyone can read enrollments (for admin/organizer visibility)
CREATE POLICY "Everyone can view upanddown enrollments"
  ON public.upanddown_enrollments
  FOR SELECT
  USING (true);

-- Authenticated users can enroll
CREATE POLICY "Authenticated users can insert upanddown enrollments"
  ON public.upanddown_enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own enrollments
CREATE POLICY "Users can update own upanddown enrollments"
  ON public.upanddown_enrollments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own enrollments
CREATE POLICY "Users can delete own upanddown enrollments"
  ON public.upanddown_enrollments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_upanddown_enrollments_event_id
  ON public.upanddown_enrollments(event_id);

CREATE INDEX IF NOT EXISTS idx_upanddown_enrollments_user_id
  ON public.upanddown_enrollments(user_id);

COMMENT ON TABLE public.upanddown_events IS 'Events for the Up & Down enrollment system';
COMMENT ON TABLE public.upanddown_enrollments IS 'Enrollments for Up & Down events, supports optional partner';
