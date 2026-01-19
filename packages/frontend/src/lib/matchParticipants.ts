import { supabase } from "@/integrations/supabase/client";

/**
 * Platform-agnostic utility functions for managing match participants
 * Can be used in both React Web and React Native apps
 */

interface Participant {
  id: string;
  playtomic_user_id: number | null;
  name: string;
  added_by_profile_id: string;
  [key: string]: any;
}

/**
 * Normalizes a string for comparison (lowercase, trim, single spaces)
 */
const normalizeString = (str: string): string => {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Step 1: Set playtomic_user_id on profiles based on participant names
 *
 * For each participant, tries to find a matching profile by name and sets
 * the playtomic_user_id on that profile if it doesn't already have one.
 *
 * @param participants - Array of participants from the match
 * @param matchCreatorId - User ID of the person who created the match
 */
export async function setPlaytomicUserIdOnProfiles(
  participants: Participant[],
  matchCreatorId: string
): Promise<void> {
  if (!participants || participants.length === 0) {
    console.log('No participants to process');
    return;
  }

  console.group('🔄 Step 1: Setting playtomic_user_id on profiles');
  console.log(`Processing ${participants.length} participants`);

  // Fetch all profiles once at the beginning
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, playtomic_user_id')
    .not('first_name', 'is', null)
    .not('last_name', 'is', null);

  if (!allProfiles || allProfiles.length === 0) {
    console.warn('⚠️ No profiles found in database');
    console.groupEnd();
    return;
  }

  console.log(`✅ Fetched ${allProfiles.length} profiles from database`);

  for (const participant of participants) {
    if (!participant.playtomic_user_id || !participant.name) {
      console.log(`⏭️ Skipping participant (missing data):`, { name: participant.name, playtomic_user_id: participant.playtomic_user_id });
      continue;
    }

    console.group(`👤 Processing: ${participant.name}`);
    console.log(`Playtomic User ID: ${participant.playtomic_user_id}`);

    // Filter profiles by matching name (first_name + last_name = participant.name)
    const normalizedParticipantName = normalizeString(participant.name);
    console.log(`🔍 Normalized name: "${normalizedParticipantName}"`);

    const matchingProfiles = allProfiles.filter(profile => {
      const displayName = `${profile.first_name} ${profile.last_name}`;
      const normalizedDisplayName = normalizeString(displayName);
      const matches = normalizedDisplayName === normalizedParticipantName;
      if (matches) {
        console.log(`  ✓ Match found: "${normalizedDisplayName}" (Profile ID: ${profile.id})`);
      }
      return matches;
    });

    console.log(`Found ${matchingProfiles.length} matching profile(s)`);

    if (matchingProfiles.length === 0) {
      console.warn(`⚠️ No matching profiles found`);
      console.groupEnd();
      continue;
    }

    let profileToUpdate = null;

    if (matchingProfiles.length === 1) {
      // Exactly one match - use it
      profileToUpdate = matchingProfiles[0];
      console.log(`✅ Single profile match - using Profile ID: ${profileToUpdate.id}`);
    } else if (matchingProfiles.length > 1) {
      // Multiple matches - filter by organizer (created_by)
      console.log(`🔀 Multiple profiles (${matchingProfiles.length}), filtering by match creator...`);
      const organizerMatches = matchingProfiles.filter(p => p.id === matchCreatorId);

      if (organizerMatches.length === 1) {
        profileToUpdate = organizerMatches[0];
        console.log(`✅ Filtered to organizer profile: ${profileToUpdate.id}`);
      } else if (organizerMatches.length === 0) {
        console.warn(`⚠️ No organizer match found, skipping`);
        console.groupEnd();
        continue;
      } else {
        console.warn(`⚠️ Still ${organizerMatches.length} matches after filtering, skipping`);
        console.groupEnd();
        continue;
      }
    }

    // Update the profile with playtomic_user_id if it doesn't already have one
    if (profileToUpdate) {
      if (profileToUpdate.playtomic_user_id) {
        console.log(`ℹ️ Profile already has playtomic_user_id: ${profileToUpdate.playtomic_user_id}`);
      } else {
        console.log(`💾 Setting playtomic_user_id on profile ${profileToUpdate.id}...`);

        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({ playtomic_user_id: participant.playtomic_user_id })
          .eq('id', profileToUpdate.id);

        if (updateProfileError) {
          console.error(`❌ Error updating profile:`, updateProfileError);
        } else {
          console.log(`✅ Successfully set playtomic_user_id on profile`);
        }
      }
    }
    console.groupEnd();
  }
  console.groupEnd();
}

/**
 * Step 2: Link participants to profiles based on playtomic_user_id
 *
 * For each participant with a playtomic_user_id, finds the matching profile
 * and sets the player_profile_id on the participant.
 *
 * @param participants - Array of participants from the match
 */
export async function linkParticipantsToProfiles(
  participants: Participant[]
): Promise<void> {
  if (!participants || participants.length === 0) {
    console.log('No participants to link');
    return;
  }

  console.group('🔗 Step 2: Linking participants to profiles');
  console.log(`Processing ${participants.length} participants`);

  for (const participant of participants) {
    if (!participant.playtomic_user_id) {
      console.log(`⏭️ Skipping ${participant.name} - no playtomic_user_id`);
      continue;
    }

    console.group(`🔗 Linking: ${participant.name}`);
    console.log(`Looking for profile with playtomic_user_id: ${participant.playtomic_user_id}`);

    // Find profile with matching playtomic_user_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('playtomic_user_id', participant.playtomic_user_id)
      .maybeSingle();

    if (profile) {
      console.log(`✅ Found profile: ${profile.id}`);

      // Update participant with player_profile_id
      const { error: updateError } = await supabase
        .from('match_participants')
        .update({ player_profile_id: profile.id })
        .eq('id', participant.id);

      if (updateError) {
        console.error(`❌ Error linking participant:`, updateError);
      } else {
        console.log(`✅ Successfully linked participant to profile ${profile.id}`);
      }
    } else {
      console.warn(`⚠️ No profile found with playtomic_user_id: ${participant.playtomic_user_id}`);
    }
    console.groupEnd();
  }
  console.groupEnd();
}

/**
 * Complete flow: Set playtomic_user_id on profiles and link participants
 *
 * This is the main function that should be called after inserting match participants.
 * It combines both steps in the correct order.
 *
 * @param participants - Array of participants from the match
 * @param matchCreatorId - User ID of the person who created the match
 */
export async function processMatchParticipants(
  participants: Participant[],
  matchCreatorId: string
): Promise<void> {
  await setPlaytomicUserIdOnProfiles(participants, matchCreatorId);
  await linkParticipantsToProfiles(participants);
}
