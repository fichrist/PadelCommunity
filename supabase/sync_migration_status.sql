-- Sync migration status: Mark groups migration as already applied
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/djnljqrarilsuodmetdl/sql/new)

-- First, check what migrations are recorded
SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;

-- Mark the groups migration as applied if not already
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20260120090000', 'create_groups_table')
ON CONFLICT (version) DO NOTHING;

-- Verify it was added
SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;
