import { createServerSupabaseClient } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Sign in user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get user profile with role
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

    return NextResponse.json({
      message: "Signed in successfully",
      user: data.user,
      profile,
      session: data.session,
    })
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

