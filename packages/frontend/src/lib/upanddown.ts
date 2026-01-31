import { createFreshSupabaseClient } from "@/integrations/supabase/client";

export interface UpAndDownEvent {
  id: string;
  title: string;
  location: string;
  club_name: string | null;
  event_date: string;
  event_time: string | null;
  duration_minutes: number | null;
  price: number;
  max_participants: number | null;
  group_ids: string[];
  payment_link: string | null;
  created_by: string | null;
  created_at: string;
}

export interface UpAndDownEnrollment {
  id: string;
  event_id: string;
  user_id: string | null;
  name: string;
  email: string;
  partner_name: string | null;
  partner_email: string | null;
  total_price: number;
  created_at: string;
}

export async function fetchUpAndDownEvents(): Promise<UpAndDownEvent[]> {
  const client = createFreshSupabaseClient();
  const { data, error } = await client
    .from("upanddown_events")
    .select("*")
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Error fetching upanddown events:", error);
    return [];
  }

  return data || [];
}

export async function enrollForEvent(params: {
  eventId: string;
  userId: string | null;
  name: string;
  email: string;
  partnerName?: string;
  partnerEmail?: string;
  totalPrice: number;
}): Promise<{ success: boolean; error?: string }> {
  const client = createFreshSupabaseClient();

  const { error } = await client.from("upanddown_enrollments").insert({
    event_id: params.eventId,
    user_id: params.userId,
    name: params.name,
    email: params.email,
    partner_name: params.partnerName || null,
    partner_email: params.partnerEmail || null,
    total_price: params.totalPrice,
  });

  if (error) {
    console.error("Error enrolling:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function createUpAndDownEvent(params: {
  title: string;
  location: string;
  clubName: string;
  eventDate: string;
  eventTime: string;
  durationMinutes: number;
  price: number;
  maxParticipants: number | null;
  paymentLink: string;
  groupIds: string[];
  createdBy: string;
}): Promise<{ success: boolean; error?: string }> {
  const client = createFreshSupabaseClient();

  const { error } = await client.from("upanddown_events").insert({
    title: params.title,
    location: params.location,
    club_name: params.clubName,
    event_date: params.eventDate,
    event_time: params.eventTime,
    duration_minutes: params.durationMinutes,
    price: params.price,
    max_participants: params.maxParticipants,
    payment_link: params.paymentLink || null,
    group_ids: params.groupIds,
    created_by: params.createdBy,
  });

  if (error) {
    console.error("Error creating upanddown event:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function fetchGroups(): Promise<{ id: string; name: string; group_type: string }[]> {
  const client = createFreshSupabaseClient();
  const { data, error } = await client
    .from("groups")
    .select("id, name, group_type")
    .eq("group_type", "Ranked")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching groups:", error);
    return [];
  }

  return data || [];
}

export async function getUserEnrollmentForEvent(
  userId: string,
  eventId: string
): Promise<UpAndDownEnrollment | null> {
  const client = createFreshSupabaseClient();
  const { data, error } = await client
    .from("upanddown_enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) {
    console.error("Error checking enrollment:", error);
    return null;
  }

  return data;
}
