import { createClient } from "@supabase/supabase-js"

// These environment variables need to be set via the Supabase integration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database schema
export type UserRole = "admin" | "vendor" | "customer" | "delivery"

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name: string
  phone?: string
  address?: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url?: string
  vendor_id: string
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total_amount: number
  delivery_address: string
  delivery_person_id?: string
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
}

