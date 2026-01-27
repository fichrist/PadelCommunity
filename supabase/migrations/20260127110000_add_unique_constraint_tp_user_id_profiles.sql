-- =====================================================
-- ADD UNIQUE CONSTRAINT ON tp_user_id IN PROFILES
-- =====================================================
-- Prevent the same Tennis & Padel Vlaanderen account
-- from being linked to multiple profiles.
-- =====================================================

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_tp_user_id_unique UNIQUE (tp_user_id);
