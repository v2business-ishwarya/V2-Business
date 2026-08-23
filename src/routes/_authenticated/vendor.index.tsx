import { createFileRoute, Link } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
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

  const { data: rawProducts = [] } = useQuery({
    queryKey: ["vendor-products", vendor?.id],
    enabled: !!vendor,
    queryFn: () => api.getProducts({ vendorId: vendor?.id }),
  });

  const { data: rawOrders = [] } = useQuery({
    queryKey: ["vendor-orders", vendor?.id],
    enabled: !!vendor,
    queryFn: () => api.getVendorOrders(),
  });

  const products: any[] = (rawProducts as any)?.data ?? (Array.isArray(rawProducts) ? rawProducts : []);
  const orders: any[] = (rawOrders as any)?.data ?? (Array.isArray(rawOrders) ? rawOrders : []);

  const revenue = orders
    .filter((o) => (o.status || "").toUpperCase() !== "CANCELLED")
    .reduce((s, o) => s + Number(o.total || o.subtotal || 0), 0);

  const pending = orders.filter((o) => (o.status || "").toUpperCase() === "PENDING").length;

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

  const cards = [
    { label: "Revenue", value: formatMoney(revenue), icon: DollarSign },
    { label: "Orders", value: orders.length, icon: ShoppingBag },
    { label: "Pending Orders", value: pending, icon: Clock },
    { label: "Active Products", value: products.length, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Vendor Overview</h1>
        <p className="text-sm text-muted-foreground">Summary of your store activity and performance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
        <h2 className="text-lg font-semibold">Welcome, {vendor.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your catalogue, track shipments, and inspect your payouts.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/vendor/products">
            <Button>Manage products</Button>
          </Link>
          <Link to="/vendor/orders">
            <Button variant="outline">View orders</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
