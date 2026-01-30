-- =====================================================
-- DROP location_enabled FROM NOTIFICATION MATCH FILTERS
-- =====================================================
-- The location_enabled boolean is no longer needed.
-- Location filtering is determined by whether coordinates exist.
-- =====================================================

ALTER TABLE public.notification_match_filters
DROP COLUMN IF EXISTS location_enabled;
