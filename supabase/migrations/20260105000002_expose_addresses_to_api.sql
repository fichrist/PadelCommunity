-- Ensure addresses table is exposed to PostgREST API
-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on addresses table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO anon, authenticated;

-- Grant usage on sequence if needed
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
