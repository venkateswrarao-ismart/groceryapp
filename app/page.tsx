import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Grocery Management API</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">API Documentation</h2>

          <div className="space-y-6">
            <div className="border rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Authentication</h3>
              <p className="mb-4">Secure authentication system with role-based access control.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded p-3 bg-muted/50">
                  <p className="font-medium">POST /api/auth/signup</p>
                  <p className="text-sm text-muted-foreground">Create new user account</p>
                </div>
                <div className="border rounded p-3 bg-muted/50">
                  <p className="font-medium">POST /api/auth/signin</p>
                  <p className="text-sm text-muted-foreground">Sign in existing user</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Products</h3>
              <p className="mb-4">Manage grocery products inventory.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded p-3 bg-muted/50">
                  <p className="font-medium">GET /api/products</p>
                  <p className="text-sm text-muted-foreground">List all products</p>
                </div>
                <div className="border rounded p-3 bg-muted/50">
                  <p className="font-medium">POST /api/products</p>
                  <p className="text-sm text-muted-foreground">Add new product (Vendor/Admin)</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Orders</h3>
              <p className="mb-4">Handle customer orders and delivery tracking.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded p-3 bg-muted/50">
                  <p className="font-medium">POST /api/orders</p>
                  <p className="text-sm text-muted-foreground">Create new order (Customer)</p>
                </div>
                <div className="border rounded p-3 bg-muted/50">
                  <p className="font-medium">PATCH /api/orders/:id/status</p>
                  <p className="text-sm text-muted-foreground">Update order status (Delivery/Admin)</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Users</h3>
              <p className="mb-4">User management with role-based permissions.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded p-3 bg-muted/50">
                  <p className="font-medium">GET /api/users</p>
                  <p className="text-sm text-muted-foreground">List users (Admin only)</p>
                </div>
                <div className="border rounded p-3 bg-muted/50">
                  <p className="font-medium">PATCH /api/users/:id/role</p>
                  <p className="text-sm text-muted-foreground">Update user role (Admin only)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/api-docs"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              View Full API Documentation
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Grocery Management API
        </div>
      </footer>
    </div>
  )
}

