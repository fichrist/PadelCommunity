import { supabase } from "@/integrations/supabase/client";

export interface EventData {
  title: string;
  description: string;
  full_description?: string;
  city?: string;
  street_name?: string;
  postal_code?: string;
  country?: string;
  formatted_address?: string;
  place_id?: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date?: string;
  time?: string;
  prices?: { text: string; amount: string }[];
  tags?: string[];
  intentions?: string[];
  additional_options?: { name: string; price: string; description: string }[];
  image_url?: string;
  video_url?: string;
}

export const createEvent = async (eventData: EventData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No user logged in");
      return null;
    }

    const { data, error } = await (supabase as any)
      .from('events')
      .insert({
        user_id: user.id,
        title: eventData.title,
        description: eventData.description,
        full_description: eventData.full_description || null,
        city: eventData.city || null,
        street_name: eventData.street_name || null,
        postal_code: eventData.postal_code || null,
        country: eventData.country || null,
        formatted_address: eventData.formatted_address || null,
        place_id: eventData.place_id || null,
        latitude: eventData.latitude || null,
        longitude: eventData.longitude || null,
        start_date: eventData.start_date,
        end_date: eventData.end_date || null,
        time: eventData.time || null,
        prices: eventData.prices || [],
        tags: eventData.tags || [],
        intentions: eventData.intentions || [],
        additional_options: eventData.additional_options || [],
        image_url: eventData.image_url || null,
        video_url: eventData.video_url || null
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in createEvent:", error);
    return null;
  }
};

export const updateEvent = async (eventId: string, eventData: Partial<EventData>) => {
  try {
    const { data, error } = await (supabase as any)
      .from('events')
      .update({
        title: eventData.title,
        description: eventData.description,
        full_description: eventData.full_description,
        city: eventData.city,
        street_name: eventData.street_name,
        postal_code: eventData.postal_code,
        country: eventData.country,
        formatted_address: eventData.formatted_address,
        place_id: eventData.place_id,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        start_date: eventData.start_date,
        end_date: eventData.end_date,
        time: eventData.time,
        prices: eventData.prices,
        tags: eventData.tags,
        intentions: eventData.intentions,
        additional_options: eventData.additional_options,
        image_url: eventData.image_url,
        video_url: eventData.video_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error("Error updating event:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in updateEvent:", error);
    return null;
  }
};

export const getEventById = async (eventId: string) => {
  try {
    const { data, error } = await (supabase as any)
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getEventById:", error);
    return null;
  }
};

export const getUserEvents = async (userId: string) => {
  try {
    const { data, error } = await (supabase as any)
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user events:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserEvents:", error);
    return [];
  }
};

export const getAllEvents = async () => {
  try {
    // Fetch events with thought counts
    const { data, error } = await (supabase as any)
      .from('events')
      .select(`
        *,
        thoughts:thoughts(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching all events:", error);
      return [];
    }

    // Transform the data to include thought count
    const eventsWithCounts = (data || []).map((event: any) => ({
      ...event,
      thoughts_count: event.thoughts?.[0]?.count || 0
    }));

    return eventsWithCounts;
  } catch (error) {
    console.error("Error in getAllEvents:", error);
    return [];
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    const { error } = await (supabase as any)
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error("Error deleting event:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    return false;
  }
};
