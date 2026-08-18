import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import {
  LayoutDashboard, Store, FolderTree, Image, Users,
  ShoppingCart, CreditCard, Truck, Percent, FileText,
  BarChart2, Settings, Package
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — V2 Business" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    return { isAdmin };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin } = Route.useRouteContext();
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-2xl p-8">
        <EmptyState
          title="Access denied"
          description="You must be an administrator to view this area."
        />
      </div>
    );
  return (
    <DashboardShell
      title="Admin"
      nav={[
        { to: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: "/admin/vendors", label: "Vendors", icon: <Store className="h-4 w-4" /> },
        { to: "/admin/categories", label: "Categories", icon: <FolderTree className="h-4 w-4" /> },
        { to: "/admin/banners", label: "Banners", icon: <Image className="h-4 w-4" /> },
        { to: "/admin/users", label: "Customers", icon: <Users className="h-4 w-4" /> },
        { to: "/admin/orders", label: "Orders", icon: <ShoppingCart className="h-4 w-4" /> },
        { to: "/admin/products", label: "Products", icon: <Package className="h-4 w-4" /> },
        { to: "/admin/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
        { to: "/admin/delivery", label: "Delivery", icon: <Truck className="h-4 w-4" /> },
        { to: "/admin/commission", label: "Commission", icon: <Percent className="h-4 w-4" /> },
        { to: "/admin/invoices", label: "Invoices", icon: <FileText className="h-4 w-4" /> },
        { to: "/admin/analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
        { to: "/admin/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
      ]}
    >
      <Outlet />
    </DashboardShell>
  );
}

