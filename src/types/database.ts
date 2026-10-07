// Généré depuis Supabase (generate_typescript_types). Ne pas éditer à la main.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type_id: string;
          created_at: string;
          created_by: string;
          description: string | null;
          duration_minutes: number | null;
          id: string;
          location_type: string | null;
          material_needed: string | null;
          max_participants: number | null;
          min_participants: number | null;
          narrative_theme: string | null;
          pedagogical_objective: string | null;
          published_at: string | null;
          safety_notes: string | null;
          status: string;
          theme_adaptation_notes: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          activity_type_id: string;
          created_at?: string;
          created_by: string;
          description?: string | null;
          duration_minutes?: number | null;
          id?: string;
          location_type?: string | null;
          material_needed?: string | null;
          max_participants?: number | null;
          min_participants?: number | null;
          narrative_theme?: string | null;
          pedagogical_objective?: string | null;
          published_at?: string | null;
          safety_notes?: string | null;
          status?: string;
          theme_adaptation_notes?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          activity_type_id?: string;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          duration_minutes?: number | null;
          id?: string;
          location_type?: string | null;
          material_needed?: string | null;
          max_participants?: number | null;
          min_participants?: number | null;
          narrative_theme?: string | null;
          pedagogical_objective?: string | null;
          published_at?: string | null;
          safety_notes?: string | null;
          status?: string;
          theme_adaptation_notes?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_activity_type_id_fkey";
            columns: ["activity_type_id"];
            isOneToOne: false;
            referencedRelation: "activity_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_age_branches: {
        Row: {
          activity_id: string;
          age_branch_id: string;
        };
        Insert: {
          activity_id: string;
          age_branch_id: string;
        };
        Update: {
          activity_id?: string;
          age_branch_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_age_branches_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_age_branches_age_branch_id_fkey";
            columns: ["age_branch_id"];
            isOneToOne: false;
            referencedRelation: "age_branches";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_characteristic_forms: {
        Row: {
          activity_id: string;
          characteristic_form_id: string;
        };
        Insert: {
          activity_id: string;
          characteristic_form_id: string;
        };
        Update: {
          activity_id?: string;
          characteristic_form_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_characteristic_forms_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_characteristic_forms_characteristic_form_id_fkey";
            columns: ["characteristic_form_id"];
            isOneToOne: false;
            referencedRelation: "characteristic_forms";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_types: {
        Row: {
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      age_branches: {
        Row: {
          id: string;
          max_age: number;
          min_age: number;
          name: string;
        };
        Insert: {
          id?: string;
          max_age: number;
          min_age: number;
          name: string;
        };
        Update: {
          id?: string;
          max_age?: number;
          min_age?: number;
          name?: string;
        };
        Relationships: [];
      };
      characteristic_forms: {
        Row: {
          id: string;
          name: string;
          position: number;
        };
        Insert: {
          id?: string;
          name: string;
          position: number;
        };
        Update: {
          id?: string;
          name?: string;
          position?: number;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          activity_id: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          activity_id: string;
          created_at?: string;
          user_id?: string;
        };
        Update: {
          activity_id?: string;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
          role: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          id: string;
          role?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          id?: string;
          role?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_edit_activity: {
        Args: { p_created_by: string; p_status: string };
        Returns: boolean;
      };
      has_role: { Args: { p_min_role: string }; Returns: boolean };
      list_users: {
        Args: never;
        Returns: {
          created_at: string;
          display_name: string;
          email: string;
          id: string;
          role: string;
        }[];
      };
      set_user_role: {
        Args: { p_role: string; p_user_id: string };
        Returns: undefined;
      };
      save_activity: {
        Args: {
          p_activity: Json;
          p_age_branch_ids: string[];
          p_characteristic_form_ids: string[];
          p_id?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
