import { createFileRoute } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { formatMoney } from "@/lib/utils-app";

export const Route = createFileRoute("/_authenticated/vendor/analytics")({
  component: VendorAnalytics,
});

function VendorAnalytics() {
  const { data: vendor } = useMyVendor();
  const { data: rawOrders = [], isLoading } = useQuery({
    queryKey: ["vendor-analytics", vendor?.id],
    enabled: !!vendor,
    queryFn: () => api.getVendorOrders(),
  });

  const orders: any[] = (rawOrders as any)?.data ?? (Array.isArray(rawOrders) ? rawOrders : []);

  if (!vendor) return null;
  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading analytics…</div>;

  const paid = orders.filter((o) => (o.status || "").toUpperCase() !== "CANCELLED");
  const revenue = paid.reduce((s, o) => s + Number(o.total || o.subtotal || 0), 0);
  const avg = paid.length ? revenue / paid.length : 0;

  const productSales: Record<string, { name: string; qty: number }> = {};
  orders.forEach((o) => {
    const items = o.items || o.order?.items || [];
    items.forEach((i: any) => {
      const pId = i.productId || i.id;
      const name = i.product?.name || i.name || "Product";
      productSales[pId] = productSales[pId] ?? { name, qty: 0 };
      productSales[pId].qty += Number(i.quantity) || 1;
    });
  });

  const top = Object.values(productSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  if (orders.length === 0)
    return (
      <EmptyState
        title="No analytics yet"
        description="Sales metrics will appear once you receive orders."
      />
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Store Analytics</h1>
        <p className="text-sm text-muted-foreground">Revenue and product performance insights</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Total Revenue</div>
          <div className="mt-2 text-2xl font-semibold">{formatMoney(revenue)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Completed Orders</div>
          <div className="mt-2 text-2xl font-semibold">{paid.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Average Order Value</div>
          <div className="mt-2 text-2xl font-semibold">{formatMoney(avg)}</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-base">Top Performing Products</h3>
        {top.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No sales recorded yet.</p>
        ) : (
          <ul className="mt-3 divide-y text-sm">
            {top.map((p, i) => (
              <li key={i} className="flex justify-between py-2">
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground">{p.qty} units sold</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
