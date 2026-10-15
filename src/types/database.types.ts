export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      otp_challenges: {
        Row: {
          id: string;
          phone: string;
          purpose: string;
          code_hash: string;
          payload: Json | null;
          attempts: number;
          expires_at: string;
          consumed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          purpose: string;
          code_hash: string;
          payload?: Json | null;
          attempts?: number;
          expires_at: string;
          consumed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          purpose?: string;
          code_hash?: string;
          payload?: Json | null;
          attempts?: number;
          expires_at?: string;
          consumed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          line1: string;
          building_id: string | null;
          landmark: string | null;
          pincode: string | null;
          latitude: number | null;
          longitude: number | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          line1: string;
          building_id?: string | null;
          landmark?: string | null;
          pincode?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string | null;
          line1?: string;
          building_id?: string | null;
          landmark?: string | null;
          pincode?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_building_id_fkey";
            columns: ["building_id"];
            isOneToOne: false;
            referencedRelation: "buildings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      buildings: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          landmark: string | null;
          latitude: number | null;
          longitude: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          landmark?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          landmark?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_user_id: string;
          order_id: string | null;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          recipient_user_id: string;
          order_id?: string | null;
          type: string;
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          recipient_user_id?: string;
          order_id?: string | null;
          type?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
          read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_recipient_user_id_fkey";
            columns: ["recipient_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name_snapshot: string;
          unit_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name_snapshot: string;
          unit_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
          line_total: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name_snapshot?: string;
          unit_snapshot?: string;
          unit_price_snapshot?: number;
          quantity?: number;
          line_total?: number;
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
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          changed_by: string | null;
          old_status: string | null;
          new_status: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          changed_by?: string | null;
          old_status?: string | null;
          new_status: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          changed_by?: string | null;
          old_status?: string | null;
          new_status?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_no: string;
          user_id: string;
          address_snapshot: Json;
          building_name_snapshot: string;
          latitude: number | null;
          longitude: number | null;
          distance_km: number | null;
          payment_method: string;
          payment_status: string;
          subtotal: number;
          delivery_fee: number;
          total: number;
          status: string;
          customer_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_no: string;
          user_id: string;
          address_snapshot: Json;
          building_name_snapshot: string;
          latitude?: number | null;
          longitude?: number | null;
          distance_km?: number | null;
          payment_method?: string;
          payment_status?: string;
          subtotal: number;
          delivery_fee?: number;
          total: number;
          status?: string;
          customer_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_no?: string;
          user_id?: string;
          address_snapshot?: Json;
          building_name_snapshot?: string;
          latitude?: number | null;
          longitude?: number | null;
          distance_km?: number | null;
          payment_method?: string;
          payment_status?: string;
          subtotal?: number;
          delivery_fee?: number;
          total?: number;
          status?: string;
          customer_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          unit: string;
          quantity_step: number;
          price: number;
          stock_quantity: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          unit: string;
          quantity_step?: number;
          price: number;
          stock_quantity?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          unit?: string;
          quantity_step?: number;
          price?: number;
          stock_quantity?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: string;
          building_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: string;
          building_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          role?: string;
          building_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_building_id_fkey";
            columns: ["building_id"];
            isOneToOne: false;
            referencedRelation: "buildings";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: {
          id: number;
          shop_name: string;
          shop_phone: string | null;
          shop_latitude: number | null;
          shop_longitude: number | null;
          radius_km: number;
          minimum_order: number;
          delivery_fee: number;
          is_open: boolean;
          announcement_text: string;
          delivery_area_text: string;
          low_stock_threshold: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          shop_name: string;
          shop_phone?: string | null;
          shop_latitude?: number | null;
          shop_longitude?: number | null;
          radius_km?: number;
          minimum_order?: number;
          delivery_fee?: number;
          is_open?: boolean;
          announcement_text?: string;
          delivery_area_text?: string;
          low_stock_threshold?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          shop_name?: string;
          shop_phone?: string | null;
          shop_latitude?: number | null;
          shop_longitude?: number | null;
          radius_km?: number;
          minimum_order?: number;
          delivery_fee?: number;
          is_open?: boolean;
          announcement_text?: string;
          delivery_area_text?: string;
          low_stock_threshold?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      active_buildings: {
        Row: {
          id: string | null;
          name: string | null;
          address: string | null;
          landmark: string | null;
        };
        Relationships: [];
      };
      catalog_products: {
        Row: {
          id: string | null;
          category_id: string | null;
          category_name: string | null;
          name: string | null;
          slug: string | null;
          description: string | null;
          image_url: string | null;
          unit: string | null;
          quantity_step: number | null;
          price: number | null;
          stock_quantity: number | null;
          status: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      cancel_own_order: {
        Args: { p_order_id: string; p_note?: string };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      haversine_km: {
        Args: { lat1: number; lon1: number; lat2: number; lon2: number };
        Returns: number;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      mark_payment_collected: {
        Args: { p_order_id: string };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      notify_new_order: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
      notify_order_status_change: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
      place_order: {
        Args: { p_address_id: string; p_items: Json; p_customer_note?: string };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      restore_order_stock: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
      update_order_status: {
        Args: { p_order_id: string; p_new_status: string; p_note?: string };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
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

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
