import { useState, useCallback } from 'react';
import { supabase, getUserIdFromStorage, createFreshSupabaseClient } from '@/integrations/supabase/client';

/**
 * Hook for managing event enrollments
 * Platform-agnostic - works for both React Web and React Native
 */

export interface Enrollment {
  id: string;
  event_id: string;
  user_id: string;
  is_anonymous: boolean;
  created_at: string;
}

export interface UseEventEnrollmentReturn {
  isEnrolling: boolean;
  isUnenrolling: boolean;
  error: string | null;
  enroll: (eventId: string, isAnonymous?: boolean) => Promise<boolean>;
  unenroll: (eventId: string) => Promise<boolean>;
  isUserEnrolled: (eventId: string, userId: string, enrollments?: any[]) => boolean;
  getEnrollmentCount: (enrollments?: any[]) => number;
}

/**
 * Hook for managing event enrollments
 */
export const useEventEnrollment = (): UseEventEnrollmentReturn => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enroll = useCallback(async (eventId: string, isAnonymous: boolean = false): Promise<boolean> => {
    setIsEnrolling(true);
    setError(null);

    try {
      // Get user ID synchronously from localStorage (never hangs)
      const userId = getUserIdFromStorage();

      if (!userId) {
        setError('You must be logged in to enroll');
        return false;
      }

      // Use fresh client to avoid stuck state
      const client = createFreshSupabaseClient();

      // Check if already enrolled
      const { data: existing } = await client
        .from('enrollments')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        setError('Already enrolled in this event');
        return false;
      }

      // Create enrollment
      const { error: enrollError } = await client
        .from('enrollments')
        .insert({
          event_id: eventId,
          user_id: userId,
          is_anonymous: isAnonymous,
        });

      if (enrollError) throw enrollError;

      return true;
    } catch (err) {
      console.error('Error enrolling:', err);
      setError('Failed to enroll in event');
      return false;
    } finally {
      setIsEnrolling(false);
    }
  }, []);

  const unenroll = useCallback(async (eventId: string): Promise<boolean> => {
    setIsUnenrolling(true);
    setError(null);

    try {
      // Get user ID synchronously from localStorage (never hangs)
      const userId = getUserIdFromStorage();

      if (!userId) {
        setError('You must be logged in');
        return false;
      }

      // Use fresh client to avoid stuck state
      const client = createFreshSupabaseClient();
      const { error: unenrollError } = await client
        .from('enrollments')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (unenrollError) throw unenrollError;

      return true;
    } catch (err) {
      console.error('Error unenrolling:', err);
      setError('Failed to unenroll from event');
      return false;
    } finally {
      setIsUnenrolling(false);
    }
  }, []);

  const isUserEnrolled = useCallback((eventId: string, userId: string, enrollments?: any[]): boolean => {
    if (!enrollments) return false;
    return enrollments.some(e => e.user_id === userId);
  }, []);

  const getEnrollmentCount = useCallback((enrollments?: any[]): number => {
    return enrollments?.length || 0;
  }, []);

  return {
    isEnrolling,
    isUnenrolling,
    error,
    enroll,
    unenroll,
    isUserEnrolled,
    getEnrollmentCount,
  };
};
