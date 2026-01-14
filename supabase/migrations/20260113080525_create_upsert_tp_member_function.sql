-- =====================================================
-- CREATE UPSERT TP MEMBER FUNCTION
-- =====================================================
-- Creates an RPC function to upsert tp_members
-- This bypasses PostgREST schema cache issues
-- =====================================================

CREATE OR REPLACE FUNCTION upsert_tp_member(
  p_tp_user_id INTEGER,
  p_name TEXT,
  p_tp_membership_number TEXT
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  tp_membership_number TEXT,
  tp_user_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.tp_members (tp_user_id, name, tp_membership_number, updated_at)
  VALUES (p_tp_user_id, p_name, p_tp_membership_number, NOW())
  ON CONFLICT (tp_user_id)
  DO UPDATE SET
    name = EXCLUDED.name,
    tp_membership_number = EXCLUDED.tp_membership_number,
    updated_at = NOW()
  RETURNING
    tp_members.id,
    tp_members.name,
    tp_members.tp_membership_number,
    tp_members.tp_user_id,
    tp_members.created_at,
    tp_members.updated_at;
END;
$$;

-- Grant execute permission to anon
GRANT EXECUTE ON FUNCTION upsert_tp_member(INTEGER, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION upsert_tp_member(INTEGER, TEXT, TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION upsert_tp_member(INTEGER, TEXT, TEXT) IS
  'Upserts a TP member record. Used by backend scraping to avoid PostgREST schema cache issues.';
