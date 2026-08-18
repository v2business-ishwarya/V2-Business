import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { LayoutDashboard, Package, ShoppingBag, Store, Tag, BarChart3, Truck, CreditCard, FileText } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { storeSession, useSession } from "@/hooks/use-session";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/vendor")({
  head: () => ({ meta: [{ title: "Vendor — V2 Business" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const rawUser = localStorage.getItem("user");
    if (!localStorage.getItem("accessToken") || !rawUser) throw redirect({ to: "/auth" });
    const user = JSON.parse(rawUser);
    return { isVendor: user.role === "VENDOR" || user.role === "ADMIN" };
  },
  component: VendorLayout,
});

function VendorLayout() {
  const { isVendor } = Route.useRouteContext();
  if (!isVendor) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <EmptyState
          title="Start selling on V2 Business"
          description="Your customer account stays active. Add seller tools for products, orders, delivery and payouts."
          action={<BecomeVendorButton />}
        />
      </div>
    );
  }
  return (
    <DashboardShell
      title="Vendor dashboard"
      nav={[
        { to: "/vendor", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: "/vendor/products", label: "Products", icon: <Package className="h-4 w-4" /> },
        { to: "/vendor/orders", label: "Orders & delivery", icon: <ShoppingBag className="h-4 w-4" /> },
        { to: "/vendor/coupons", label: "Discounts", icon: <Tag className="h-4 w-4" /> },
        { to: "/vendor/store", label: "Store profile", icon: <Store className="h-4 w-4" /> },
        { to: "/vendor/analytics", label: "Payments & analytics", icon: <BarChart3 className="h-4 w-4" /> },
        { to: "/vendor/delivery", label: "Delivery", icon: <Truck className="h-4 w-4" /> },
        { to: "/vendor/payments", label: "Payment providers", icon: <CreditCard className="h-4 w-4" /> },
        { to: "/vendor/invoices", label: "Invoices", icon: <FileText className="h-4 w-4" /> },
      ]}
    >
      <Outlet />
    </DashboardShell>
  );
}

function BecomeVendorButton() {
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();
  const [loading, setLoading] = useState(false);
  const becomeVendor = async () => {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/vendor" } });
      return;
    }
    setLoading(true);
    try {
      const user = await api.becomeVendor();
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      storeSession({ accessToken: token, user });
      toast.success("Seller tools are ready.");
      navigate({ to: "/vendor", replace: true });
      window.location.reload();
    } catch (error: any) {
      if (!localStorage.getItem("accessToken")) {
        toast.error("Your session has expired. Please sign in again.");
        navigate({ to: "/auth", search: { redirect: "/vendor" } });
      } else {
        toast.error(error.message ?? "Unable to enable seller tools");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button onClick={becomeVendor} disabled={loading || sessionLoading}>
      {loading ? "Setting up..." : "Become a vendor"}
    </Button>
  );
}
