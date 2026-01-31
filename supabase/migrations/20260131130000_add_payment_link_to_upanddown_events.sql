-- =====================================================
-- ADD PAYMENT LINK TO UPANDDOWN_EVENTS
-- =====================================================

ALTER TABLE public.upanddown_events
ADD COLUMN IF NOT EXISTS payment_link TEXT;
