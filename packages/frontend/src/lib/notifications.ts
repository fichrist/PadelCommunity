import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

/**
 * Platform-agnostic utility functions for managing notifications
 * Can be used in both React Web and React Native apps
 */

interface NotificationFilter {
  location_enabled: boolean;
  location_latitude: number | null;
  location_longitude: number | null;
  location_radius_km: number;
  group_ids: string[];
}

interface Match {
  id: string;
  venue_name?: string;
  match_date?: string;
  latitude?: number | null;
  longitude?: number | null;
  group_ids?: string[];
  restricted_users?: string[] | null;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a match meets the user's notification filter criteria
 */
function matchMeetsFilterCriteria(
  match: Match,
  filter: NotificationFilter
): boolean {
  console.log(`\n=== Filter Check for Match ${match.id} ===`);
  console.log("Filter:", filter);
  console.log("Match:", match);

  // Check location filter
  if (filter.location_enabled) {
    console.log("Location filter is ENABLED");
    // If location filter is enabled, both match and filter must have coordinates
    if (
      !match.latitude ||
      !match.longitude ||
      !filter.location_latitude ||
      !filter.location_longitude
    ) {
      // If location filter is enabled but coordinates are missing, exclude the match
      console.log(`Match ${match.id} excluded: missing coordinates`);
      return false;
    }

    const distance = calculateDistance(
      filter.location_latitude,
      filter.location_longitude,
      match.latitude,
      match.longitude
    );

    console.log(`Match ${match.id} distance: ${distance.toFixed(2)}km (max: ${filter.location_radius_km}km)`);

    if (distance > filter.location_radius_km) {
      console.log(`Match ${match.id} excluded: outside radius`);
      return false;
    }
  }

  // Check group filter (primary filter)
  console.log("Checking group filter:", {
    group_ids: filter.group_ids,
    match_group_ids: match.group_ids,
  });

  if (filter.group_ids && filter.group_ids.length > 0) {
    console.log("Group filter is ENABLED with groups:", filter.group_ids);
    if (match.group_ids && match.group_ids.length > 0) {
      const hasMatchingGroup = match.group_ids.some((groupId) =>
        filter.group_ids.includes(groupId)
      );
      if (!hasMatchingGroup) {
        console.log(`Match ${match.id} excluded: group IDs don't match`);
        return false;
      }
    } else {
      console.log(`Match ${match.id} excluded: match has no group IDs`);
      return false;
    }
  }

  console.log(`Match ${match.id} passed all filters`);
  return true;
}

/**
 * Fetch the blocked_users array from a user's profile.
 * Returns an empty array if the profile doesn't exist, has no blocked users,
 * or if the query fails for any reason.
 */
async function getBlockedUsersForUser(userId: string): Promise<string[]> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("blocked_users")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching blocked users for user:", userId, error);
      return [];
    }

    return Array.isArray(profile?.blocked_users) ? profile.blocked_users : [];
  } catch (error) {
    console.error("Unexpected error in getBlockedUsersForUser:", error);
    return [];
  }
}

/**
 * Create notifications for all eligible users when a new match is created
 *
 * @param match - The match object
 * @param creatorId - The ID of the user who created the match (won't receive notification)
 */
