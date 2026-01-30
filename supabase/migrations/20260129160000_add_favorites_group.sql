-- =====================================================
-- ADD FAVORITES GROUP TYPE
-- =====================================================
-- Adds 'Favorites' as a new group_type.
-- Matches with restricted_users are shown in this group
-- for the restricted users.
-- =====================================================

-- Update CHECK constraint on group_type to allow 'Favorites'
ALTER TABLE public.groups
DROP CONSTRAINT IF EXISTS groups_group_type_check;

ALTER TABLE public.groups
ADD CONSTRAINT groups_group_type_check
CHECK (group_type IN ('General', 'Ranked', 'Favorites'));

-- Update ranking_level constraint to allow NULL for Favorites (like General)
ALTER TABLE public.groups
DROP CONSTRAINT IF EXISTS check_ranking_level;

ALTER TABLE public.groups
ADD CONSTRAINT check_ranking_level
CHECK (
  (group_type = 'General' AND ranking_level IS NULL) OR
  (group_type = 'Ranked' AND ranking_level IS NOT NULL) OR
  (group_type = 'Favorites' AND ranking_level IS NULL)
);

-- Insert the Favorites only group
INSERT INTO public.groups (name, group_type, ranking_level)
VALUES ('Favorites only', 'Favorites', NULL);
