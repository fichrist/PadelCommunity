import { supabase } from "@/integrations/supabase/client";

export interface Thought {
  id?: string;
  post_id: string;
  user_id?: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a new thought for a post
 */
export async function createThought(postId: string, content: string): Promise<{ success: boolean; thoughtId?: string; error?: string }> {
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
 * Get all thoughts for a post
 */
export async function getThoughtsByPostId(postId: string): Promise<Thought[]> {
  try {
    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching thoughts:", error);
      return [];
    }

    return data || [];
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
