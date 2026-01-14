-- =====================================================
-- ADD TP MEMBERSHIP NUMBER AND DROP PADEL LEVEL
-- =====================================================
-- This migration adds tp_membership_number field and drops padel_level
-- =====================================================

-- Add tp_membership_number column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tp_membership_number TEXT;

COMMENT ON COLUMN public.profiles.tp_membership_number IS 'Tennis & Padel Vlaanderen Membership Number';

-- Drop padel_level column
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS padel_level;