export async function createMatchNotifications(
  match: Match,
  creatorId: string
): Promise<void> {
  try {
    console.log("Creating notifications for match:", match.id);
    console.log("Match data:", {
      id: match.id,
      venue_name: match.venue_name,
      match_date: match.match_date,
      latitude: match.latitude,
      longitude: match.longitude,
      group_ids: match.group_ids,
      restricted_users: match.restricted_users,
    });

    // Get eligible user profiles
    let eligibleProfiles;

    if (match.restricted_users && match.restricted_users.length > 0) {
      // Match is restricted - only notify users in restricted_users list (excluding creator)
      console.log(`Match is restricted to ${match.restricted_users.length} users`);
      const restrictedUsersExcludingCreator = match.restricted_users.filter(
        userId => userId !== creatorId
      );

      if (restrictedUsersExcludingCreator.length === 0) {
        console.log("No users to notify (only creator in restricted list)");
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id")
        .in("id", restrictedUsersExcludingCreator);

      if (profilesError) {
        console.error("Error fetching restricted profiles:", profilesError);
        return;
      }

      eligibleProfiles = profiles;
    } else {
      // Match is public - notify all users except creator
      console.log("Match is public, fetching all users except creator");
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id")
        .neq("id", creatorId);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return;
      }

      eligibleProfiles = profiles;
    }

    if (!eligibleProfiles || eligibleProfiles.length === 0) {
      console.log("No eligible users found");
      return;
    }

    // Filter out users blocked by the organizer
    const blockedUsers = await getBlockedUsersForUser(creatorId);
    if (blockedUsers.length > 0) {
      eligibleProfiles = eligibleProfiles.filter(
        (p) => !blockedUsers.includes(p.id)
      );
      console.log(`After blocked user filter: ${eligibleProfiles.length} eligible users`);
    }

    if (eligibleProfiles.length === 0) {
      console.log("No eligible users after blocked user filter");
      return;
    }

    console.log(`Found ${eligibleProfiles.length} eligible users for notifications`);

    // Get all notification filters
    const { data: filters } = await supabase
      .from("notification_match_filters")
      .select("*");

    const filtersByUserId = new Map<string, NotificationFilter>();
    filters?.forEach((filter) => {
      console.log(`Loading filter for user ${filter.user_id}:`, filter);
      filtersByUserId.set(filter.user_id, filter);
    });
    console.log(`Total filters loaded: ${filtersByUserId.size}`);

    // Prepare notifications array
    const notifications = [];

    for (const profile of eligibleProfiles) {
      const filter = filtersByUserId.get(profile.id);

      if (!filter) {
        console.log(`User ${profile.id}: No filter found, creating notification`);
      } else {
        console.log(`User ${profile.id}: Checking filter...`, {
          location_enabled: filter.location_enabled,
          location_radius_km: filter.location_radius_km,
          group_ids: filter.group_ids,
        });
      }

      // Create notification if user has no filter OR match meets the filter criteria
      if (!filter || matchMeetsFilterCriteria(match, filter)) {
        console.log(`User ${profile.id}: Creating notification`);

        const message =
          match.venue_name && match.match_date
            ? `New match at ${match.venue_name} on ${format(
                new Date(match.match_date),
                "EEEE, MMMM d"
              )}`
            : match.match_date
            ? `New match on ${format(new Date(match.match_date), "EEEE, MMMM d")}`
            : "New match available";

        notifications.push({
          user_id: profile.id,
          type: "new_match",
          title: "New Match Available",
          message,
          link: `/community?match=${match.id}`,
          match_id: match.id,
          read: false,
          created_at: new Date().toISOString(),
        });
      } else {
        console.log(`User ${profile.id}: Notification NOT created (filtered out)`);
      }
    }

    console.log(`Creating ${notifications.length} notifications`);

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
      } else {
        console.log(`Successfully created ${notifications.length} notifications`);
      }
    }
  } catch (error) {
    console.error("Error in createMatchNotifications:", error);
  }
}

/**
 * Create notifications for existing participants when a new player joins a match
 *
 * @param matchId - The ID of the match
 * @param playerName - The name of the player who joined
 * @param newParticipantId - The user ID of the participant who just joined (won't receive notification)
 */
export async function createParticipantJoinedNotifications(
  matchId: string,
  playerName: string,
  newParticipantId: string
): Promise<void> {
  try {
    console.log(`Creating participant joined notifications for match ${matchId}`);

    // Get match details for the notification message
    const { data: match } = await supabase
      .from("matches")
      .select("venue_name, match_date, created_by")
      .eq("id", matchId)
      .single();

    // Get all current participants in this match (except the one who just joined)
    const { data: participants, error: participantsError } = await supabase
      .from("match_participants")
      .select("player_profile_id")
      .eq("match_id", matchId)
      .not("player_profile_id", "is", null);

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      return;
    }

    if (!participants || participants.length === 0) {
      console.log("No participants found to notify");
      return;
    }

    // Filter out the participant who just joined and get unique user IDs
    let uniqueUserIds = [
      ...new Set(
        participants
          .map((p) => p.player_profile_id)
          .filter((id) => id && id !== newParticipantId)
      ),
    ];

    // Filter out users blocked by the organizer
    if (match?.created_by) {
      const blockedUsers = await getBlockedUsersForUser(match.created_by);
      if (blockedUsers.length > 0) {
        uniqueUserIds = uniqueUserIds.filter((id) => !blockedUsers.includes(id));
      }
    }

    console.log(`Found ${uniqueUserIds.length} participants to notify`);

    if (uniqueUserIds.length === 0) {
      console.log("No other participants to notify");
      return;
    }

    // Prepare notifications
    const notifications = uniqueUserIds.map((userId) => {
      const message = match?.venue_name && match?.match_date
        ? `${playerName} reserved a spot for the match at ${match.venue_name} on ${format(
            new Date(match.match_date),
            "EEEE, MMMM d"
          )}`
        : match?.match_date
        ? `${playerName} reserved a spot for the match on ${format(
            new Date(match.match_date),
            "EEEE, MMMM d"
          )}`
        : `${playerName} reserved a spot for the match`;

      return {
        user_id: userId,
        type: "participant_joined",
        title: "Player Joined Match",
        message,
        link: `/community?match=${matchId}`,
        match_id: matchId,
        read: false,
        created_at: new Date().toISOString(),
      };
    });

    console.log(`Creating ${notifications.length} participant joined notifications`);

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting participant joined notifications:", insertError);
      } else {
        console.log(`Successfully created ${notifications.length} participant joined notifications`);
      }
    }
  } catch (error) {
    console.error("Error in createParticipantJoinedNotifications:", error);
  }
}

