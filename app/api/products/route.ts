import { withAuth } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

// Get all products (public)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Parse query parameters
    const url = new URL(request.url)
    const category = url.searchParams.get("category")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    // Build query
    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Add category filter if provided
    if (category) {
      query = query.eq("category", category)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      products: data,
      count,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Create a new product (vendor or admin only)
export async function POST(request: NextRequest) {
  // Check authentication and role
  const authResponse = await withAuth(request, ["vendor", "admin"])
  if (authResponse.status === 401 || authResponse.status === 403) {
    return authResponse
  }

  try {
    const supabase = createServerSupabaseClient()

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, price, stock, category, image_url } = await request.json()

    // Validate input
    if (!name || !price || !category) {
      return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 })
    }

    // Create product
    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price,
        stock,
        category,
        image_url,
        vendor_id: session.user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: "Product created successfully",
      product: data,
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

