import { createServerSupabaseClient } from "@/lib/auth";

import { type NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client"

export async function POST(request: NextRequest) {
  //testing command
  try {
    const { email, password, full_name, role = "customer", phone, address } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 });
    }

    const validRoles: UserRole[] = ["admin", "vendor", "customer", "delivery"];
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const supabase = createClient(); // ✅ Ensure it's awaited

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from("gc_profiles").insert({
        id: authData.user.id,
        email,
        full_name,
        role,
        phone,
        address,
      });

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "User created successfully", user: authData.user });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
