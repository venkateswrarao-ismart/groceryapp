import { withAuth } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

// Get orders (filtered by user role)
export async function GET(request: NextRequest) {
  // Check authentication (all roles can access but will see different data)
  const authResponse = await withAuth(request)
  if (authResponse.status === 401) {
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

    // Get user profile with role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    // Build query based on user role
    let query = supabase
      .from("orders")
      .select("*, order_items(*), profiles!customer_id(*)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by role
    switch (profile.role) {
      case "admin":
        // Admins can see all orders
        break
      case "vendor":
        // Vendors can see orders containing their products
        // This requires a more complex query with joins
        // For simplicity, we'll use a view or function in the database
        query = supabase
          .from("vendor_orders")
          .select("*")
          .eq("vendor_id", session.user.id)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1)
        break
      case "customer":
        // Customers can only see their own orders
        query = query.eq("customer_id", session.user.id)
        break
      case "delivery":
        // Delivery personnel can see orders assigned to them or available for pickup
        query = query.or(`delivery_person_id.eq.${session.user.id},status.eq.processing`)
        break
    }

    // Add status filter if provided
    if (status) {
      query = query.eq("status", status)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      orders: data,
      count,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Create a new order (customer only)
export async function POST(request: NextRequest) {
  // Check authentication and role
  const authResponse = await withAuth(request, ["customer"])
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

    const { items, delivery_address } = await request.json()

    // Validate input
    if (!items || !items.length || !delivery_address) {
      return NextResponse.json({ error: "Items and delivery address are required" }, { status: 400 })
    }

    // Start a transaction
    // Note: Supabase JS client doesn't support transactions directly
    // We'll use multiple queries and handle errors carefully

    // 1. Calculate total amount and verify product availability
    let total_amount = 0
    const productIds = items.map((item: any) => item.product_id)

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, price, stock")
      .in("id", productIds)

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 })
    }

    // Check if all products exist and have sufficient stock
    const productsMap = new Map(products.map((p) => [p.id, p]))

    for (const item of items) {
      const product = productsMap.get(item.product_id)

      if (!product) {
        return NextResponse.json({ error: `Product with ID ${item.product_id} not found` }, { status: 404 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for product ${item.product_id}` }, { status: 400 })
      }

      total_amount += product.price * item.quantity
    }

    // 2. Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: session.user.id,
        status: "pending",
        total_amount,
        delivery_address,
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // 3. Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: productsMap.get(item.product_id)!.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      // If there's an error, we should ideally roll back the order
      // Since we don't have true transactions, we'll delete the order
      await supabase.from("orders").delete().eq("id", order.id)

      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // 4. Update product stock
    for (const item of items) {
      const product = productsMap.get(item.product_id)!

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: product.stock - item.quantity })
        .eq("id", item.product_id)

      if (stockError) {
        console.error("Error updating stock:", stockError)
        // We continue despite errors to avoid leaving the system in an inconsistent state
      }
    }

    return NextResponse.json({
      message: "Order created successfully",
      order: {
        ...order,
        items: orderItems,
      },
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

