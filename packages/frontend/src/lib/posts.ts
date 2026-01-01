import { supabase } from "@/integrations/supabase/client";

export interface Post {
  id?: string;
  user_id?: string;
  title: string;
  content: string;
  url?: string;
  tags?: string[];
  image_url?: string;
  video_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a new post
 */
export async function createPost(post: Post): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: post.title,
        content: post.content,
        url: post.url || null,
        tags: post.tags || [],
        image_url: post.image_url || null,
        video_url: post.video_url || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return { success: false, error: error.message };
    }

    return { success: true, postId: data.id };
  } catch (error: any) {
    console.error("Unexpected error creating post:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

/**
 * Get all posts (ordered by most recent)
 */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching posts:", error);
    return [];
  }
}

/**
 * Get all posts with author profiles and thoughts count
 */
export async function getPostsWithDetails(): Promise<any[]> {
  try {
    // First, fetch all posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return [];
    }

    if (!posts || posts.length === 0) return [];

    // Fetch profiles and thoughts count for each post
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        // Fetch profile - use maybeSingle to avoid errors if not found
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, display_name, avatar_url, is_healer, bio')
          .eq('id', post.user_id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile for user", post.user_id, ":", profileError);
        }

        // Fetch thoughts count
        const { count, error: thoughtsError } = await supabase
          .from('thoughts')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        if (thoughtsError) {
          console.error("Error fetching thoughts count:", thoughtsError);
        }

        return {
          ...post,
          thoughts_count: count || 0,
          author: profile || null,
        };
      })
    );

    return postsWithDetails;
  } catch (error) {
    console.error("Unexpected error fetching posts with details:", error);
    return [];
  }
}

/**
 * Get posts by user
 */
export async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user posts:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching user posts:", error);
    return [];
  }
}

/**
 * Update a post
 */
export async function updatePost(postId: string, updates: Partial<Post>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .update({
        title: updates.title,
        content: updates.content,
        url: updates.url,
        tags: updates.tags,
        image_url: updates.image_url,
        video_url: updates.video_url,
      })
      .eq('id', postId);

    if (error) {
      console.error("Error updating post:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error updating post:", error);
    return false;
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error("Error deleting post:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting post:", error);
    return false;
  }
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadPostImage(file: File): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `post-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Unexpected error uploading image:", error);
    return null;
  }
}

/**
 * Upload video to Supabase Storage
 */
export async function uploadPostVideo(file: File): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `post-videos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading video:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Unexpected error uploading video:", error);
    return null;
  }
}