/**
 * Create notifications for existing participants when a player leaves a match
 *
 * @param matchId - The ID of the match
 * @param playerName - The name of the player who left
 * @param removedParticipantId - The user ID of the participant who just left (won't receive notification)
 */
export async function createParticipantLeftNotifications(
  matchId: string,
  playerName: string,
  removedParticipantId: string
): Promise<void> {
  try {
    console.log(`Creating participant left notifications for match ${matchId}`);

    // Get match details for the notification message
    const { data: match } = await supabase
      .from("matches")
      .select("venue_name, match_date, created_by")
      .eq("id", matchId)
      .single();

    // Get all current participants in this match (after the deletion)
    const { data: participants, error: participantsError } = await supabase
      .from("match_participants")
      .select("player_profile_id")
      .eq("match_id", matchId)
      .not("player_profile_id", "is", null);

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      return;
    }

    if (!participants || participants.length === 0) {
      console.log("No participants found to notify");
      return;
    }

    // Filter out the participant who just left and get unique user IDs
    let uniqueUserIds = [
      ...new Set(
        participants
          .map((p) => p.player_profile_id)
          .filter((id) => id && id !== removedParticipantId)
      ),
    ];

    // Filter out users blocked by the organizer
    if (match?.created_by) {
      const blockedUsers = await getBlockedUsersForUser(match.created_by);
      if (blockedUsers.length > 0) {
        uniqueUserIds = uniqueUserIds.filter((id) => !blockedUsers.includes(id));
      }
    }

    console.log(`Found ${uniqueUserIds.length} participants to notify`);

    if (uniqueUserIds.length === 0) {
      console.log("No other participants to notify");
      return;
    }

    // Prepare notifications
    const notifications = uniqueUserIds.map((userId) => {
      const message = match?.venue_name && match?.match_date
        ? `${playerName} canceled their spot for the match at ${match.venue_name} on ${format(
            new Date(match.match_date),
            "EEEE, MMMM d"
          )}`
        : match?.match_date
        ? `${playerName} canceled their spot for the match on ${format(
            new Date(match.match_date),
            "EEEE, MMMM d"
          )}`
        : `${playerName} canceled their spot for the match`;

      return {
        user_id: userId,
        type: "participant_left",
        title: "Player Left Match",
        message,
        link: `/community?match=${matchId}`,
        match_id: matchId,
        read: false,
        created_at: new Date().toISOString(),
      };
    });

    console.log(`Creating ${notifications.length} participant left notifications`);

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting participant left notifications:", insertError);
      } else {
        console.log(`Successfully created ${notifications.length} participant left notifications`);
      }
    }
  } catch (error) {
    console.error("Error in createParticipantLeftNotifications:", error);
  }
}

/**
 * Create notifications for the thought author when someone reacts to their thought
 *
 * @param thoughtId - The ID of the thought that received a reaction
 * @param matchId - The ID of the match (for navigation)
 * @param reactorName - The name of the person who reacted
 * @param reactorId - The user ID of the person who reacted (won't receive notification)
 * @param emoji - The emoji reaction
 */
