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
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string | null
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
          intentions: string[] | null
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
          intentions?: string[] | null
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
          intentions?: string[] | null
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
      intentions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      match_participants: {
        Row: {
          added_by_profile_id: string | null
          created_at: string
          gender: string | null
          id: string
          level_confidence: number | null
          level_value: number | null
          match_id: string
          name: string
          payment_status: string | null
          playtomic_user_id: string | null
          price: string | null
          registration_date: string | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          added_by_profile_id?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          level_confidence?: number | null
          level_value?: number | null
          match_id: string
          name: string
          payment_status?: string | null
          playtomic_user_id?: string | null
          price?: string | null
          registration_date?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          added_by_profile_id?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          level_confidence?: number | null
          level_value?: number | null
          match_id?: string
          name?: string
          payment_status?: string | null
          playtomic_user_id?: string | null
          price?: string | null
          registration_date?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participants_profile_id_fkey"
            columns: ["added_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          city: string | null
          court_number: string | null
          created_at: string
          created_by: string
          duration: number | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          match_date: string | null
          match_levels: Database["public"]["Enums"]["match_level"][] | null
          match_time: string | null
          match_type: string | null
          notes: string | null
          organizer_name: string | null
          players_registered: number | null
          price_per_person: number | null
          status: string | null
          surface_type: string | null
          total_price: number | null
          total_spots: number | null
          updated_at: string
          url: string
          venue_name: string | null
        }
        Insert: {
          city?: string | null
          court_number?: string | null
          created_at?: string
          created_by: string
          duration?: number | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          match_date?: string | null
          match_levels?: Database["public"]["Enums"]["match_level"][] | null
          match_time?: string | null
          match_type?: string | null
          notes?: string | null
          organizer_name?: string | null
          players_registered?: number | null
          price_per_person?: number | null
          status?: string | null
          surface_type?: string | null
          total_price?: number | null
          total_spots?: number | null
          updated_at?: string
          url: string
          venue_name?: string | null
        }
        Update: {
          city?: string | null
          court_number?: string | null
          created_at?: string
          created_by?: string
          duration?: number | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          match_date?: string | null
          match_levels?: Database["public"]["Enums"]["match_level"][] | null
          match_time?: string | null
          match_type?: string | null
          notes?: string | null
          organizer_name?: string | null
          players_registered?: number | null
          price_per_person?: number | null
          status?: string | null
          surface_type?: string | null
          total_price?: number | null
          total_spots?: number | null
          updated_at?: string
          url?: string
          venue_name?: string | null
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
          intentions: string[] | null
          last_name: string | null
          latitude: number | null
          longitude: number | null
          phone_number: string | null
          place_id: string | null
          playtomic_user_id: string | null
          postal_code: string | null
          ranking: string | null
          street_name: string | null
          tp_membership_number: string | null
          tp_user_id: number | null
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
          intentions?: string[] | null
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          phone_number?: string | null
          place_id?: string | null
          playtomic_user_id?: string | null
          postal_code?: string | null
          ranking?: string | null
          street_name?: string | null
          tp_membership_number?: string | null
          tp_user_id?: number | null
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
          intentions?: string[] | null
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          phone_number?: string | null
          place_id?: string | null
          playtomic_user_id?: string | null
          postal_code?: string | null
          ranking?: string | null
          street_name?: string | null
          tp_membership_number?: string | null
          tp_user_id?: number | null
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
          id: string
          match_id: string | null
          parent_thought_id: string | null
          post_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          event_id?: string | null
          id?: string
          match_id?: string | null
          parent_thought_id?: string | null
          post_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          event_id?: string | null
          id?: string
          match_id?: string | null
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
            foreignKeyName: "thoughts_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
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
      tp_members: {
        Row: {
          created_at: string
          id: string
          name: string | null
          tp_membership_number: string | null
          tp_user_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          tp_membership_number?: string | null
          tp_user_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          tp_membership_number?: string | null
          tp_user_id?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      upsert_tp_member: {
        Args: {
          p_name: string
          p_tp_membership_number: string
          p_tp_user_id: number
        }
        Returns: {
          created_at: string
          id: string
          name: string
          tp_membership_number: string
          tp_user_id: number
          updated_at: string
        }[]
      }
    }
    Enums: {
      match_level:
        | "beginner"
        | "intermediate"
        | "advanced"
        | "professional"
        | "p50-p100"
        | "p100-p200"
        | "p200-p300"
        | "p300-p400"
        | "p400-p500"
        | "p500-p700"
        | "p700-p1000"
        | "p1000+"
      padel_level:
        | "P50"
        | "P100"
        | "P200"
        | "P300"
        | "P400"
        | "P500"
        | "P700"
        | "P1000"
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
    Enums: {
      match_level: [
        "beginner",
        "intermediate",
        "advanced",
        "professional",
        "p50-p100",
        "p100-p200",
        "p200-p300",
        "p300-p400",
        "p400-p500",
        "p500-p700",
        "p700-p1000",
        "p1000+",
      ],
      padel_level: [
        "P50",
        "P100",
        "P200",
        "P300",
        "P400",
        "P500",
        "P700",
        "P1000",
      ],
    },
  },
} as const
