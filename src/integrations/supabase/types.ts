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
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          admin_id: string
          created_at: string
          details: Json
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          admin_id: string
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          admin_id?: string
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      bazar_products: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          image: string
          is_kit: boolean | null
          kit_items: number | null
          max_stock: number
          name: string
          original_price: string | null
          price: string
          stock: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          image: string
          is_kit?: boolean | null
          kit_items?: number | null
          max_stock?: number
          name: string
          original_price?: string | null
          price: string
          stock?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          image?: string
          is_kit?: boolean | null
          kit_items?: number | null
          max_stock?: number
          name?: string
          original_price?: string | null
          price?: string
          stock?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author_id: string
          category: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          rejection_reason: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author_id: string
          category: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          rejection_reason?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author_id?: string
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          rejection_reason?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          sender_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          sender_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          sender_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          admin_note: string | null
          affiliate_link: string | null
          category_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          image: string
          name: string
          origin_price: string
          resale_range: string
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_note?: string | null
          affiliate_link?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image: string
          name: string
          origin_price: string
          resale_range: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_note?: string | null
          affiliate_link?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image?: string
          name?: string
          origin_price?: string
          resale_range?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          admin_note: string | null
          categories: string[] | null
          contact: string | null
          created_at: string | null
          created_by: string | null
          id: string
          link: string | null
          name: string
          rating_communication: number | null
          rating_delivery: number | null
          rating_quality: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_note?: string | null
          categories?: string[] | null
          contact?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          link?: string | null
          name: string
          rating_communication?: number | null
          rating_delivery?: number | null
          rating_quality?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_note?: string | null
          categories?: string[] | null
          contact?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          link?: string | null
          name?: string
          rating_communication?: number | null
          rating_delivery?: number | null
          rating_quality?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_notification_settings: {
        Row: {
          bazar_alerts: boolean
          community_messages: boolean
          created_at: string
          id: string
          new_products: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          bazar_alerts?: boolean
          community_messages?: boolean
          created_at?: string
          id?: string
          new_products?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          bazar_alerts?: boolean
          community_messages?: boolean
          created_at?: string
          id?: string
          new_products?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      get_all_users_with_roles: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_audit_logs: {
        Args: {
          p_action?: string
          p_admin_id?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          action: string
          admin_id: string
          admin_name: string
          created_at: string
          details: Json
          id: string
          target_user_id: string
          target_user_name: string
        }[]
      }
      get_user_email: { Args: { target_user_id: string }; Returns: string }
      get_user_stats: {
        Args: never
        Returns: {
          admin_count: number
          member_count: number
          moderator_count: number
          total_users: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      send_bulk_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_target_roles?: Database["public"]["Enums"]["app_role"][]
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
        }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "member"
      audit_action:
        | "role_change"
        | "bulk_notification"
        | "user_delete"
        | "settings_change"
      notification_type:
        | "mention"
        | "product"
        | "alert"
        | "community"
        | "announcement"
        | "post_approved"
        | "post_rejected"
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
      app_role: ["admin", "moderator", "member"],
      audit_action: [
        "role_change",
        "bulk_notification",
        "user_delete",
        "settings_change",
      ],
      notification_type: [
        "mention",
        "product",
        "alert",
        "community",
        "announcement",
        "post_approved",
        "post_rejected",
      ],
    },
  },
} as const