export async function createThoughtReactionNotifications(
  thoughtId: string,
  matchId: string,
  reactorName: string,
  reactorId: string,
  emoji: string
): Promise<void> {
  try {
    console.log(`Creating reaction notification for thought ${thoughtId}`);

    // Get the thought to find the author
    const { data: thought, error: thoughtError } = await supabase
      .from("thoughts")
      .select("user_id, content")
      .eq("id", thoughtId)
      .single();

    if (thoughtError || !thought) {
      console.error("Error fetching thought:", thoughtError);
      return;
    }

    // Don't notify if the reactor is the author
    if (thought.user_id === reactorId) {
      console.log("Reactor is the author, not creating notification");
      return;
    }

    // Get match details for the notification message
    const { data: match } = await supabase
      .from("matches")
      .select("venue_name, match_date, created_by")
      .eq("id", matchId)
      .single();

    // Don't notify if the thought author is blocked by the organizer
    if (match?.created_by) {
      const blockedUsers = await getBlockedUsersForUser(match.created_by);
      if (blockedUsers.includes(thought.user_id)) {
        console.log("Thought author is blocked by organizer, not creating notification");
        return;
      }
    }

    // Truncate thought content if too long (max 50 characters)
    const truncatedThought = thought.content.length > 50
      ? thought.content.substring(0, 50) + "..."
      : thought.content;

    const matchInfo = match?.venue_name && match?.match_date
      ? `${match.venue_name} on ${format(new Date(match.match_date), "EEEE, MMMM d")}`
      : match?.match_date
      ? `on ${format(new Date(match.match_date), "EEEE, MMMM d")}`
      : "the match";

    const message = `${reactorName} reacted ${emoji} to: "${truncatedThought}" (${matchInfo})`;

    const notification = {
      user_id: thought.user_id,
      type: "thought_reaction",
      title: "New Reaction on Thought",
      message,
      link: `/community?match=${matchId}`,
      match_id: matchId,
      read: false,
      created_at: new Date().toISOString(),
    };

    console.log("Creating reaction notification:", notification);

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notification);

    if (insertError) {
      console.error("Error inserting reaction notification:", insertError);
    } else {
      console.log("Successfully created reaction notification");
    }
  } catch (error) {
    console.error("Error in createThoughtReactionNotifications:", error);
  }
}

/**
 * Create notifications for existing participants when a thought is added to a match
 *
 * @param matchId - The ID of the match
 * @param authorName - The name of the person who added the thought
 * @param authorId - The user ID of the person who added the thought (won't receive notification)
 * @param thoughtContent - The content of the thought that was added
 */
export async function createThoughtAddedNotifications(
  matchId: string,
  authorName: string,
  authorId: string,
  thoughtContent: string
): Promise<void> {
  try {
    console.log(`Creating thought added notifications for match ${matchId}`);

    // Get match details for the notification message
    const { data: match } = await supabase
      .from("matches")
      .select("venue_name, match_date, created_by")
      .eq("id", matchId)
      .single();

    // Get all current participants in this match
    const { data: participants, error: participantsError } = await supabase
      .from("match_participants")
      .select("player_profile_id")
      .eq("match_id", matchId)
      .not("player_profile_id", "is", null);

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      return;
    }

    if (!participants || participants.length === 0) {
      console.log("No participants found to notify");
      return;
    }

    // Filter out the author and get unique user IDs
    let uniqueUserIds = [
      ...new Set(
        participants
          .map((p) => p.player_profile_id)
          .filter((id) => id && id !== authorId)
      ),
    ];

    // Filter out users blocked by the organizer
    if (match?.created_by) {
      const blockedUsers = await getBlockedUsersForUser(match.created_by);
      if (blockedUsers.length > 0) {
        uniqueUserIds = uniqueUserIds.filter((id) => !blockedUsers.includes(id));
      }
    }

    console.log(`Found ${uniqueUserIds.length} participants to notify`);

    if (uniqueUserIds.length === 0) {
      console.log("No other participants to notify");
      return;
    }

    // Truncate thought content if too long (max 100 characters)
    const truncatedThought = thoughtContent.length > 100
      ? thoughtContent.substring(0, 100) + "..."
      : thoughtContent;

    // Prepare notifications
    const notifications = uniqueUserIds.map((userId) => {
      const matchInfo = match?.venue_name && match?.match_date
        ? `${match.venue_name} on ${format(new Date(match.match_date), "EEEE, MMMM d")}`
        : match?.match_date
        ? `on ${format(new Date(match.match_date), "EEEE, MMMM d")}`
        : "the match";

      const message = `${authorName}: "${truncatedThought}" (${matchInfo})`;

      return {
        user_id: userId,
        type: "thought_added",
        title: "New Thought Added",
        message,
        link: `/community?match=${matchId}`,
        match_id: matchId,
        read: false,
        created_at: new Date().toISOString(),
      };
    });

    console.log(`Creating ${notifications.length} thought added notifications`);

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting thought added notifications:", insertError);
      } else {
        console.log(`Successfully created ${notifications.length} thought added notifications`);
      }
    }
  } catch (error) {
    console.error("Error in createThoughtAddedNotifications:", error);
  }
}
