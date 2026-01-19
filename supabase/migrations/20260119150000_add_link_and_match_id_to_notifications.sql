-- =====================================================
-- ADD LINK AND MATCH_ID COLUMNS TO NOTIFICATIONS
-- =====================================================
-- The notification triggers and application code expect
-- link and match_id columns to exist on the notifications table
-- =====================================================

ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS link TEXT,
ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE;

-- Create index on match_id for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_match_id ON public.notifications(match_id);

-- Add comment
COMMENT ON COLUMN public.notifications.link IS 'Link to the relevant page (e.g., /events?match=xxx)';
COMMENT ON COLUMN public.notifications.match_id IS 'Reference to the match that triggered this notification';
