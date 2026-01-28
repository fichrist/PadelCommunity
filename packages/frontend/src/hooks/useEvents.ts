import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllEvents } from '@/lib/events';
import { supabase, validateSession } from '@/integrations/supabase/client';

/**
 * Hook for fetching and managing events data
 * Platform-agnostic - works for both React Web and React Native
 */

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location_name: string;
  location_address: string;
  latitude: number | null;
  longitude: number | null;
  max_participants: number;
  price: number;
  organizer_id: string;
  created_at: string;
  tags?: string[];
  intention?: string;
  image_url?: string;
  video_url?: string;
  enrollments?: any[];
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  [key: string]: any;
}

export interface Match {
  id: string;
  playtomic_url: string;
  match_date: string;
  match_time: string;
  club_name: string;
  club_address: string;
  court_name: string;
  level: string;
  price: number;
  user_id: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    ranking: string | null;
  };
  [key: string]: any;
}

export interface UseEventsReturn {
  events: Event[];
  matches: Match[];
  allTags: string[];
  allIntentions: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateMatch: (matchId: string, updatedMatch: Match) => void;
}

/**
 * Hook for fetching all events and matches
 */
export const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allIntentions, setAllIntentions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track recently deleted matches to avoid unnecessary refetches from CASCADE DELETE events
  const deletedMatchesRef = useRef<Set<string>>(new Set());

  const fetchEvents = useCallback(async () => {
    console.log('useEvents: Starting fetchEvents...');
    setIsLoading(true);
    setError(null);

    try {
      // Validate session before fetching data. Without this, queries with
      // an expired JWT succeed but RLS policies silently filter all rows,
      // returning empty arrays with no error.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const isValid = await validateSession();
        if (!isValid) {
          console.warn('useEvents: Session invalid, skipping fetch');
          setIsLoading(false);
          return;
        }
      }

      // Fetch events
      console.log('useEvents: Fetching events...');
      const eventsData = await getAllEvents();
      console.log('useEvents: Events fetched:', eventsData?.length);
      setEvents(eventsData || []);

      // Extract unique tags
      const tagsSet = new Set<string>();
      eventsData?.forEach((event: Event) => {
        if (event.tags && Array.isArray(event.tags)) {
          event.tags.forEach(tag => tagsSet.add(tag));
        }
      });
      setAllTags(Array.from(tagsSet));

      // Extract unique intentions
      const intentionsSet = new Set<string>();
      eventsData?.forEach((event: Event) => {
        if (event.intention) {
          intentionsSet.add(event.intention);
        }
      });
      setAllIntentions(Array.from(intentionsSet));

      // Get current user ID for filtering restricted matches.
      // Use getSession() instead of getUser() because getUser() makes a
      // network call that returns null without error when the token is
      // expired, while getSession() reads from localStorage.
      const currentUserId = session?.user?.id;

      // Fetch matches with participants and groups
      console.log('useEvents: Fetching matches...');
      let matchesQuery = supabase
        .from('matches')
        .select(`
          *,
          match_participants (
            id,
            playtomic_user_id,
            added_by_profile_id,
            player_profile_id,
            name,
            team_id,
            gender,
            level_value,
            level_confidence,
            price,
            payment_status,
            registration_date,
            scraped_from_playtomic,
            created_at,
            player_profile:player_profile_id (
              avatar_url,
              ranking
            )
          )
        `)
        .order('match_date', { ascending: true });

      const { data: matchesData, error: matchesError } = await matchesQuery;

      console.log('useEvents: Matches fetched:', matchesData?.length, 'Error:', matchesError);

      if (matchesError) {
        console.error('Matches error:', matchesError);
        // Don't throw - continue without matches
        setMatches([]);
      } else if (matchesData) {
        console.log('useEvents: Processing matches data...');

        // Filter matches based on restricted_users
        // Only show matches where:
        // 1. restricted_users is null or empty (public matches), OR
        // 2. restricted_users contains the current user's ID
        const filteredMatches = matchesData.filter((match: any) => {
          // If no restricted_users or empty array, match is public
          if (!match.restricted_users || match.restricted_users.length === 0) {
            return true;
          }
          // If restricted_users is set, only show if current user is in the list
          if (currentUserId && match.restricted_users.includes(currentUserId)) {
            return true;
          }
          return false;
        });

        console.log('useEvents: Filtered matches:', filteredMatches.length, 'of', matchesData.length);

        console.log('useEvents: Fetching thoughts counts...');
        // Fetch thoughts counts for all filtered matches
        const matchIds = filteredMatches.map(m => m.id);
        let thoughtsCounts = new Map<string, number>();

        if (matchIds.length > 0) {
          const { data: thoughtsData } = await supabase
            .from('thoughts')
            .select('match_id')
            .in('match_id', matchIds);

          console.log('useEvents: Thoughts fetched:', thoughtsData?.length);

          // Count thoughts per match
          thoughtsData?.forEach((thought: any) => {
            const count = thoughtsCounts.get(thought.match_id) || 0;
            thoughtsCounts.set(thought.match_id, count + 1);
          });
        }

        console.log('useEvents: Fetching groups data...');
        // Fetch all unique group IDs from filtered matches
        const allGroupIds = new Set<string>();
        filteredMatches.forEach((match: any) => {
          if (match.group_ids && Array.isArray(match.group_ids)) {
            match.group_ids.forEach((id: string) => allGroupIds.add(id));
          }
        });

        let groupsMap = new Map<string, any>();
        if (allGroupIds.size > 0) {
          // Cast to any to bypass TypeScript error for groups table
          const { data: groupsData } = await (supabase as any)
            .from('groups')
            .select('*')
            .in('id', Array.from(allGroupIds));

          console.log('useEvents: Groups fetched:', groupsData?.length);

          groupsData?.forEach((group: any) => {
            groupsMap.set(group.id, group);
          });
        }

        console.log('useEvents: Enriching matches with profile data and groups...');
        // Flatten profile data into participant objects, add thoughts count, and add groups
        const enrichedMatches = filteredMatches.map(match => {
          const matchGroupIds = (match as any).group_ids || [];
          return {
            ...match,
            thoughts_count: thoughtsCounts.get(match.id) || 0,
            groups: matchGroupIds.map((groupId: string) => groupsMap.get(groupId)).filter(Boolean),
            match_participants: match.match_participants?.map((p: any) => {
              console.log('useEvents: Enriching participant:', {
                name: p.name,
                player_profile_id: p.player_profile_id,
                has_player_profile: !!p.player_profile,
                profile_ranking: p.player_profile?.ranking,
                profile_avatar: p.player_profile?.avatar_url
              });
              return {
                ...p,
                avatar_url: p.player_profile?.avatar_url || null,
                profile_ranking: p.player_profile?.ranking || null,
              };
            }).sort((a: any, b: any) => {
              // Sort participants by created_at timestamp
              const timeA = new Date(a.created_at).getTime();
              const timeB = new Date(b.created_at).getTime();
              return timeA - timeB;
            }) || []
          };
        });

        console.log('useEvents: Setting enriched matches:', enrichedMatches.length);
        setMatches(enrichedMatches as any);
      } else {
        setMatches([]);
      }
    } catch (err) {
      console.error('useEvents: Error fetching events:', err);
      setError('Failed to load events');
      setEvents([]);
      setMatches([]);
    } finally {
      console.log('useEvents: Finished, setting isLoading to false');
      setIsLoading(false);
    }
  }, []);

  // Helper function to refetch a single match without flickering
  const refetchSingleMatch = useCallback(async (matchId: string, isNewMatch = false) => {
    try {
      const { data: matchData } = await supabase
        .from('matches')
        .select(`
          *,
          match_participants (
            id,
            playtomic_user_id,
            added_by_profile_id,
            player_profile_id,
            name,
            team_id,
            gender,
            level_value,
            level_confidence,
            price,
            payment_status,
            registration_date,
            scraped_from_playtomic,
            created_at,
            player_profile:player_profile_id (
              avatar_url,
              ranking
            )
          )
        `)
        .eq('id', matchId)
        .single();

      if (matchData) {
        // Fetch thoughts count
        const { data: thoughtsData } = await supabase
          .from('thoughts')
          .select('match_id')
          .eq('match_id', matchId);

        const thoughtsCount = thoughtsData?.length || 0;

        // Flatten profile data into participant objects
        const enrichedMatch = {
          ...matchData,
          thoughts_count: thoughtsCount,
          match_participants: matchData.match_participants?.map((p: any) => {
            return {
              ...p,
              avatar_url: p.player_profile?.avatar_url || null,
              profile_ranking: p.player_profile?.ranking || null,
            };
          }).sort((a: any, b: any) => {
            // Sort participants by created_at timestamp
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            return timeA - timeB;
          }) || []
        };

        // Update or add match to state
        setMatches(prevMatches => {
          if (isNewMatch) {
            // Check if match already exists to avoid duplicates
            const exists = prevMatches.some(m => m.id === matchId);
            if (exists) {
              // Already exists, just update it
              return prevMatches.map(match =>
                match.id === matchId ? enrichedMatch as any : match
              );
            }
            // Add new match to the list, sorted by match_date
            const newMatches = [...prevMatches, enrichedMatch as any];
            return newMatches.sort((a, b) => {
              const dateA = new Date(a.match_date).getTime();
              const dateB = new Date(b.match_date).getTime();
              return dateA - dateB;
            });
          } else {
            // Update existing match
            return prevMatches.map(match =>
              match.id === matchId ? enrichedMatch as any : match
            );
          }
        });
      }
    } catch (error) {
      console.error('Error refetching single match:', error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();

    // Set up realtime subscriptions for matches and participants
    const matchesChannel = supabase
      .channel('matches-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => {
          console.log('🔄 Match changed:', payload.eventType, payload);
          const matchId = (payload.new as any)?.id || (payload.old as any)?.id;

          if (payload.eventType === 'DELETE' && matchId) {
            console.log(`🗑️ Match ${matchId} deleted, removing from state`);
            // Track this deleted match to avoid refetching it when CASCADE DELETE triggers participant events
            deletedMatchesRef.current.add(matchId);
            setMatches(prevMatches => prevMatches.filter(m => m.id !== matchId));

            // Clean up the deleted match from ref after a short delay
            setTimeout(() => {
              deletedMatchesRef.current.delete(matchId);
            }, 2000);
            return;
          }

          if (payload.eventType === 'INSERT' && matchId) {
            console.log(`➕ New match ${matchId} created, adding to state`);
            refetchSingleMatch(matchId, true);
            return;
          }

          if (matchId) {
            console.log(`🔄 Refetching match ${matchId} due to match change (${payload.eventType})`);
            refetchSingleMatch(matchId);
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'match_participants' },
        async (payload) => {
          console.log('👥 Match participant changed:', payload.eventType, payload);

          let matchId = (payload.new as any)?.match_id || (payload.old as any)?.match_id;

          // For DELETE events, payload.old might only contain the participant ID
          // Try to find which match this participant belonged to from current state
          if (!matchId && payload.eventType === 'DELETE' && payload.old?.id) {
            console.log('👥 DELETE event, searching for match in current state...');
            const participantId = payload.old.id;

            // Find the match without triggering a state update
            const currentMatches = matches;
            const matchWithParticipant = currentMatches.find(m =>
              m.match_participants?.some((p: any) => p.id === participantId)
            );

            if (matchWithParticipant) {
              // Check if this match was recently deleted
              if (deletedMatchesRef.current.has(matchWithParticipant.id)) {
                console.log(`👥 Match ${matchWithParticipant.id} was recently deleted, skipping refetch`);
                return;
              }

              console.log(`👥 Found match ${matchWithParticipant.id} for deleted participant`);
              refetchSingleMatch(matchWithParticipant.id);
            } else {
              console.log('👥 Match not found in state (may have been deleted), skipping refetch');
            }
            return;
          }

          if (matchId) {
            console.log(`👥 Refetching match ${matchId} due to participant change (${payload.eventType})`);
            // For DELETE events, check if match was recently deleted or still exists
            if (payload.eventType === 'DELETE') {
              // Check if this match was recently deleted
              if (deletedMatchesRef.current.has(matchId)) {
                console.log(`👥 Match ${matchId} was recently deleted, skipping refetch`);
                return;
              }

              // Check if match still exists in state
              const matchExists = matches.some(m => m.id === matchId);
              if (matchExists) {
                refetchSingleMatch(matchId);
              } else {
                console.log(`👥 Match ${matchId} no longer exists in state, skipping refetch`);
              }
            } else {
              refetchSingleMatch(matchId);
            }
          }
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'thoughts' },
        (payload) => {
          console.log('💭 Thought added:', payload);
          const matchId = (payload.new as any)?.match_id;
          if (matchId) {
            refetchSingleMatch(matchId);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Realtime subscription error:', err);
        }
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to match changes');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`Realtime channel ${status}, will attempt to resubscribe`);
          // Remove the broken channel and resubscribe after a short delay
          supabase.removeChannel(matchesChannel);
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Cleaning up realtime subscriptions');
      supabase.removeChannel(matchesChannel);
    };
  }, [fetchEvents, refetchSingleMatch]);

  const updateMatch = useCallback((matchId: string, updatedMatch: Match) => {
    setMatches(prevMatches =>
      prevMatches.map(match =>
        match.id === matchId ? updatedMatch : match
      )
    );
  }, []);

  return {
    events,
    matches,
    allTags,
    allIntentions,
    isLoading,
    error,
    refetch: fetchEvents,
    updateMatch,
  };
};

/**
 * Hook for fetching a single event by ID
 */
export const useEvent = (eventId: string | null) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }

    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('events')
          .select(`
            *,
            profiles:organizer_id (
              first_name,
              last_name,
              avatar_url
            ),
            enrollments (
              id,
              user_id,
              is_anonymous
            )
          `)
          .eq('id', eventId)
          .single();

        if (fetchError) throw fetchError;

        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event');
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  return {
    event,
    isLoading,
    error,
  };
};
