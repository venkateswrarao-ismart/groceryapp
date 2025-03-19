export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_amount?: number
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          order_id: string
          user_id: string
          amount: number
          payment_status: string
          payment_method: string | null
          transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          amount: number
          payment_status?: string
          payment_method?: string | null
          transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          user_id?: string
          amount?: number
          payment_status?: string
          payment_method?: string | null
          transaction_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          stock_quantity: number
          category_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          stock_quantity?: number
          category_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          stock_quantity?: number
          category_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: number
          site_name: string
          currency: string
          tax_rate: number
          created_at: string
        }
        Insert: {
          id?: number
          site_name?: string
          currency?: string
          tax_rate?: number
          created_at?: string
        }
        Update: {
          id?: number
          site_name?: string
          currency?: string
          tax_rate?: number
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          full_name: string
          email: string
          password: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          password: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          password?: string
          role?: string
          created_at?: string
        }
        Relationships: []
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

