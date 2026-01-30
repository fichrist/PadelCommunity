// =====================================================
// ADDRESS HELPER FUNCTIONS
// =====================================================
// Helper functions for working with addresses in your React app
// NEW: Addresses are now referenced from profiles via address_id
// =====================================================

import { getUserIdFromStorage, getDataClient } from "@/integrations/supabase/client";

export interface Address {
  id: string;
  place_id?: string;
  formatted_address?: string;
  street_number?: string;
  street_name?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  address_type: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch the current user's address (via their profile's address_id)
 */
export async function getCurrentUserAddress(): Promise<Address | null> {
  try {
    // Get user ID synchronously from localStorage (never hangs)
    const userId = getUserIdFromStorage();

    if (!userId) {
      return null;
    }

    // Get the user's profile to find their address_id
    const { data: profile, error: profileError } = await getDataClient()
      .from('profiles')
      .select('address_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.address_id) {
      return null;
    }

    // Fetch the address using the address_id
    const { data, error } = await (getDataClient() as any)
      .from('addresses')
      .select('*')
      .eq('id', profile.address_id)
      .single();

    if (error) {
      console.error('Error fetching address:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentUserAddress:', error);
    return null;
  }
}

/**
 * Save or update the user's address and link it to their profile
 */
export async function saveAddress(addressData: Partial<Address>): Promise<boolean> {
  try {
    console.log("saveAddress called with:", addressData);

    // Get user ID synchronously from localStorage (never hangs)
    const userId = getUserIdFromStorage();
    console.log("Current user:", userId?.substring(0, 8) || null);

    if (!userId) {
      console.error('No authenticated user');
      throw new Error('No authenticated user');
    }

    // Get the user's profile to check if they already have an address
    const { data: profile, error: profileError } = await getDataClient()
      .from('profiles')
      .select('address_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return false;
    }

    let addressId: string;

    if (profile.address_id) {
      // Update existing address
      console.log("Updating existing address with ID:", profile.address_id);
      const updateData = {
        ...addressData,
        updated_at: new Date().toISOString()
      };
      console.log("Update data:", updateData);
      
      const { data, error } = await (getDataClient() as any)
        .from('addresses')
        .update(updateData)
        .eq('id', profile.address_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating address:', error);
        return false;
      }
      console.log("Address updated successfully:", data);
      addressId = profile.address_id;
    } else {
      // Insert new address
      console.log("Inserting new address");
      const insertData = {
        ...addressData,
        is_default: true,
        address_type: 'primary'
      };
      console.log("Insert data:", insertData);
      
      const { data, error } = await (getDataClient() as any)
        .from('addresses')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error inserting address:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return false;
      }
      console.log("Address inserted successfully:", data);
      addressId = data.id;

      // Link the new address to the profile
      const { error: linkError } = await getDataClient()
        .from('profiles')
        .update({ address_id: addressId })
        .eq('id', userId);

      if (linkError) {
        console.error('Error linking address to profile:', linkError);
        return false;
      }
      console.log("Address linked to profile successfully");
    }

    return true;
  } catch (error) {
    console.error('Error in saveAddress:', error);
    return false;
  }
}

/**
 * Parse Google Places address components
 */
export function parseAddressComponents(place: any): Partial<Address> {
  const addressData: Partial<Address> = {
    formatted_address: place.formatted_address,
    place_id: place.place_id
  };

  // Extract coordinates
  if (place.geometry?.location) {
    addressData.latitude = typeof place.geometry.location.lat === 'function' 
      ? place.geometry.location.lat() 
      : place.geometry.location.lat;
    addressData.longitude = typeof place.geometry.location.lng === 'function'
      ? place.geometry.location.lng()
      : place.geometry.location.lng;
  }

  // Parse address components
  if (place.address_components) {
    place.address_components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        addressData.street_number = component.long_name;
      }
      if (types.includes('route')) {
        addressData.street_name = component.long_name;
      }
      if (types.includes('locality')) {
        addressData.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        addressData.state = component.long_name;
      }
      if (types.includes('postal_code')) {
        addressData.postal_code = component.long_name;
      }
      if (types.includes('country')) {
        addressData.country = component.long_name;
        addressData.country_code = component.short_name;
      }
    });
  }

  return addressData;
}

/**
 * Get a user's address by user ID (via their profile's address_id)
 */
export async function getUserAddress(userId: string): Promise<Address | null> {
  try {
    // Get the user's profile to find their address_id
    const { data: profile, error: profileError } = await getDataClient()
      .from('profiles')
      .select('address_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.address_id) {
      return null;
    }

    // Fetch the address using the address_id
    const { data, error } = await (getDataClient() as any)
      .from('addresses')
      .select('*')
      .eq('id', profile.address_id)
      .single();

    if (error) {
      console.error('Error fetching user address:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserAddress:', error);
    return null;
  }
}

/**
 * Format address for display (city, country)
 */
export function formatAddressForDisplay(address: Address | null): string {
  if (!address) return "Location not set";
  
  const parts = [address.city, address.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : "Location not set";
}
