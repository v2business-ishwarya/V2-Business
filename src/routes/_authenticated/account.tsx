import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { User, ShoppingBag, MapPin, Heart, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [{ title: "My Account — V2 Business" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <DashboardShell
      title="My Account"
      nav={[
        { to: "/account", label: "Profile", icon: <User className="h-4 w-4" /> },
        { to: "/account/orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
        { to: "/account/addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
        { to: "/account/wishlist", label: "Wishlist", icon: <Heart className="h-4 w-4" /> },
        { to: "/account/invoices", label: "Invoices", icon: <FileText className="h-4 w-4" /> },
      ]}
    >
      <Outlet />
    </DashboardShell>
  ),
});
