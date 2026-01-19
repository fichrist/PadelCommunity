import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing padel matches
 * Platform-agnostic - works for both React Web and React Native
 */

export interface UseMatchManagementReturn {
  editingMatchId: string | null;
  newLevelForMatch: string;
  isUpdating: boolean;
  error: string | null;
  startEditingMatch: (matchId: string, currentLevel: string) => void;
  cancelEditingMatch: () => void;
  setNewLevelForMatch: (level: string) => void;
  saveMatchLevel: (matchId: string) => Promise<boolean>;
  deleteMatch: (matchId: string) => Promise<boolean>;
}

/**
 * Hook for managing match editing and deletion
 */
export const useMatchManagement = (onSuccess?: () => void): UseMatchManagementReturn => {
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [newLevelForMatch, setNewLevelForMatch] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEditingMatch = useCallback((matchId: string, currentLevel: string) => {
    setEditingMatchId(matchId);
    setNewLevelForMatch(currentLevel);
  }, []);

  const cancelEditingMatch = useCallback(() => {
    setEditingMatchId(null);
    setNewLevelForMatch('');
  }, []);

  const saveMatchLevel = useCallback(async (matchId: string): Promise<boolean> => {
    if (!newLevelForMatch) {
      setError('Please select a level');
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('matches')
        .update({ level: newLevelForMatch })
        .eq('id', matchId);

      if (updateError) throw updateError;

      setEditingMatchId(null);
      setNewLevelForMatch('');

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (err) {
      console.error('Error updating match level:', err);
      setError('Failed to update match level');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [newLevelForMatch, onSuccess]);

  const deleteMatch = useCallback(async (matchId: string): Promise<boolean> => {
    setIsUpdating(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (deleteError) throw deleteError;

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (err) {
      console.error('Error deleting match:', err);
      setError('Failed to delete match');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [onSuccess]);

  return {
    editingMatchId,
    newLevelForMatch,
    isUpdating,
    error,
    startEditingMatch,
    cancelEditingMatch,
    setNewLevelForMatch,
    saveMatchLevel,
    deleteMatch,
  };
};
