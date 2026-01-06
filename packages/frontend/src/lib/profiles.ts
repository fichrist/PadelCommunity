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
  is_healer: boolean;
  bio: string | null;
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
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateProfile:', error);
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
 * Get all healers (for healer directory)
 */
export async function getHealers(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_healer', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching healers:', error);
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
