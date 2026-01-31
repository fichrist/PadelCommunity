-- Add TP account IDs for both players to upanddown_enrollments
ALTER TABLE public.upanddown_enrollments ADD COLUMN IF NOT EXISTS tp_account_id_player1 TEXT;
ALTER TABLE public.upanddown_enrollments ADD COLUMN IF NOT EXISTS tp_account_id_player2 TEXT;
