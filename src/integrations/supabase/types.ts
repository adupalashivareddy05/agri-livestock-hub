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
      animal_images: {
        Row: {
          animal_id: string
          created_at: string
          description: string | null
          id: string
          image_type: string
          image_url: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_type: string
          image_url: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_type?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "animal_images_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      animals: {
        Row: {
          adaptability_notes: string | null
          age_months: number | null
          age_years: number | null
          animal_type: Database["public"]["Enums"]["animal_type"]
          body_height_cm: number | null
          breed: string
          created_at: string
          description: string | null
          father_breed: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          is_available: boolean
          lactation_status:
            | Database["public"]["Enums"]["lactation_status"]
            | null
          location: string
          milk_capacity_liters: number | null
          mother_breed: string | null
          price: number
          seller_id: string
          updated_at: string
          vaccination_details: string | null
        }
        Insert: {
          adaptability_notes?: string | null
          age_months?: number | null
          age_years?: number | null
          animal_type: Database["public"]["Enums"]["animal_type"]
          body_height_cm?: number | null
          breed: string
          created_at?: string
          description?: string | null
          father_breed?: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id?: string
          is_available?: boolean
          lactation_status?:
            | Database["public"]["Enums"]["lactation_status"]
            | null
          location: string
          milk_capacity_liters?: number | null
          mother_breed?: string | null
          price: number
          seller_id: string
          updated_at?: string
          vaccination_details?: string | null
        }
        Update: {
          adaptability_notes?: string | null
          age_months?: number | null
          age_years?: number | null
          animal_type?: Database["public"]["Enums"]["animal_type"]
          body_height_cm?: number | null
          breed?: string
          created_at?: string
          description?: string | null
          father_breed?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: string
          is_available?: boolean
          lactation_status?:
            | Database["public"]["Enums"]["lactation_status"]
            | null
          location?: string
          milk_capacity_liters?: number | null
          mother_breed?: string | null
          price?: number
          seller_id?: string
          updated_at?: string
          vaccination_details?: string | null
        }
        Relationships: []
      }
      crop_rates: {
        Row: {
          created_at: string
          crop_type: Database["public"]["Enums"]["crop_type"]
          id: string
          is_active: boolean
          maximum_quantity_kg: number | null
          minimum_quantity_kg: number | null
          notes: string | null
          rate_date: string
          rate_per_kg: number
          trader_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          crop_type: Database["public"]["Enums"]["crop_type"]
          id?: string
          is_active?: boolean
          maximum_quantity_kg?: number | null
          minimum_quantity_kg?: number | null
          notes?: string | null
          rate_date?: string
          rate_per_kg: number
          trader_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          crop_type?: Database["public"]["Enums"]["crop_type"]
          id?: string
          is_active?: boolean
          maximum_quantity_kg?: number | null
          minimum_quantity_kg?: number | null
          notes?: string | null
          rate_date?: string
          rate_per_kg?: number
          trader_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_rates_trader_id_fkey"
            columns: ["trader_id"]
            isOneToOne: false
            referencedRelation: "traders"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          category: Database["public"]["Enums"]["crop_category"]
          created_at: string
          crop_name: string
          crop_type: Database["public"]["Enums"]["crop_type"]
          description: string | null
          farmer_id: string
          harvest_date: string | null
          id: string
          is_available: boolean
          location: string
          price_per_kg: number
          quality_grade: string | null
          quantity_kg: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["crop_category"]
          created_at?: string
          crop_name: string
          crop_type: Database["public"]["Enums"]["crop_type"]
          description?: string | null
          farmer_id: string
          harvest_date?: string | null
          id?: string
          is_available?: boolean
          location: string
          price_per_kg: number
          quality_grade?: string | null
          quantity_kg: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["crop_category"]
          created_at?: string
          crop_name?: string
          crop_type?: Database["public"]["Enums"]["crop_type"]
          description?: string | null
          farmer_id?: string
          harvest_date?: string | null
          id?: string
          is_available?: boolean
          location?: string
          price_per_kg?: number
          quality_grade?: string | null
          quantity_kg?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone_number: string | null
          pincode: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      traders: {
        Row: {
          business_name: string | null
          created_at: string
          id: string
          license_number: string | null
          location: string
          operating_hours: string | null
          specialization: string[] | null
          trader_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          id?: string
          license_number?: string | null
          location: string
          operating_hours?: string | null
          specialization?: string[] | null
          trader_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          id?: string
          license_number?: string | null
          location?: string
          operating_hours?: string | null
          specialization?: string[] | null
          trader_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
    }
    Enums: {
      animal_type: "cow" | "buffalo" | "goat" | "sheep" | "bull" | "ox"
      app_role:
        | "admin"
        | "seller"
        | "buyer"
        | "farmer"
        | "seasonal_trader"
        | "everyday_trader"
      crop_category: "seasonal" | "everyday" | "vegetable" | "grain" | "pulse"
      crop_type:
        | "cotton"
        | "maize"
        | "paddy"
        | "groundnut"
        | "tomato"
        | "onion"
        | "potato"
        | "wheat"
        | "rice"
        | "other"
      gender_type: "male" | "female"
      lactation_status: "high" | "medium" | "low" | "dry"
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
      animal_type: ["cow", "buffalo", "goat", "sheep", "bull", "ox"],
      app_role: [
        "admin",
        "seller",
        "buyer",
        "farmer",
        "seasonal_trader",
        "everyday_trader",
      ],
      crop_category: ["seasonal", "everyday", "vegetable", "grain", "pulse"],
      crop_type: [
        "cotton",
        "maize",
        "paddy",
        "groundnut",
        "tomato",
        "onion",
        "potato",
        "wheat",
        "rice",
        "other",
      ],
      gender_type: ["male", "female"],
      lactation_status: ["high", "medium", "low", "dry"],
    },
  },
} as const
