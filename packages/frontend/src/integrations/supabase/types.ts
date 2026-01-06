export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      enrollments: {
        Row: {
          allow_visible: boolean | null
          created_at: string
          enrollment_date: string
          event_id: string
          id: string
          remarks: string | null
          selected_add_ons: Json | null
          selected_price_option: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_visible?: boolean | null
          created_at?: string
          enrollment_date?: string
          event_id: string
          id?: string
          remarks?: string | null
          selected_add_ons?: Json | null
          selected_price_option: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_visible?: boolean | null
          created_at?: string
          enrollment_date?: string
          event_id?: string
          id?: string
          remarks?: string | null
          selected_add_ons?: Json | null
          selected_price_option?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          additional_options: Json | null
          city: string | null
          country: string | null
          created_at: string
          description: string
          end_date: string | null
          formatted_address: string | null
          full_description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          place_id: string | null
          postal_code: string | null
          prices: Json | null
          start_date: string
          street_name: string | null
          tags: string[] | null
          time: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          additional_options?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string
          description: string
          end_date?: string | null
          formatted_address?: string | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          place_id?: string | null
          postal_code?: string | null
          prices?: Json | null
          start_date: string
          street_name?: string | null
          tags?: string[] | null
          time?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          additional_options?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          formatted_address?: string | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          place_id?: string | null
          postal_code?: string | null
          prices?: Json | null
          start_date?: string
          street_name?: string | null
          tags?: string[] | null
          time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      healer_profiles: {
        Row: {
          bio: string | null
          company: string | null
          created_at: string | null
          email: string | null
          facebook: string | null
          full_bio: string | null
          instagram: string | null
          phone_number: string | null
          rating: number | null
          role: string | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string
          video: string | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          facebook?: string | null
          full_bio?: string | null
          instagram?: string | null
          phone_number?: string | null
          rating?: number | null
          role?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id: string
          video?: string | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          facebook?: string | null
          full_bio?: string | null
          instagram?: string | null
          phone_number?: string | null
          rating?: number | null
          role?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string
          video?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "healer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          formatted_address: string | null
          id: string
          is_healer: boolean | null
          last_name: string | null
          latitude: number | null
          longitude: number | null
          phone_number: string | null
          place_id: string | null
          postal_code: string | null
          street_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          formatted_address?: string | null
          id: string
          is_healer?: boolean | null
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          phone_number?: string | null
          place_id?: string | null
          postal_code?: string | null
          street_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          formatted_address?: string | null
          id?: string
          is_healer?: boolean | null
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          phone_number?: string | null
          place_id?: string | null
          postal_code?: string | null
          street_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      thoughts: {
        Row: {
          content: string
          created_at: string
          event_id: string | null
          healer_profile_id: string | null
          id: string
          parent_thought_id: string | null
          post_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          event_id?: string | null
          healer_profile_id?: string | null
          id?: string
          parent_thought_id?: string | null
          post_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          event_id?: string | null
          healer_profile_id?: string | null
          id?: string
          parent_thought_id?: string | null
          post_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thoughts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thoughts_parent_thought_id_fkey"
            columns: ["parent_thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thoughts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
