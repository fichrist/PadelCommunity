-- =====================================================
-- TRIGGER TO UPDATE MATCH WHEN PARTICIPANTS CHANGE
-- =====================================================
-- This trigger automatically updates the match's updated_at
-- timestamp whenever participants are added, updated, or deleted
-- =====================================================

-- Create function to update match timestamp
CREATE OR REPLACE FUNCTION update_match_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the match's updated_at timestamp
  UPDATE matches
  SET updated_at = NOW()
  WHERE id = COALESCE(NEW.match_id, OLD.match_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT
CREATE TRIGGER trigger_update_match_on_participant_insert
AFTER INSERT ON match_participants
FOR EACH ROW
EXECUTE FUNCTION update_match_timestamp();

-- Create trigger for UPDATE
CREATE TRIGGER trigger_update_match_on_participant_update
AFTER UPDATE ON match_participants
FOR EACH ROW
EXECUTE FUNCTION update_match_timestamp();

-- Create trigger for DELETE
CREATE TRIGGER trigger_update_match_on_participant_delete
AFTER DELETE ON match_participants
FOR EACH ROW
EXECUTE FUNCTION update_match_timestamp();
