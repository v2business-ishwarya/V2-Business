import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils-app";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [v, p, o, u] = await Promise.all([
        supabase.from("vendors").select("id,status", { count: "exact" }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total,status"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const pendingVendors = (v.data ?? []).filter((x) => x.status === "pending").length;
      const revenue = (o.data ?? [])
        .filter((x) => x.status !== "cancelled")
        .reduce((s, x) => s + Number(x.total), 0);
      return {
        vendors: v.count ?? 0,
        pendingVendors,
        products: p.count ?? 0,
        users: u.count ?? 0,
        orders: o.data?.length ?? 0,
        revenue,
      };
    },
  });
  const cards = [
    { label: "Total revenue", value: formatMoney(data?.revenue ?? 0) },
    { label: "Orders", value: data?.orders ?? 0 },
    { label: "Vendors", value: `${data?.vendors ?? 0} (${data?.pendingVendors ?? 0} pending)` },
    { label: "Products", value: data?.products ?? 0 },
    { label: "Users", value: data?.users ?? 0 },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <Card key={c.label} className="p-4">
          <div className="text-xs text-muted-foreground">{c.label}</div>
          <div className="mt-2 text-xl font-semibold">{c.value}</div>
        </Card>
      ))}
    </div>
  );
}
