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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bus_assignments: {
        Row: {
          arrival_location: string | null
          created_at: string | null
          departure_bus: string | null
          departure_location: string | null
          departure_time: string | null
          id: string
          notes: string | null
          return_bus: string | null
          return_time: string | null
          updated_at: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          arrival_location?: string | null
          created_at?: string | null
          departure_bus?: string | null
          departure_location?: string | null
          departure_time?: string | null
          id?: string
          notes?: string | null
          return_bus?: string | null
          return_time?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          arrival_location?: string | null
          created_at?: string | null
          departure_bus?: string | null
          departure_location?: string | null
          departure_time?: string | null
          id?: string
          notes?: string | null
          return_bus?: string | null
          return_time?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "bus_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          event_date: string
          id: string
          location: string | null
          order_index: number | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          event_date: string
          id?: string
          location?: string | null
          order_index?: number | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_date?: string
          id?: string
          location?: string | null
          order_index?: number | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faq: {
        Row: {
          answer: string
          category: string | null
          id: string
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          id?: string
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          id?: string
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      introductions: {
        Row: {
          birth_date: string | null
          bucketlist: string
          foundation_activity: string
          id: string
          interests: string
          keywords: string
          location: string | null
          major: string | null
          mbti: string | null
          name: string | null
          school: string | null
          stress_relief: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          bucketlist: string
          foundation_activity: string
          id?: string
          interests: string
          keywords: string
          location?: string | null
          major?: string | null
          mbti?: string | null
          name?: string | null
          school?: string | null
          stress_relief: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          birth_date?: string | null
          bucketlist?: string
          foundation_activity?: string
          id?: string
          interests?: string
          keywords?: string
          location?: string | null
          major?: string | null
          mbti?: string | null
          name?: string | null
          school?: string | null
          stress_relief?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "introductions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          is_important: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notices_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_likes: {
        Row: {
          created_at: string | null
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_likes_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          description: string | null
          id: string
          image_url: string
          likes_count: number | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          image_url: string
          likes_count?: number | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          description?: string | null
          id?: string
          image_url?: string
          likes_count?: number | null
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      room_assignments: {
        Row: {
          building_name: string | null
          capacity: number | null
          id: string
          major: string | null
          room_id: string
          room_number: string | null
          school: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          building_name?: string | null
          capacity?: number | null
          id?: string
          major?: string | null
          room_id: string
          room_number?: string | null
          school?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          building_name?: string | null
          capacity?: number | null
          id?: string
          major?: string | null
          room_id?: string
          room_number?: string | null
          school?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_assignments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_assignment_summary"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "room_assignments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_occupancy_info"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "room_assignments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          building_name: string
          capacity: number
          created_at: string | null
          id: string
          room_number: string
          Type: string | null
        }
        Insert: {
          building_name: string
          capacity?: number
          created_at?: string | null
          id?: string
          room_number: string
          Type?: string | null
        }
        Update: {
          building_name?: string
          capacity?: number
          created_at?: string | null
          id?: string
          room_number?: string
          Type?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          attendance: string | null
          birth_date: string | null
          gender: string
          generation: string
          id: string
          major: string
          name: string
          password_hash: string | null
          phone_number: string | null
          profile_image_url: string | null
          program: string | null
          role: string | null
          school: string
          status: string
          updated_at: string | null
          ws_group: string
        }
        Insert: {
          attendance?: string | null
          birth_date?: string | null
          gender: string
          generation: string
          id?: string
          major: string
          name: string
          password_hash?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          program?: string | null
          role?: string | null
          school: string
          status: string
          updated_at?: string | null
          ws_group: string
        }
        Update: {
          attendance?: string | null
          birth_date?: string | null
          gender?: string
          generation?: string
          id?: string
          major?: string
          name?: string
          password_hash?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          program?: string | null
          role?: string | null
          school?: string
          status?: string
          updated_at?: string | null
          ws_group?: string
        }
        Relationships: []
      }
      wavepark_assignments: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          program_type: string
          session_time: string | null
          updated_at: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          program_type: string
          session_time?: string | null
          updated_at?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          program_type?: string
          session_time?: string | null
          updated_at?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "wavepark_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      room_assignment_summary: {
        Row: {
          available_spots: number | null
          building_name: string | null
          capacity: number | null
          current_occupancy: number | null
          occupants: string | null
          occupants_detail: string | null
          room_id: string | null
          room_number: string | null
          room_type: string | null
          status: string | null
        }
        Relationships: []
      }
      room_occupancy_info: {
        Row: {
          available_space: number | null
          building_name: string | null
          capacity: number | null
          created_at: string | null
          current_occupancy: number | null
          occupancy_status: string | null
          residents: string | null
          room_id: string | null
          room_number: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_create_notice_safe: {
        Args: {
          p_title: string
          p_content: string
          p_is_important?: boolean
        }
        Returns: {
          id: string
          title: string
          content: string
          author_id: string | null
          is_important: boolean
          created_at: string
          updated_at: string
        }
      }
      admin_update_notice_safe: {
        Args: {
          p_id: string
          p_title: string
          p_content: string
          p_is_important?: boolean
        }
        Returns: {
          id: string
          title: string
          content: string
          author_id: string | null
          is_important: boolean
          created_at: string
          updated_at: string
        }
      }
      admin_delete_notice_safe: {
        Args: {
          p_id: string
        }
        Returns: boolean
      }
      admin_create_user_safe: {
        Args: {
          p_name: string
          p_school: string
          p_major: string
          p_generation: string
          p_gender: string
          p_phone_number?: string
          p_role?: string
          p_status?: string
          p_ws_group?: string
          p_birth_date?: string
          p_program?: string
        }
        Returns: {
          id: string
          name: string
          school: string
          major: string
          generation: string
          gender: string
          phone_number: string | null
          role: string | null
          status: string
          ws_group: string
          birth_date: string | null
          program: string | null
          profile_image_url: string | null
          password_hash: string | null
          attendance: string | null
          created_at: string
          updated_at: string | null
        }
      }
      admin_delete_user_safe: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      admin_assign_bus: {
        Args: {
          p_user_name: string
          p_departure_bus?: string
          p_departure_time?: string
          p_departure_location?: string
          p_return_bus?: string
          p_return_time?: string
          p_arrival_location?: string
          p_notes?: string
        }
        Returns: {
          id: string
          user_id: string
          user_name: string
          departure_bus: string | null
          departure_time: string | null
          departure_location: string | null
          return_bus: string | null
          return_time: string | null
          arrival_location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      admin_assign_wavepark: {
        Args: {
          p_user_name: string
          p_program_type: string
          p_session_time?: string
          p_location?: string
          p_notes?: string
        }
        Returns: {
          id: string
          user_id: string
          user_name: string
          program_type: string
          session_time: string | null
          location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      admin_remove_bus_assignment: {
        Args: {
          p_user_name: string
        }
        Returns: boolean
      }
      admin_remove_wavepark_assignment: {
        Args: {
          p_user_name: string
        }
        Returns: boolean
      }
      assign_room_by_name_and_number: {
        Args: {
          p_building_name?: string
          p_room_number: string
          p_user_name: string
        }
        Returns: Json
      }
      bulk_assign_rooms: {
        Args: { assignments: Json }
        Returns: Json
      }
      delete_profile_image_url: {
        Args: { p_user_id: string }
        Returns: {
          attendance: string | null
          birth_date: string | null
          gender: string
          generation: string
          id: string
          major: string
          name: string
          password_hash: string | null
          phone_number: string | null
          profile_image_url: string | null
          program: string | null
          role: string | null
          school: string
          status: string
          updated_at: string | null
          ws_group: string
        }
      }
      delete_user_profile_image: {
        Args: { p_user_id: string }
        Returns: {
          attendance: string
          birth_date: string
          created_at: string
          gender: string
          generation: string
          id: string
          major: string
          name: string
          password_hash: string
          phone_number: string
          profile_image_url: string
          program: string
          role: string
          school: string
          status: string
          updated_at: string
          ws_group: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_roommates_by_room_id: {
        Args: { p_room_id: string }
        Returns: Json
      }
      get_user_room_by_name: {
        Args: { p_user_name: string }
        Returns: Json
      }
      make_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      set_user_password: {
        Args: { p_password_hash: string; p_user_id: string }
        Returns: {
          attendance: string | null
          birth_date: string | null
          gender: string
          generation: string
          id: string
          major: string
          name: string
          password_hash: string | null
          phone_number: string | null
          profile_image_url: string | null
          program: string | null
          role: string | null
          school: string
          status: string
          updated_at: string | null
          ws_group: string
        }
      }
      sync_current_user: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      unassign_room_by_name: {
        Args: { user_name: string }
        Returns: Json
      }
      update_profile_image_url: {
        Args: { p_image_url: string; p_user_id: string }
        Returns: {
          attendance: string | null
          birth_date: string | null
          gender: string
          generation: string
          id: string
          major: string
          name: string
          password_hash: string | null
          phone_number: string | null
          profile_image_url: string | null
          program: string | null
          role: string | null
          school: string
          status: string
          updated_at: string | null
          ws_group: string
        }
      }
      update_user_basic_info: {
        Args: {
          p_major: string
          p_name: string
          p_school: string
          p_user_id: string
        }
        Returns: {
          attendance: string
          birth_date: string
          created_at: string
          gender: string
          generation: string
          id: string
          major: string
          name: string
          password_hash: string
          phone_number: string
          profile_image_url: string
          program: string
          role: string
          school: string
          status: string
          updated_at: string
          ws_group: string
        }[]
      }
      update_user_profile_image: {
        Args: { p_profile_image_url: string; p_user_id: string }
        Returns: {
          id: string
          major: string
          name: string
          profile_image_url: string
          school: string
          updated_at: string
        }[]
      }
      update_user_profile_info: {
        Args: {
          p_attendance: string
          p_phone_number: string
          p_program: string
          p_user_id: string
        }
        Returns: {
          attendance: string
          birth_date: string
          created_at: string
          gender: string
          generation: string
          id: string
          major: string
          name: string
          password_hash: string
          phone_number: string
          profile_image_url: string
          program: string
          role: string
          school: string
          status: string
          updated_at: string
          ws_group: string
        }[]
      }
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