import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  getThoughtsByEventId,
  getThoughtsByMatchId,
  createThought,
  createEventThought,
  createMatchThought,
  updateThought,
  deleteThought,
} from '@/lib/thoughts';

/**
 * Hook for managing thoughts (comments/replies)
 * Platform-agnostic - works for both React Web and React Native
 */

export interface Thought {
  id: string;
  content: string;
  author_id: string;
  parent_thought_id?: string | null;
  event_id?: string | null;
  match_id?: string | null;
  created_at: string;
  updated_at?: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  [key: string]: any;
}

export interface ThoughtTree extends Thought {
  replies: ThoughtTree[];
}

export interface UseThoughtsReturn {
  thoughts: Thought[];
  thoughtTree: ThoughtTree[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchThoughts: () => Promise<void>;
  addThought: (content: string, parentId?: string) => Promise<boolean>;
  editThought: (thoughtId: string, content: string) => Promise<boolean>;
  removeThought: (thoughtId: string) => Promise<boolean>;
  clearThoughts: () => void;
}

/**
 * Organize flat thoughts array into tree structure
 */
export const organizeThoughtsIntoTree = (thoughts: Thought[]): ThoughtTree[] => {
  const thoughtMap = new Map<string, ThoughtTree>();
  const rootThoughts: ThoughtTree[] = [];

  // Create map with all thoughts including replies array
  thoughts.forEach((thought) => {
    thoughtMap.set(thought.id, { ...thought, replies: [] });
  });

  // Build tree structure
  thoughts.forEach((thought) => {
    const thoughtNode = thoughtMap.get(thought.id);
    if (!thoughtNode) return;

    if (thought.parent_thought_id) {
      // This is a reply, add it to parent's replies
      const parent = thoughtMap.get(thought.parent_thought_id);
      if (parent) {
        parent.replies.push(thoughtNode);
      }
    } else {
      // This is a root thought
      rootThoughts.push(thoughtNode);
    }
  });

  return rootThoughts;
};

/**
 * Hook for managing thoughts on an event or match
 */
export const useThoughts = (
  entityType: 'event' | 'match',
  entityId: string | null
): UseThoughtsReturn => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThoughts = useCallback(async () => {
    if (!entityId) {
      setThoughts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let fetchedThoughts: Thought[] = [];

      if (entityType === 'event') {
        fetchedThoughts = await getThoughtsByEventId(entityId);
      } else if (entityType === 'match') {
        fetchedThoughts = await getThoughtsByMatchId(entityId);
      }

      setThoughts(fetchedThoughts || []);
    } catch (err) {
      console.error('Error fetching thoughts:', err);
      setError('Failed to load comments');
      setThoughts([]);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  const addThought = useCallback(
    async (content: string, parentId?: string): Promise<boolean> => {
      if (!entityId || !content.trim()) {
        return false;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        let newThought: Thought | null = null;

        if (entityType === 'event') {
          newThought = await createEventThought(entityId, content, parentId);
        } else if (entityType === 'match') {
          newThought = await createMatchThought(entityId, content, parentId);
        }

        if (newThought) {
          await fetchThoughts(); // Refresh to get updated list
          return true;
        }

        return false;
      } catch (err) {
        console.error('Error adding thought:', err);
        setError('Failed to add comment');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [entityType, entityId, fetchThoughts]
  );

  const editThought = useCallback(
    async (thoughtId: string, content: string): Promise<boolean> => {
      if (!content.trim()) {
        return false;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const success = await updateThought(thoughtId, content);

        if (success) {
          await fetchThoughts(); // Refresh to get updated list
          return true;
        }

        return false;
      } catch (err) {
        console.error('Error editing thought:', err);
        setError('Failed to edit comment');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchThoughts]
  );

  const removeThought = useCallback(
    async (thoughtId: string): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const success = await deleteThought(thoughtId);

        if (success) {
          await fetchThoughts(); // Refresh to get updated list
          return true;
        }

        return false;
      } catch (err) {
        console.error('Error deleting thought:', err);
        setError('Failed to delete comment');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchThoughts]
  );

  const clearThoughts = useCallback(() => {
    setThoughts([]);
    setError(null);
  }, []);

  // Fetch thoughts when entityId changes
  useEffect(() => {
    fetchThoughts();
  }, [fetchThoughts]);

  // Real-time subscription for thoughts changes
  useEffect(() => {
    if (!entityId) return;

    const channel = supabase
      .channel(`thoughts-${entityType}-${entityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'thoughts',
        },
        (payload: any) => {
          // Only refetch if the change is for our entity
          const changedId = payload.new?.[`${entityType}_id`] || payload.old?.[`${entityType}_id`];
          if (changedId === entityId) {
            fetchThoughts();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entityType, entityId, fetchThoughts]);

  // Organize thoughts into tree structure
  const thoughtTree = organizeThoughtsIntoTree(thoughts);

  return {
    thoughts,
    thoughtTree,
    isLoading,
    isSubmitting,
    error,
    fetchThoughts,
    addThought,
    editThought,
    removeThought,
    clearThoughts,
  };
};
