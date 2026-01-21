-- Mark the groups migration as already applied
-- Run this in Supabase SQL Editor to tell the CLI that this migration has been completed

INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES (
  '20260120090000',
  'create_groups_table',
  ARRAY[
    'CREATE TABLE IF NOT EXISTS public.groups (...)',
    'ALTER TABLE public.groups ADD CONSTRAINT check_ranking_level ...',
    'CREATE INDEX IF NOT EXISTS idx_groups_group_type ...',
    'INSERT INTO public.groups ...'
  ]
)
ON CONFLICT (version) DO NOTHING;
