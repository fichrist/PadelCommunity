-- =====================================================
-- RELOAD POSTGREST SCHEMA
-- =====================================================
-- Send a notification to PostgREST to reload its schema cache
-- =====================================================

-- Send notify to reload schema
SELECT pg_notify('pgrst', 'reload schema');
