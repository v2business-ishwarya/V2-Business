import { createFileRoute, Link } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { formatMoney } from "@/lib/utils-app";
import { Package, ShoppingBag, DollarSign, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor/")({
  component: VendorOverview,
});

function VendorOverview() {
  const { data: vendor, isLoading } = useMyVendor();
  const { data: stats } = useQuery({
    queryKey: ["vendor-stats", vendor?.id],
    enabled: !!vendor,
    queryFn: async () => {
      const [{ count: productCount }, { data: orders }] = await Promise.all([
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("vendor_id", vendor!.id),
        supabase.from("orders").select("total,status,created_at").eq("vendor_id", vendor!.id),
      ]);
      const revenue = (orders ?? [])
        .filter((o) => o.status !== "cancelled")
        .reduce((s, o) => s + Number(o.total), 0);
      const pending = (orders ?? []).filter((o) => o.status === "pending").length;
      return { productCount: productCount ?? 0, orders: orders?.length ?? 0, revenue, pending };
    },
  });

  if (isLoading) return null;
  if (!vendor) {
    return (
      <EmptyState
        title="Set up your store"
        description="Create a store profile to start selling."
        action={
          <Link to="/vendor/store">
            <Button>Create store</Button>
          </Link>
        }
      />
    );
  }
  if (vendor.status === "pending") {
    return (
      <EmptyState
        icon={<Clock className="h-6 w-6" />}
        title="Awaiting approval"
        description="Your store is pending admin review. You can prepare your products in the meantime."
      />
    );
  }
  if (vendor.status === "suspended") {
    return <EmptyState title="Store suspended" description="Please contact support for details." />;
  }

  const cards = [
    { label: "Revenue", value: formatMoney(stats?.revenue ?? 0), icon: DollarSign },
    { label: "Orders", value: stats?.orders ?? 0, icon: ShoppingBag },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock },
    { label: "Products", value: stats?.productCount ?? 0, icon: Package },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <c.icon className="h-4 w-4" />
              {c.label}
            </div>
            <div className="mt-2 text-xl font-semibold">{c.value}</div>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Welcome back, {vendor.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your products, fulfill orders, and grow your store.
        </p>
        <div className="mt-4 flex gap-2">
          <Link to="/vendor/products">
            <Button>Manage products</Button>
          </Link>
          <Link to="/store/$slug" params={{ slug: vendor.slug }}>
            <Button variant="outline">View storefront</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
