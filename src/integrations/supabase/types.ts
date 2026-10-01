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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      board_cards: {
        Row: {
          col: number
          created_at: string
          created_by: string
          due_date: string
          from_division: string
          id: string
          on_time: boolean | null
          title: string
          to_division: string
        }
        Insert: {
          col?: number
          created_at?: string
          created_by?: string
          due_date?: string
          from_division: string
          id?: string
          on_time?: boolean | null
          title: string
          to_division: string
        }
        Update: {
          col?: number
          created_at?: string
          created_by?: string
          due_date?: string
          from_division?: string
          id?: string
          on_time?: boolean | null
          title?: string
          to_division?: string
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          created_at: string
          division: string
          hours: number
          id: string
          report_date: string
          tasks_done: number
          tasks_total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          division?: string
          hours?: number
          id?: string
          report_date?: string
          tasks_done?: number
          tasks_total?: number
          user_id?: string
        }
        Update: {
          created_at?: string
          division?: string
          hours?: number
          id?: string
          report_date?: string
          tasks_done?: number
          tasks_total?: number
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          context: string
          created_at: string
          division: string
          id: string
          mime: string | null
          name: string
          size: number
          storage_path: string | null
          uploaded_by: string
          uploader_name: string
        }
        Insert: {
          category?: string
          context?: string
          created_at?: string
          division?: string
          id?: string
          mime?: string | null
          name: string
          size?: number
          storage_path?: string | null
          uploaded_by?: string
          uploader_name?: string
        }
        Update: {
          category?: string
          context?: string
          created_at?: string
          division?: string
          id?: string
          mime?: string | null
          name?: string
          size?: number
          storage_path?: string | null
          uploaded_by?: string
          uploader_name?: string
        }
        Relationships: []
      }
      help_requests: {
        Row: {
          card_id: string | null
          created_at: string
          created_by: string
          due_days: number
          from_division: string
          goal: string | null
          id: string
          status: string
          title: string
          to_division: string
        }
        Insert: {
          card_id?: string | null
          created_at?: string
          created_by?: string
          due_days?: number
          from_division?: string
          goal?: string | null
          id?: string
          status?: string
          title: string
          to_division: string
        }
        Update: {
          card_id?: string | null
          created_at?: string
          created_by?: string
          due_days?: number
          from_division?: string
          goal?: string | null
          id?: string
          status?: string
          title?: string
          to_division?: string
        }
        Relationships: []
      }
      kpi_entries: {
        Row: {
          corrected_at: string | null
          corrected_by: string | null
          corrected_value_a: number | null
          corrected_value_b: number | null
          correction_reason: string | null
          created_at: string
          document_id: string | null
          entry_date: string
          id: string
          kpi_code: string
          note: string
          user_id: string
          value_a: number
          value_b: number | null
        }
        Insert: {
          corrected_at?: string | null
          corrected_by?: string | null
          corrected_value_a?: number | null
          corrected_value_b?: number | null
          correction_reason?: string | null
          created_at?: string
          document_id?: string | null
          entry_date?: string
          id?: string
          kpi_code: string
          note?: string
          user_id: string
          value_a: number
          value_b?: number | null
        }
        Update: {
          corrected_at?: string | null
          corrected_by?: string | null
          corrected_value_a?: number | null
          corrected_value_b?: number | null
          correction_reason?: string | null
          created_at?: string
          document_id?: string | null
          entry_date?: string
          id?: string
          kpi_code?: string
          note?: string
          user_id?: string
          value_a?: number
          value_b?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_reviews: {
        Row: {
          id: string
          note: string
          period: string
          reviewer_id: string | null
          updated_at: string
          user_id: string
          work_score: number
        }
        Insert: {
          id?: string
          note?: string
          period: string
          reviewer_id?: string | null
          updated_at?: string
          user_id: string
          work_score?: number
        }
        Update: {
          id?: string
          note?: string
          period?: string
          reviewer_id?: string | null
          updated_at?: string
          user_id?: string
          work_score?: number
        }
        Relationships: []
      }
      kpi_settings: {
        Row: {
          id: string
          kpi_code: string
          objective: string | null
          period: string
          target: number | null
          updated_at: string
          updated_by: string
          user_id: string
          weight: number
        }
        Insert: {
          id?: string
          kpi_code: string
          objective?: string | null
          period: string
          target?: number | null
          updated_at?: string
          updated_by?: string
          user_id: string
          weight?: number
        }
        Update: {
          id?: string
          kpi_code?: string
          objective?: string | null
          period?: string
          target?: number | null
          updated_at?: string
          updated_by?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      obstacles: {
        Row: {
          created_at: string
          division: string
          id: string
          note: string
          resolved: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          division?: string
          id?: string
          note: string
          resolved?: boolean
          user_id?: string
        }
        Update: {
          created_at?: string
          division?: string
          id?: string
          note?: string
          resolved?: boolean
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          division: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          division?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          division?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_goals: {
        Row: {
          created_at: string
          division: string
          id: string
          linked: boolean
          progress: number
          target: string
          title: string
        }
        Insert: {
          created_at?: string
          division: string
          id?: string
          linked?: boolean
          progress?: number
          target?: string
          title: string
        }
        Update: {
          created_at?: string
          division?: string
          id?: string
          linked?: boolean
          progress?: number
          target?: string
          title?: string
        }
        Relationships: []
      }
      sharing_sessions: {
        Row: {
          created_at: string
          created_by: string
          division: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          division?: string
          id?: string
          title?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          division?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          division: string
          done: boolean
          hours: number
          id: string
          project: string
          task_date: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          division?: string
          done?: boolean
          hours?: number
          id?: string
          project?: string
          task_date?: string
          title: string
          user_id?: string
        }
        Update: {
          created_at?: string
          division?: string
          done?: boolean
          hours?: number
          id?: string
          project?: string
          task_date?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager: { Args: never; Returns: boolean }
      is_spv_of: { Args: { _division: string }; Returns: boolean }
      my_division: { Args: never; Returns: string }
      user_division: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "manager" | "spv" | "staf"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["manager", "spv", "staf"],
    },
  },
} as const
