import { supabase } from "@/integrations/supabase/client";

export interface Thought {
  id?: string;
  post_id?: string | null;
  event_id?: string | null;
  healer_profile_id?: string | null;
  match_id?: string | null;
  user_id?: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a new thought for a post (optionally as a reply to another thought)
 */
export async function createThought(postId: string, content: string, parentThoughtId?: string): Promise<{ success: boolean; thoughtId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from('thoughts')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        parent_thought_id: parentThoughtId || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error("Error creating thought:", error);
      return { success: false, error: error.message };
    }

    return { success: true, thoughtId: data.id };
  } catch (error: any) {
    console.error("Unexpected error creating thought:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

/**
 * Create a new thought for an event (optionally as a reply to another thought)
 */
export async function createEventThought(eventId: string, content: string, parentThoughtId?: string): Promise<{ success: boolean; thoughtId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from('thoughts')
      .insert({
        event_id: eventId,
        user_id: user.id,
        content: content.trim(),
        parent_thought_id: parentThoughtId || null,
      } as any)
      .select('id')
      .single();

    if (error) {
      console.error("Error creating event thought:", error);
      return { success: false, error: error.message };
    }

    return { success: true, thoughtId: data.id };
  } catch (error: any) {
    console.error("Unexpected error creating event thought:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

/**
 * Create a new thought for a healer profile (optionally as a reply to another thought)
 */
export async function createHealerProfileThought(healerProfileId: string, content: string, parentThoughtId?: string): Promise<{ success: boolean; thoughtId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from('thoughts')
      .insert({
        healer_profile_id: healerProfileId,
        user_id: user.id,
        content: content.trim(),
        parent_thought_id: parentThoughtId || null,
      } as any)
      .select('id')
      .single();

    if (error) {
      console.error("Error creating healer profile thought:", error);
      return { success: false, error: error.message };
    }

    return { success: true, thoughtId: data.id };
  } catch (error: any) {
    console.error("Unexpected error creating healer profile thought:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

/**
 * Create a new thought for a match (optionally as a reply to another thought)
 */
export async function createMatchThought(matchId: string, content: string, parentThoughtId?: string): Promise<{ success: boolean; thoughtId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from('thoughts')
      .insert({
        match_id: matchId,
        user_id: user.id,
        content: content.trim(),
        parent_thought_id: parentThoughtId || null,
      } as any)
      .select('id')
      .single();

    if (error) {
      console.error("Error creating match thought:", error);
      return { success: false, error: error.message };
    }

    return { success: true, thoughtId: data.id };
  } catch (error: any) {
    console.error("Unexpected error creating match thought:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

/**
 * Get all thoughts for a match with author profile information
 */
export async function getThoughtsByMatchId(matchId: string): Promise<any[]> {
  try {
    const { data: thoughts, error: thoughtsError } = await (supabase
      .from('thoughts')
      .select('id, content, created_at, user_id, parent_thought_id') as any)
      .eq('match_id', matchId)
      .order('created_at', { ascending: false });

    if (thoughtsError) {
      console.error("Error fetching match thoughts:", thoughtsError);
      return [];
    }

    if (!thoughts || thoughts.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(thoughts.map((t: any) => t.user_id))] as string[];

    // Fetch profiles for all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, display_name, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Create a map of user_id to profile
    const profileMap = new Map();
    (profiles || []).forEach((profile: any) => {
      profileMap.set(profile.id, profile);
    });

    // Transform data to match ThoughtsModal expectations
    const transformedThoughts = thoughts.map((thought: any) => {
      const profile = profileMap.get(thought.user_id);
      const authorName = profile?.display_name || profile?.first_name || 'Anonymous';

      // Calculate time ago
      const createdDate = new Date(thought.created_at || '');
      const now = new Date();
      const diffMs = now.getTime() - createdDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeAgo = 'Just now';
      if (diffDays > 0) {
        timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMins > 0) {
        timeAgo = `${diffMins} min ago`;
      }

      return {
        id: thought.id,
        user_id: thought.user_id,
        parent_thought_id: thought.parent_thought_id,
        author: {
          name: authorName,
          avatar: profile?.avatar_url
        },
        content: thought.content,
        likes: 0,
        timeAgo: timeAgo
      };
    });

    return transformedThoughts;
  } catch (error) {
    console.error("Unexpected error fetching match thoughts:", error);
    return [];
  }
}

/**
 * Get all thoughts for a healer profile with author profile information
 */
export async function getThoughtsByHealerProfileId(healerProfileId: string): Promise<any[]> {
  try {
    const { data: thoughts, error: thoughtsError } = await (supabase
      .from('thoughts')
      .select('id, content, created_at, user_id, parent_thought_id') as any)
      .eq('healer_profile_id', healerProfileId)
      .order('created_at', { ascending: false });

    if (thoughtsError) {
      console.error("Error fetching healer profile thoughts:", thoughtsError);
      return [];
    }

    if (!thoughts || thoughts.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(thoughts.map((t: any) => t.user_id))] as string[];

    // Fetch profiles for all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, display_name, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Create a map of user_id to profile
    const profileMap = new Map();
    (profiles || []).forEach((profile: any) => {
      profileMap.set(profile.id, profile);
    });

    // Transform data to match ThoughtsModal expectations
    const transformedThoughts = thoughts.map((thought: any) => {
      const profile = profileMap.get(thought.user_id);
      const authorName = profile?.display_name || profile?.first_name || 'Anonymous';
      
      // Calculate time ago
      const createdDate = new Date(thought.created_at || '');
      const now = new Date();
      const diffMs = now.getTime() - createdDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      let timeAgo = 'Just now';
      if (diffDays > 0) {
        timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMins > 0) {
        timeAgo = `${diffMins} min ago`;
      }
      
      return {
        id: thought.id,
        user_id: thought.user_id,
        parent_thought_id: thought.parent_thought_id,
        author: {
          name: authorName,
          avatar: profile?.avatar_url
        },
        content: thought.content,
        likes: 0,
        timeAgo: timeAgo
      };
    });

    return transformedThoughts;
  } catch (error) {
    console.error("Unexpected error fetching healer profile thoughts:", error);
    return [];
  }
}

/**
 * Get all thoughts for an event with author profile information
 */
export async function getThoughtsByEventId(eventId: string): Promise<any[]> {
  try {
    const { data: thoughts, error: thoughtsError } = await (supabase
      .from('thoughts')
      .select('id, content, created_at, user_id, parent_thought_id') as any)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (thoughtsError) {
      console.error("Error fetching event thoughts:", thoughtsError);
      return [];
    }

    if (!thoughts || thoughts.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(thoughts.map((t: any) => t.user_id))] as string[];

    // Fetch profiles for all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, display_name, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Create a map of user_id to profile
    const profileMap = new Map();
    (profiles || []).forEach((profile: any) => {
      profileMap.set(profile.id, profile);
    });

    // Transform data to match ThoughtsModal expectations
    const transformedThoughts = thoughts.map((thought: any) => {
      const profile = profileMap.get(thought.user_id);
      const authorName = profile?.display_name || profile?.first_name || 'Anonymous';
      
      // Calculate time ago
      const createdDate = new Date(thought.created_at || '');
      const now = new Date();
      const diffMs = now.getTime() - createdDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      let timeAgo = 'Just now';
      if (diffDays > 0) {
        timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMins > 0) {
        timeAgo = `${diffMins} min ago`;
      }
      
      return {
        id: thought.id,
        user_id: thought.user_id,
        parent_thought_id: thought.parent_thought_id,
        author: {
          name: authorName,
          avatar: profile?.avatar_url
        },
        content: thought.content,
        likes: 0,
        timeAgo: timeAgo
      };
    });

    return transformedThoughts;
  } catch (error) {
    console.error("Unexpected error fetching event thoughts:", error);
    return [];
  }
}

/**
 * Get all thoughts for a post with author profile information
 */
export async function getThoughtsByPostId(postId: string): Promise<any[]> {
  try {
    // First, fetch thoughts including parent_thought_id
    const { data: thoughts, error: thoughtsError } = await supabase
      .from('thoughts')
      .select('id, content, created_at, user_id, parent_thought_id')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (thoughtsError) {
      console.error("Error fetching thoughts:", thoughtsError);
      return [];
    }

    if (!thoughts || thoughts.length === 0) {
      console.log("No thoughts found for post:", postId);
      return [];
    }

    console.log("Fetched thoughts from database:", thoughts);

    // Get unique user IDs
    const userIds = [...new Set(thoughts.map(t => t.user_id))];

    // Fetch profiles for all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, display_name, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    console.log("Fetched profiles:", profiles);

    // Create a map of user_id to profile
    const profileMap = new Map();
    (profiles || []).forEach(profile => {
      profileMap.set(profile.id, profile);
    });

    // Transform data to match ThoughtsModal expectations
    const transformedThoughts = thoughts.map((thought: any) => {
      const profile = profileMap.get(thought.user_id);
      const authorName = profile?.display_name || profile?.first_name || 'Anonymous';
      
      // Calculate time ago
      const createdDate = new Date(thought.created_at || '');
      const now = new Date();
      const diffMs = now.getTime() - createdDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      let timeAgo = 'Just now';
      if (diffDays > 0) {
        timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMins > 0) {
        timeAgo = `${diffMins} min ago`;
      }
      
      return {
        id: thought.id,
        user_id: thought.user_id,
        parent_thought_id: thought.parent_thought_id,
        author: {
          name: authorName,
          avatar: profile?.avatar_url
        },
        content: thought.content,
        likes: 0, // TODO: implement likes functionality
        timeAgo: timeAgo
      };
    });

    console.log("Transformed thoughts:", transformedThoughts);
    return transformedThoughts;
  } catch (error) {
    console.error("Unexpected error fetching thoughts:", error);
    return [];
  }
}

/**
 * Get thoughts by user
 */
export async function getUserThoughts(userId: string): Promise<Thought[]> {
  try {
    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user thoughts:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching user thoughts:", error);
    return [];
  }
}

/**
 * Update a thought
 */
export async function updateThought(thoughtId: string, content: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('thoughts')
      .update({
        content: content.trim(),
      })
      .eq('id', thoughtId);

    if (error) {
      console.error("Error updating thought:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error updating thought:", error);
    return false;
  }
}

/**
 * Delete a thought
 */
export async function deleteThought(thoughtId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('thoughts')
      .delete()
      .eq('id', thoughtId);

    if (error) {
      console.error("Error deleting thought:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting thought:", error);
    return false;
  }
}
