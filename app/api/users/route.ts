import { withAuth } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

// Get all users (admin only)
export async function GET(request: NextRequest) {
  // Check authentication and role
  const authResponse = await withAuth(request, ["admin"])
  if (authResponse.status === 401 || authResponse.status === 403) {
    return authResponse
  }

  try {
    const supabase = createServerSupabaseClient()

    // Parse query parameters
    const url = new URL(request.url)
    const role = url.searchParams.get("role")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    // Build query
    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Add role filter if provided
    if (role) {
      query = query.eq("role", role)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      users: data,
      count,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

