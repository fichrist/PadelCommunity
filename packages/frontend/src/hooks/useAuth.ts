import { useState, useEffect } from 'react';
import { supabase, getUserIdFromStorage, createFreshSupabaseClient } from '@/integrations/supabase/client';

/**
 * Hook for authentication state and user profile management
 * Platform-agnostic - works for both React Web and React Native
 */

export interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  ranking: string | null;
  tp_user_id: number | null;
  latitude: number | null;
  longitude: number | null;
  formatted_address: string | null;
  phone_number: string | null;
  [key: string]: any;
}

export interface UseAuthReturn {
  currentUserId: string | null;
  currentUser: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Hook for managing authentication state and current user profile
 */
export const useAuth = (): UseAuthReturn => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Use fresh client to avoid stuck state
      const client = createFreshSupabaseClient();
      const { data: profile, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setCurrentUser(profile);
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (currentUserId) {
      await fetchUserProfile(currentUserId);
    }
  };

  useEffect(() => {
    // Get initial session using synchronous localStorage read (never hangs)
    const getInitialSession = async () => {
      try {
        // Get user ID synchronously from localStorage (never hangs)
        const userId = getUserIdFromStorage();

        if (userId) {
          setCurrentUserId(userId);
          await fetchUserProfile(userId);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setCurrentUserId(session.user.id);
          await fetchUserProfile(session.user.id);
        } else {
          // Before clearing user state, check if there's still a valid token
          // in localStorage. After inactivity, Supabase may fire spurious
          // SIGNED_OUT events even though the token is still refreshable.
          const fallbackId = getUserIdFromStorage();
          if (fallbackId) {
            console.log('[useAuth] Ignoring SIGNED_OUT — token still in localStorage');
            setCurrentUserId(fallbackId);
          } else {
            setCurrentUserId(null);
            setCurrentUser(null);
          }
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUserId(null);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    currentUserId,
    currentUser,
    isLoading,
    isAuthenticated: !!currentUserId,
    signOut,
    refreshProfile,
  };
};
