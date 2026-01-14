-- =====================================================
-- FIX UPSERT TP MEMBER FUNCTION - COLUMN AMBIGUITY
-- =====================================================
-- Fix the ambiguous column reference error by using
-- table-qualified column names in the RETURNING clause
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
    public.tp_members.id,
    public.tp_members.name,
    public.tp_members.tp_membership_number,
    public.tp_members.tp_user_id,
    public.tp_members.created_at,
    public.tp_members.updated_at;
END;
$$;

-- Grant execute permission to anon and authenticated
GRANT EXECUTE ON FUNCTION upsert_tp_member(INTEGER, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION upsert_tp_member(INTEGER, TEXT, TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION upsert_tp_member(INTEGER, TEXT, TEXT) IS
  'Upserts a TP member record with proper table qualification to avoid column ambiguity.';
