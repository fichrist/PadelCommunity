import { useState, useEffect, useCallback } from 'react';
import { getAllEvents } from '@/lib/events';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchEvents = useCallback(async () => {
    console.log('useEvents: Starting fetchEvents...');
    setIsLoading(true);
    setError(null);

    try {
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

      // Fetch matches with participants (join with profiles via player_profile_id)
      console.log('useEvents: Fetching matches...');
      const { data: matchesData, error: matchesError } = await supabase
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
            player_profile:player_profile_id (
              avatar_url,
              ranking
            )
          )
        `)
        .order('match_date', { ascending: true });

      console.log('useEvents: Matches fetched:', matchesData?.length, 'Error:', matchesError);

      if (matchesError) {
        console.error('Matches error:', matchesError);
        // Don't throw - continue without matches
        setMatches([]);
      } else if (matchesData) {
        console.log('useEvents: Processing matches data...');

        console.log('useEvents: Fetching thoughts counts...');
        // Fetch thoughts counts for all matches
        const matchIds = matchesData.map(m => m.id);
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

        console.log('useEvents: Enriching matches with profile data...');
        // Flatten profile data into participant objects and add thoughts count
        const enrichedMatches = matchesData.map(match => ({
          ...match,
          thoughts_count: thoughtsCounts.get(match.id) || 0,
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
          }) || []
        }));

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
  const refetchSingleMatch = useCallback(async (matchId: string) => {
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
          }) || []
        };

        // Update only this match in state
        setMatches(prevMatches =>
          prevMatches.map(match =>
            match.id === matchId ? enrichedMatch as any : match
          )
        );
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
          console.log('Match changed:', payload);
          const matchId = (payload.new as any)?.id || (payload.old as any)?.id;
          if (matchId) {
            refetchSingleMatch(matchId);
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'match_participants' },
        (payload) => {
          console.log('Match participant changed:', payload);
          const matchId = (payload.new as any)?.match_id || (payload.old as any)?.match_id;
          if (matchId) {
            refetchSingleMatch(matchId);
          }
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'thoughts' },
        (payload) => {
          console.log('Thought added:', payload);
          const matchId = (payload.new as any)?.match_id;
          if (matchId) {
            refetchSingleMatch(matchId);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
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
