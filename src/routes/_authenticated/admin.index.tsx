import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils-app";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => api.getAdminStats(),
  });

  const cards = [
    { label: "Total revenue", value: formatMoney(data?.revenue ?? 0) },
    { label: "Orders", value: data?.orders ?? 0 },
    { label: "Products", value: data?.products ?? 0 },
    { label: "Users & Customers", value: data?.users ?? 0 },
    { label: "Low Stock Items", value: data?.lowStockProducts ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Marketplace key metrics and operations</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <div className="text-xs text-muted-foreground">{c.label}</div>
            <div className="mt-2 text-xl font-semibold">{c.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
