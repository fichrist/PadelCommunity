-- =====================================================
-- ADD FIELDS TO UPANDDOWN_EVENTS
-- =====================================================
-- Adds club_name, duration, group_ids and created_by
-- to support event creation from the app.
-- Removes unused tags and intensions columns.
-- =====================================================

ALTER TABLE public.upanddown_events
ADD COLUMN IF NOT EXISTS club_name TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS group_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.upanddown_events
DROP COLUMN IF EXISTS tags,
DROP COLUMN IF EXISTS intensions;
