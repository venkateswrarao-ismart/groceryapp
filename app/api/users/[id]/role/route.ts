import { withAuth } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import type { UserRole } from "@/lib/supabase"

// Update user role (admin only)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Check authentication and role
  const authResponse = await withAuth(request, ["admin"])
  if (authResponse.status === 401 || authResponse.status === 403) {
    return authResponse
  }

  try {
    const userId = params.id
    const { role } = await request.json()

    // Validate input
    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 })
    }

    // Validate role
    const validRoles: UserRole[] = ["admin", "vendor", "customer", "delivery"]
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Update user role in profiles table
    const { error: profileError } = await supabase.from("profiles").update({ role }).eq("id", userId)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: "User role updated successfully",
      userId,
      role,
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

