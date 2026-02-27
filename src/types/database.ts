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
      analytics_events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event_metadata: Json | null
          event_type: Database["public"]["Enums"]["event_type_enum"]
          id: string
          ip_hash: string | null
          product_id: string | null
          referrer_url: string | null
          referrer_username: string | null
          seller_id: string | null
          user_agent: string | null
          visitor_fingerprint: string | null
          visitor_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_metadata?: Json | null
          event_type: Database["public"]["Enums"]["event_type_enum"]
          id?: string
          ip_hash?: string | null
          product_id?: string | null
          referrer_url?: string | null
          referrer_username?: string | null
          seller_id?: string | null
          user_agent?: string | null
          visitor_fingerprint?: string | null
          visitor_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_metadata?: Json | null
          event_type?: Database["public"]["Enums"]["event_type_enum"]
          id?: string
          ip_hash?: string | null
          product_id?: string | null
          referrer_url?: string | null
          referrer_username?: string | null
          seller_id?: string | null
          user_agent?: string | null
          visitor_fingerprint?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "analytics_events_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "analytics_events_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "analytics_events_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          changed_fields: string[] | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          performed_at: string
          performed_by: string | null
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string
          performed_by?: string | null
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string
          performed_by?: string | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          currency_snapshot: string
          id: string
          price_snapshot: number
          product_id: string
          quantity: number
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency_snapshot?: string
          id?: string
          price_snapshot: number
          product_id: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency_snapshot?: string
          id?: string
          price_snapshot?: number
          product_id?: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          content_body: string | null
          content_url: string | null
          created_at: string
          id: string
          is_preview: boolean | null
          is_published: boolean | null
          lesson_type: string
          module_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content_body?: string | null
          content_url?: string | null
          created_at?: string
          id?: string
          is_preview?: boolean | null
          is_published?: boolean | null
          lesson_type?: string
          module_id: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          content_body?: string | null
          content_url?: string | null
          created_at?: string
          id?: string
          is_preview?: boolean | null
          is_published?: boolean | null
          lesson_type?: string
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          product_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          product_id: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          product_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_modules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_paid: number
          buyer_email: string | null
          buyer_id: string | null
          buyer_phone: string | null
          completed_at: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_enum"]
          id: string
          order_number: string
          payment_method: string | null
          payment_reference: string | null
          platform_fee: number
          product_id: string
          product_price: number
          product_title: string
          referral_commission: number
          referred_by_username: string | null
          seller_earnings: number
          seller_id: string
          status: Database["public"]["Enums"]["order_status_enum"]
        }
        Insert: {
          amount_paid: number
          buyer_email?: string | null
          buyer_id?: string | null
          buyer_phone?: string | null
          completed_at?: string | null
          created_at?: string
          currency: Database["public"]["Enums"]["currency_enum"]
          id?: string
          order_number: string
          payment_method?: string | null
          payment_reference?: string | null
          platform_fee: number
          product_id: string
          product_price: number
          product_title: string
          referral_commission?: number
          referred_by_username?: string | null
          seller_earnings: number
          seller_id: string
          status?: Database["public"]["Enums"]["order_status_enum"]
        }
        Update: {
          amount_paid?: number
          buyer_email?: string | null
          buyer_id?: string | null
          buyer_phone?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_enum"]
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_reference?: string | null
          platform_fee?: number
          product_id?: string
          product_price?: number
          product_title?: string
          referral_commission?: number
          referred_by_username?: string | null
          seller_earnings?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["order_status_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_enum"]
          id: string
          payment_destination: Json
          payment_method: string
          processed_at: string | null
          seller_id: string
          status: Database["public"]["Enums"]["payout_status_enum"]
          status_message: string | null
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_enum"]
          id?: string
          payment_destination: Json
          payment_method: string
          processed_at?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["payout_status_enum"]
          status_message?: string | null
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_enum"]
          id?: string
          payment_destination?: Json
          payment_method?: string
          processed_at?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["payout_status_enum"]
          status_message?: string | null
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "payouts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
        ]
      }
      product_attachments: {
        Row: {
          attachment_type: Database["public"]["Enums"]["attachment_type_enum"]
          created_at: string
          file_name: string
          file_size_bytes: number | null
          id: string
          is_preview: boolean
          mime_type: string | null
          product_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          attachment_type: Database["public"]["Enums"]["attachment_type_enum"]
          created_at?: string
          file_name: string
          file_size_bytes?: number | null
          id?: string
          is_preview?: boolean
          mime_type?: string | null
          product_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          attachment_type?: Database["public"]["Enums"]["attachment_type_enum"]
          created_at?: string
          file_name?: string
          file_size_bytes?: number | null
          id?: string
          is_preview?: boolean
          mime_type?: string | null
          product_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_attachments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_attachments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          is_archived: boolean
          is_published: boolean
          preview_video: string | null
          price_amount: number
          price_currency: Database["public"]["Enums"]["currency_enum"]
          product_type: Database["public"]["Enums"]["product_type_enum"]
          published_at: string | null
          rating_average: number | null
          rating_count: number
          sales_count: number
          seller_id: string
          slug: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          is_published?: boolean
          preview_video?: string | null
          price_amount?: number
          price_currency?: Database["public"]["Enums"]["currency_enum"]
          product_type: Database["public"]["Enums"]["product_type_enum"]
          published_at?: string | null
          rating_average?: number | null
          rating_count?: number
          sales_count?: number
          seller_id: string
          slug: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          is_published?: boolean
          preview_video?: string | null
          price_amount?: number
          price_currency?: Database["public"]["Enums"]["currency_enum"]
          product_type?: Database["public"]["Enums"]["product_type_enum"]
          published_at?: string | null
          rating_average?: number | null
          rating_count?: number
          sales_count?: number
          seller_id?: string
          slug?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          follower_count: number
          following_count: number
          full_name: string | null
          has_completed_onboarding: boolean
          headline: string | null
          id: string
          is_seller: boolean
          is_suspended: boolean
          is_verified: boolean
          payment_details: Json
          social_links: Json
          total_sales: number
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          follower_count?: number
          following_count?: number
          full_name?: string | null
          has_completed_onboarding?: boolean
          headline?: string | null
          id: string
          is_seller?: boolean
          is_suspended?: boolean
          is_verified?: boolean
          payment_details?: Json
          social_links?: Json
          total_sales?: number
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          follower_count?: number
          following_count?: number
          full_name?: string | null
          has_completed_onboarding?: boolean
          headline?: string | null
          id?: string
          is_seller?: boolean
          is_suspended?: boolean
          is_verified?: boolean
          payment_details?: Json
          social_links?: Json
          total_sales?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      purchase_licenses: {
        Row: {
          access_count: number
          buyer_id: string | null
          created_at: string
          download_count: number
          expires_at: string | null
          first_accessed_at: string | null
          id: string
          is_active: boolean
          last_accessed_at: string | null
          license_key: string
          max_downloads: number | null
          order_id: string
          original_buyer_id: string | null
          product_id: string
          revoked_at: string | null
          revoked_reason: string | null
          seller_id: string
          transferred_at: string | null
        }
        Insert: {
          access_count?: number
          buyer_id?: string | null
          created_at?: string
          download_count?: number
          expires_at?: string | null
          first_accessed_at?: string | null
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          license_key: string
          max_downloads?: number | null
          order_id: string
          original_buyer_id?: string | null
          product_id: string
          revoked_at?: string | null
          revoked_reason?: string | null
          seller_id: string
          transferred_at?: string | null
        }
        Update: {
          access_count?: number
          buyer_id?: string | null
          created_at?: string
          download_count?: number
          expires_at?: string | null
          first_accessed_at?: string | null
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          license_key?: string
          max_downloads?: number | null
          order_id?: string
          original_buyer_id?: string | null
          product_id?: string
          revoked_at?: string | null
          revoked_reason?: string | null
          seller_id?: string
          transferred_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_licenses_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_licenses_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "purchase_licenses_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "purchase_licenses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_licenses_original_buyer_id_fkey"
            columns: ["original_buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_licenses_original_buyer_id_fkey"
            columns: ["original_buyer_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "purchase_licenses_original_buyer_id_fkey"
            columns: ["original_buyer_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "purchase_licenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_licenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_licenses_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_licenses_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "purchase_licenses_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
        ]
      }
      reviews: {
        Row: {
          buyer_id: string
          content: string | null
          created_at: string
          id: string
          is_visible: boolean
          order_id: string
          product_id: string
          rating: number
          title: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          content?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean
          order_id: string
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          content?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean
          order_id?: string
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "seller_stats"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_products: {
        Row: {
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: string | null
          price_amount: number | null
          price_currency: Database["public"]["Enums"]["currency_enum"] | null
          product_type: Database["public"]["Enums"]["product_type_enum"] | null
          published_at: string | null
          rating_average: number | null
          rating_count: number | null
          sales_count: number | null
          seller_avatar: string | null
          seller_id: string | null
          seller_name: string | null
          seller_username: string | null
          seller_verified: boolean | null
          slug: string | null
          title: string | null
          view_count: number | null
        }
        Relationships: []
      }
      seller_stats: {
        Row: {
          follower_count: number | null
          published_products: number | null
          seller_id: string | null
          total_earnings: number | null
          total_orders: number | null
          total_products: number | null
          total_sales: number | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_to_cart: {
        Args: { p_product_id: string; p_session_id?: string }
        Returns: Json
      }
      clear_cart: { Args: { p_session_id?: string }; Returns: undefined }
      generate_license_key: { Args: never; Returns: string }
      get_cart: {
        Args: { p_session_id?: string }
        Returns: {
          cart_id: string
          cover_image: string
          currency: string
          price: number
          product_id: string
          product_type: string
          quantity: number
          seller_username: string
          slug: string
          title: string
        }[]
      }
      get_cart_details: {
        Args: { p_session_id?: string }
        Returns: {
          cart_id: string
          cover_image: string
          currency: string
          price: number
          product_id: string
          quantity: number
          seller_username: string
          title: string
        }[]
      }
      get_seller_earnings: {
        Args: {
          p_end_date?: string
          p_seller_id: string
          p_start_date?: string
        }
        Returns: {
          completed_payouts: number
          order_count: number
          pending_payouts: number
          total_earnings: number
        }[]
      }
      get_user_library: {
        Args: never
        Returns: {
          cover_image: string
          last_accessed_at: string
          license_id: string
          license_key: string
          product_id: string
          product_slug: string
          product_title: string
          product_type: Database["public"]["Enums"]["product_type_enum"]
          purchased_at: string
          seller_name: string
          seller_username: string
        }[]
      }
      increment_view_count: {
        Args: { p_product_id: string }
        Returns: undefined
      }
      merge_guest_cart: { Args: { p_session_id: string }; Returns: undefined }
      record_license_access: {
        Args: { p_license_key: string }
        Returns: boolean
      }
      remove_from_cart: {
        Args: { p_product_id: string; p_session_id?: string }
        Returns: undefined
      }
      search_products: {
        Args: {
          max_price?: number
          min_price?: number
          page_limit?: number
          page_offset?: number
          product_type_filter?: Database["public"]["Enums"]["product_type_enum"]
          search_query: string
          sort_by?: string
        }
        Returns: {
          cover_image: string
          description: string
          id: string
          price_amount: number
          price_currency: Database["public"]["Enums"]["currency_enum"]
          product_type: Database["public"]["Enums"]["product_type_enum"]
          rating_average: number
          relevance_score: number
          sales_count: number
          seller_avatar: string
          seller_username: string
          slug: string
          title: string
          view_count: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      user_has_product_access: {
        Args: { p_product_id: string }
        Returns: boolean
      }
      validate_license: {
        Args: { p_license_key: string }
        Returns: {
          access_count: number
          buyer_id: string
          expires_at: string
          is_valid: boolean
          product_id: string
          product_title: string
        }[]
      }
    }
    Enums: {
      attachment_type_enum: "video" | "file" | "link" | "image"
      currency_enum: "USD" | "LRD" | "EUR" | "GBP" | "NGN" | "GHS" | "KES"
      event_type_enum: "view" | "click" | "purchase" | "share"
      order_status_enum: "pending" | "completed" | "refunded" | "cancelled"
      payout_status_enum: "pending" | "processing" | "completed" | "failed"
      product_type_enum: "course" | "service" | "asset"
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
      attachment_type_enum: ["video", "file", "link", "image"],
      currency_enum: ["USD", "LRD", "EUR", "GBP", "NGN", "GHS", "KES"],
      event_type_enum: ["view", "click", "purchase", "share"],
      order_status_enum: ["pending", "completed", "refunded", "cancelled"],
      payout_status_enum: ["pending", "processing", "completed", "failed"],
      product_type_enum: ["course", "service", "asset"],
    },
  },
} as const
