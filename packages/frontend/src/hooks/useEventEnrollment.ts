import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to enroll');
        return false;
      }

      // Check if already enrolled
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        setError('Already enrolled in this event');
        return false;
      }

      // Create enrollment
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          event_id: eventId,
          user_id: user.id,
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
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in');
        return false;
      }

      const { error: unenrollError } = await supabase
        .from('enrollments')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

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
