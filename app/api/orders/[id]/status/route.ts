import { withAuth } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

// Update order status (delivery person or admin only)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Check authentication and role
  const authResponse = await withAuth(request, ["delivery", "admin"])
  if (authResponse.status === 401 || authResponse.status === 403) {
    return authResponse
  }

  try {
    const orderId = params.id
    const { status } = await request.json()

    // Validate input
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Validate status value
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile with role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Get the order
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check permissions based on role
    if (profile.role === "delivery") {
      // Delivery person can only update orders assigned to them
      if (order.delivery_person_id !== session.user.id && status !== "processing") {
        // Exception: Delivery person can claim an order by updating a 'processing' order
        return NextResponse.json({ error: "You can only update orders assigned to you" }, { status: 403 })
      }

      // If delivery person is claiming the order
      if (status === "shipped" && order.status === "processing") {
        // Assign the delivery person to the order
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status,
            delivery_person_id: session.user.id,
          })
          .eq("id", orderId)

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }
      } else {
        // Regular status update
        const { error: updateError } = await supabase.from("orders").update({ status }).eq("id", orderId)

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }
      }
    } else if (profile.role === "admin") {
      // Admin can update any order
      const { error: updateError } = await supabase.from("orders").update({ status }).eq("id", orderId)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      message: "Order status updated successfully",
      orderId,
      status,
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

