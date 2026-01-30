// =====================================================
// MATCH HELPER FUNCTIONS
// =====================================================
// Business logic for working with matches
// =====================================================

import { createFreshSupabaseClient } from "@/integrations/supabase/client";

export interface MatchParticipant {
  id: string;
  playtomic_user_id: string | null;
  added_by_profile_id: string | null;
  player_profile_id: string | null;
  name: string;
  team_id: string | null;
  gender: string | null;
  level_value: number | null;
  level_confidence: number | null;
  price: number | null;
  payment_status: string | null;
  registration_date: string | null;
  scraped_from_playtomic: boolean;
  created_at: string;
  avatar_url: string | null;
  profile_ranking: string | null;
}

export interface Match {
  id: string;
  created_by: string;
  match_date: string;
  match_time: string | null;
  club_name: string | null;
  court_name: string | null;
  city: string | null;
  url: string | null;
  group_ids: string[] | null;
  restricted_users: string[] | null;
  match_participants: MatchParticipant[];
  [key: string]: any;
}

/**
 * Fetch matches for a specific group, filtering out matches from organizers who blocked the current user
 */
export async function fetchMatchesForGroup(
  groupId: string,
  currentUserId: string | null
): Promise<Match[]> {
  try {
    // Use fresh client to avoid stuck state after inactivity
    const client = createFreshSupabaseClient();

    // First fetch the matches
    const { data: matchesData, error: matchesError } = await client
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
      .contains('group_ids', [groupId])
      .order('match_date', { ascending: true });

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return [];
    }

    if (!matchesData || matchesData.length === 0) {
      return [];
    }

    // Filter matches based on blocked users if there's a current user
    const filteredMatches = await filterMatchesByBlockedUsers(matchesData, currentUserId);

    // Enrich matches with flattened profile data
    return enrichMatches(filteredMatches);
  } catch (error) {
    console.error('Error in fetchMatchesForGroup:', error);
    return [];
  }
}

/**
 * Fetch matches for the Favorites group - matches where currentUserId is in restricted_users
 */
export async function fetchFavoritesMatches(
  currentUserId: string | null
): Promise<Match[]> {
  if (!currentUserId) return [];

  try {
    const client = createFreshSupabaseClient();

    const { data: matchesData, error: matchesError } = await client
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
      .contains('restricted_users', [currentUserId])
      .order('match_date', { ascending: true });

    if (matchesError) {
      console.error('Error fetching favorites matches:', matchesError);
      return [];
    }

    if (!matchesData || matchesData.length === 0) {
      return [];
    }

    const filteredMatches = await filterMatchesByBlockedUsers(matchesData, currentUserId);
    return enrichMatches(filteredMatches);
  } catch (error) {
    console.error('Error in fetchFavoritesMatches:', error);
    return [];
  }
}

/**
 * Fetch a single match by ID, filtering if organizer blocked the current user
 */
export async function fetchMatchById(
  matchId: string,
  currentUserId: string | null
): Promise<Match | null> {
  try {
    // Use fresh client to avoid stuck state after inactivity
    const client = createFreshSupabaseClient();

    const { data: matchData, error: matchError } = await client
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

    if (matchError) {
      console.error('Error fetching match:', matchError);
      return null;
    }

    if (!matchData) {
      return null;
    }

    // Check if organizer has blocked the current user
    const filteredMatches = await filterMatchesByBlockedUsers([matchData], currentUserId);

    if (filteredMatches.length === 0) {
      return null; // Match is hidden because organizer blocked current user
    }

    const enrichedMatches = enrichMatches(filteredMatches);
    return enrichedMatches[0] || null;
  } catch (error) {
    console.error('Error in fetchMatchById:', error);
    return null;
  }
}

/**
 * Filter matches to exclude those where the organizer has blocked the current user
 */
async function filterMatchesByBlockedUsers(
  matches: any[],
  currentUserId: string | null
): Promise<any[]> {
  if (!currentUserId || matches.length === 0) {
    return matches;
  }

  // Get unique organizer IDs
  const organizerIds = [...new Set(matches.map(m => m.created_by).filter(Boolean))];

  if (organizerIds.length === 0) {
    return matches;
  }

  // Use fresh client to avoid stuck state after inactivity
  const client = createFreshSupabaseClient();

  // Fetch blocked_users for all organizers
  const { data: profiles, error } = await client
    .from('profiles')
    .select('id, blocked_users')
    .in('id', organizerIds);

  if (error) {
    console.error('Error fetching organizer profiles:', error);
    return matches; // Return all matches if we can't check blocked users
  }

  // Create a map of organizer ID to their blocked users
  const blockedUsersMap = new Map<string, string[]>();
  profiles?.forEach(profile => {
    blockedUsersMap.set(profile.id, profile.blocked_users || []);
  });

  // Filter out matches where the current user is in the organizer's blocked list
  return matches.filter(match => {
    const organizerBlockedUsers = blockedUsersMap.get(match.created_by) || [];
    return !organizerBlockedUsers.includes(currentUserId);
  });
}

/**
 * Enrich matches with flattened participant profile data and sorted participants
 */
function enrichMatches(matches: any[]): Match[] {
  return matches.map(match => ({
    ...match,
    match_participants: (match.match_participants || [])
      .map((p: any) => ({
        ...p,
        avatar_url: p.player_profile?.avatar_url || null,
        profile_ranking: p.player_profile?.ranking || null,
      }))
      .sort((a: any, b: any) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return timeA - timeB;
      })
  }));
}
