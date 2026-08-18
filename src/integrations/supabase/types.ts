export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string;
          country: string;
          created_at: string;
          full_name: string;
          id: string;
          is_default: boolean;
          label: string | null;
          phone: string | null;
          postal_code: string;
          state: string | null;
          street: string;
          user_id: string;
        };
        Insert: {
          city: string;
          country: string;
          created_at?: string;
          full_name: string;
          id?: string;
          is_default?: boolean;
          label?: string | null;
          phone?: string | null;
          postal_code: string;
          state?: string | null;
          street: string;
          user_id: string;
        };
        Update: {
          city?: string;
          country?: string;
          created_at?: string;
          full_name?: string;
          id?: string;
          is_default?: boolean;
          label?: string | null;
          phone?: string | null;
          postal_code?: string;
          state?: string | null;
          street?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      banners: {
        Row: {
          created_at: string;
          id: string;
          image_url: string;
          is_active: boolean;
          link_url: string | null;
          sort_order: number;
          subtitle: string | null;
          title: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url: string;
          is_active?: boolean;
          link_url?: string | null;
          sort_order?: number;
          subtitle?: string | null;
          title: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string;
          is_active?: boolean;
          link_url?: string | null;
          sort_order?: number;
          subtitle?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          quantity: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          quantity?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          quantity?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_featured: boolean;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_featured?: boolean;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_featured?: boolean;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          active: boolean;
          code: string;
          created_at: string;
          discount_type: string;
          discount_value: number;
          expires_at: string | null;
          id: string;
          min_order: number;
          vendor_id: string | null;
        };
        Insert: {
          active?: boolean;
          code: string;
          created_at?: string;
          discount_type: string;
          discount_value: number;
          expires_at?: string | null;
          id?: string;
          min_order?: number;
          vendor_id?: string | null;
        };
        Update: {
          active?: boolean;
          code?: string;
          created_at?: string;
          discount_type?: string;
          discount_value?: number;
          expires_at?: string | null;
          id?: string;
          min_order?: number;
          vendor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "coupons_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          name: string;
          order_id: string;
          price: number;
          product_id: string | null;
          quantity: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          name: string;
          order_id: string;
          price: number;
          product_id?: string | null;
          quantity: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          name?: string;
          order_id?: string;
          price?: number;
          product_id?: string | null;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          customer_id: string;
          discount: number;
          id: string;
          notes: string | null;
          order_number: string;
          shipping: number;
          shipping_address: Json | null;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at: string;
          vendor_id: string;
        };
        Insert: {
          created_at?: string;
          customer_id: string;
          discount?: number;
          id?: string;
          notes?: string | null;
          order_number?: string;
          shipping?: number;
          shipping_address?: Json | null;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          vendor_id: string;
        };
        Update: {
          created_at?: string;
          customer_id?: string;
          discount?: number;
          id?: string;
          notes?: string | null;
          order_number?: string;
          shipping?: number;
          shipping_address?: Json | null;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          sort_order: number;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          sort_order?: number;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          sort_order?: number;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          price_delta: number;
          product_id: string;
          sku: string | null;
          stock: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          price_delta?: number;
          product_id: string;
          sku?: string | null;
          stock?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          price_delta?: number;
          product_id?: string;
          sku?: string | null;
          stock?: number;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          avg_rating: number;
          brand: string | null;
          category_id: string | null;
          created_at: string;
          description: string | null;
          dimensions: Json | null;
          discount_price: number | null;
          featured_image: string | null;
          id: string;
          name: string;
          price: number;
          ratings_count: number;
          sku: string | null;
          slug: string;
          status: Database["public"]["Enums"]["product_status"];
          stock: number;
          tags: string[] | null;
          updated_at: string;
          vendor_id: string;
          weight: number | null;
        };
        Insert: {
          avg_rating?: number;
          brand?: string | null;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          dimensions?: Json | null;
          discount_price?: number | null;
          featured_image?: string | null;
          id?: string;
          name: string;
          price: number;
          ratings_count?: number;
          sku?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["product_status"];
          stock?: number;
          tags?: string[] | null;
          updated_at?: string;
          vendor_id: string;
          weight?: number | null;
        };
        Update: {
          avg_rating?: number;
          brand?: string | null;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          dimensions?: Json | null;
          discount_price?: number | null;
          featured_image?: string | null;
          id?: string;
          name?: string;
          price?: number;
          ratings_count?: number;
          sku?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["product_status"];
          stock?: number;
          tags?: string[] | null;
          updated_at?: string;
          vendor_id?: string;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          product_id: string;
          rating: number;
          user_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          product_id: string;
          rating: number;
          user_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          product_id?: string;
          rating?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      vendors: {
        Row: {
          address: string | null;
          banner_url: string | null;
          business_hours: Json | null;
          created_at: string;
          description: string | null;
          email: string | null;
          id: string;
          is_featured: boolean;
          logo_url: string | null;
          name: string;
          phone: string | null;
          slug: string;
          social_links: Json | null;
          status: Database["public"]["Enums"]["vendor_status"];
          tagline: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          banner_url?: string | null;
          business_hours?: Json | null;
          created_at?: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          is_featured?: boolean;
          logo_url?: string | null;
          name: string;
          phone?: string | null;
          slug: string;
          social_links?: Json | null;
          status?: Database["public"]["Enums"]["vendor_status"];
          tagline?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address?: string | null;
          banner_url?: string | null;
          business_hours?: Json | null;
          created_at?: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          is_featured?: boolean;
          logo_url?: string | null;
          name?: string;
          phone?: string | null;
          slug?: string;
          social_links?: Json | null;
          status?: Database["public"]["Enums"]["vendor_status"];
          tagline?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      wishlist: {
        Row: {
          created_at: string;
          product_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          product_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          product_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      owns_vendor: { Args: { _vendor: string }; Returns: boolean };
    };
    Enums: {
      app_role: "customer" | "vendor" | "admin";
      order_status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
      product_status: "draft" | "active" | "archived";
      vendor_status: "pending" | "approved" | "suspended";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "vendor", "admin"],
      order_status: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      product_status: ["draft", "active", "archived"],
      vendor_status: ["pending", "approved", "suspended"],
    },
  },
} as const;
