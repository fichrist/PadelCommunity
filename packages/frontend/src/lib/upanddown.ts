import { createFreshSupabaseClient } from "@/integrations/supabase/client";

export interface TpPlayer {
  name: string;
  ranking: string | null;
  club: string | null;
  userId: string;
}

export async function lookForTpPlayers(
  firstName: string,
  lastName: string
): Promise<TpPlayer[]> {
  const azureFunctionUrl =
    import.meta.env.VITE_AZURE_FUNCTION_URL || "http://localhost:7071";

  const response = await fetch(`${azureFunctionUrl}/api/lookForTpPlayers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to look up TP members");
  }

  return data.data.players || [];
}

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
  email: string | null;
  partner_name: string | null;
  partner_email: string | null;
  phone_number: string | null;
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
  partnerName?: string;
  phoneNumber: string;
  totalPrice: number;
  tpAccountIdPlayer1?: string;
  tpAccountIdPlayer2?: string;
}): Promise<{ success: boolean; error?: string }> {
  const client = createFreshSupabaseClient();

  const { error } = await client.from("upanddown_enrollments").insert({
    event_id: params.eventId,
    user_id: params.userId,
    name: params.name,
    partner_name: params.partnerName || null,
    phone_number: params.phoneNumber,
    total_price: params.totalPrice,
    tp_account_id_player1: params.tpAccountIdPlayer1 || null,
    tp_account_id_player2: params.tpAccountIdPlayer2 || null,
  });

  if (error) {
    console.error("Error enrolling:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function checkDuplicateTpAccounts(
  eventId: string,
  tpAccountId1: string,
  tpAccountId2: string
): Promise<string[]> {
  const client = createFreshSupabaseClient();
  const ids = [tpAccountId1, tpAccountId2];

  const { data, error } = await client
    .from("upanddown_enrollments")
    .select("tp_account_id_player1, tp_account_id_player2")
    .eq("event_id", eventId);

  if (error || !data) return [];

  const existingIds = new Set<string>();
  for (const row of data) {
    if (row.tp_account_id_player1) existingIds.add(row.tp_account_id_player1);
    if (row.tp_account_id_player2) existingIds.add(row.tp_account_id_player2);
  }

  return ids.filter((id) => existingIds.has(id));
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

export async function fetchEnrollmentCounts(eventIds: string[]): Promise<Record<string, number>> {
  if (eventIds.length === 0) return {};
  const client = createFreshSupabaseClient();
  const { data, error } = await client
    .from("upanddown_enrollments")
    .select("event_id")
    .in("event_id", eventIds);

  if (error) {
    console.error("Error fetching enrollment counts:", error);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.event_id] = (counts[row.event_id] || 0) + 2; // each enrollment = 2 players
  }
  return counts;
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

export async function fetchGroupsByIds(
  groupIds: string[]
): Promise<{ id: string; name: string; ranking_level: string | null }[]> {
  if (groupIds.length === 0) return [];
  const client = createFreshSupabaseClient();
  const { data, error } = await client
    .from("groups")
    .select("id, name, ranking_level")
    .in("id", groupIds);

  if (error) {
    console.error("Error fetching groups by IDs:", error);
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
