import { createFileRoute } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { formatMoney } from "@/lib/utils-app";

export const Route = createFileRoute("/_authenticated/vendor/analytics")({
  component: VendorAnalytics,
});

function VendorAnalytics() {
  const { data: vendor } = useMyVendor();
  const { data } = useQuery({
    queryKey: ["vendor-analytics", vendor?.id],
    enabled: !!vendor,
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("total,status,created_at,order_items(product_id,name,quantity)")
        .eq("vendor_id", vendor!.id);
      return orders ?? [];
    },
  });

  if (!vendor) return null;
  if (!data || data.length === 0)
    return (
      <EmptyState
        title="No analytics yet"
        description="Sales metrics will appear once you receive orders."
      />
    );

  const paid = data.filter((o) => o.status !== "cancelled");
  const revenue = paid.reduce((s, o) => s + Number(o.total), 0);
  const avg = paid.length ? revenue / paid.length : 0;

  const productSales: Record<string, { name: string; qty: number }> = {};
  data.forEach((o) =>
    (o as any).order_items.forEach((i: any) => {
      productSales[i.product_id] = productSales[i.product_id] ?? { name: i.name, qty: 0 };
      productSales[i.product_id].qty += i.quantity;
    }),
  );
  const top = Object.values(productSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Total revenue</div>
          <div className="mt-2 text-xl font-semibold">{formatMoney(revenue)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Orders</div>
          <div className="mt-2 text-xl font-semibold">{paid.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Avg order value</div>
          <div className="mt-2 text-xl font-semibold">{formatMoney(avg)}</div>
        </Card>
      </div>
      <Card className="p-6">
        <h3 className="font-semibold">Top products</h3>
        {top.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No sales yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {top.map((p, i) => (
              <li key={i} className="flex justify-between">
                <span>{p.name}</span>
                <span className="font-medium">{p.qty} sold</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
