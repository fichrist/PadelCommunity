// =====================================================
// PROFILE HELPER FUNCTIONS
// =====================================================
// Helper functions for working with profiles in your React app
// =====================================================

import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  place_id: string | null;
  street_name: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  formatted_address: string | null;
  latitude: number | null;
  longitude: number | null;
  ranking: string | null;
  tp_membership_number: string | null;
  tp_user_id: number | null;
  playtomic_user_id: string | null;
  bio: string | null;
  intentions: string[] | null;
  group_ids: string[] | null;
  allowed_groups: string[] | null;
  filtered_groups: string[] | null;
  filtered_address: string | null;
  filtered_latitude: number | null;
  filtered_longitude: number | null;
  filtered_radius_km: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch the current user's profile
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentProfile:', error);
    return null;
  }
}

/**
 * Fetch a profile by user ID (for viewing other users)
 */
export async function getProfileById(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getProfileById:', error);
    return null;
  }
}

/**
 * Update the current user's profile
 */
export async function updateProfile(updates: Partial<Profile>): Promise<boolean> {
  console.log('[updateProfile] Starting update with:', updates);

  try {
    console.log('[updateProfile] About to call getUser...');

    // Try calling getUser directly
    const authResponse = await supabase.auth.getUser();

    console.log('[updateProfile] getUser completed');
    console.log('[updateProfile] Auth response:', authResponse);

    const user = authResponse?.data?.user;

    if (!user) {
      console.error('[updateProfile] No authenticated user found');
      console.error('[updateProfile] Full auth response:', authResponse);
      throw new Error('No authenticated user');
    }

    console.log('[updateProfile] User ID:', user.id);

    // If ranking is being updated, automatically update allowed_groups
    if (updates.ranking) {
      console.log('[updateProfile] Ranking update detected, updating allowed_groups...');

      // Fetch all ranked groups
      const { data: rankedGroups, error: groupsError } = await supabase
        .from('groups')
        .select('id, ranking_level')
        .eq('group_type', 'Ranked');

      if (groupsError) {
        console.error('[updateProfile] Error fetching ranked groups:', groupsError);
      } else if (rankedGroups) {
        // Parse user's ranking to get numeric value (e.g., "P300" -> 300)
        const userRankingMatch = updates.ranking.match(/(\d+)/);
        const userRankingValue = userRankingMatch ? parseInt(userRankingMatch[0]) : null;

        console.log('[updateProfile] User ranking value:', userRankingValue);

        // Find groups where the user's ranking falls within the group's range
        const matchingGroupIds = rankedGroups
          .filter(group => {
            if (!group.ranking_level || !userRankingValue) return false;

            // Extract min and max from ranking_level (e.g., "P200-P300" -> [200, 300])
            const rangeMatch = group.ranking_level.match(/(\d+)-.*?(\d+)/);
            if (!rangeMatch) return false;

            const minRank = parseInt(rangeMatch[1]);
            const maxRank = parseInt(rangeMatch[2]);

            // Check if user's ranking falls within this range (inclusive)
            const isInRange = userRankingValue >= minRank && userRankingValue <= maxRank;

            console.log(`[updateProfile] Group ${group.id} (${group.ranking_level}): ${minRank}-${maxRank}, user: ${userRankingValue}, in range: ${isInRange}`);

            return isInRange;
          })
          .map(group => group.id);

        console.log('[updateProfile] Matching group IDs for ranking:', matchingGroupIds);

        // Get current profile to preserve existing General groups
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('group_ids')
          .eq('id', user.id)
          .single();

        // Preserve General groups (those not in ranked groups list)
        const rankedGroupIds = rankedGroups.map(g => g.id);
        const currentGeneralGroups = (currentProfile?.group_ids || []).filter(
          (groupId: string) => !rankedGroupIds.includes(groupId)
        );

        // Combine General groups with new matching ranked groups
        const newAllowedGroups = [...currentGeneralGroups, ...matchingGroupIds];

        console.log('[updateProfile] Setting allowed_groups to:', newAllowedGroups);
        updates.allowed_groups = newAllowedGroups as any;
      }
    }

    console.log('[updateProfile] About to update database...');

    const updateResponse = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select();

    console.log('[updateProfile] Database update completed');

    if (updateResponse.error) {
      console.error('[updateProfile] Database error:', updateResponse.error);
      console.error('[updateProfile] Error details:', JSON.stringify(updateResponse.error, null, 2));
      return false;
    }

    console.log('[updateProfile] Update successful, returned data:', updateResponse.data);
    return true;
  } catch (error) {
    console.error('[updateProfile] Caught exception:', error);
    console.error('[updateProfile] Exception stack:', error instanceof Error ? error.stack : 'No stack trace');
    return false;
  }
}

/**
 * Upload a profile picture and update the profile
 */
export async function uploadAvatar(file: File): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const avatarUrl = data.publicUrl;

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile with avatar URL:', updateError);
      return null;
    }

    return avatarUrl;
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    return null;
  }
}

/**
 * Delete the current user's avatar
 */
export async function deleteAvatar(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Get current profile to find avatar URL
    const profile = await getCurrentProfile();
    
    if (!profile?.avatar_url) {
      return true; // Nothing to delete
    }

    // Extract file path from URL
    const urlParts = profile.avatar_url.split('/avatars/');
    if (urlParts.length < 2) {
      return false;
    }
    const filePath = urlParts[1];

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (deleteError) {
      console.error('Error deleting avatar from storage:', deleteError);
      return false;
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile to remove avatar URL:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAvatar:', error);
    return false;
  }
}

/**
 * Get all users (formerly healers directory - deprecated)
 */
export async function getHealers(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getHealers:', error);
    return [];
  }
}

/**
 * Search profiles by name
 */
export async function searchProfiles(query: string): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`display_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error searching profiles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchProfiles:', error);
    return [];
  }
}
