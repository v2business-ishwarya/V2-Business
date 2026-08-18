import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useSession } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils-app";

export const Route = createFileRoute("/_authenticated/account/orders")({
  component: Orders,
});

const statusColor: Record<string, string> = {
  pending: "bg-warning/20 text-warning",
  confirmed: "bg-primary-soft text-primary",
  shipped: "bg-primary-soft text-primary",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
};

function Orders() {
  const { session } = useSession();
  const userId = session?.user?.id;

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-orders", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      const res = await api.getOrders({ customer_id: userId });
      return res.data ?? [];
    },
    enabled: !!userId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading orders</div>;

  if (data.length === 0)
    return (
      <EmptyState
        title="No orders yet."
        description="Your orders will appear here after checkout."
      />
    );

  return (
    <div className="space-y-3">
      {data.map((o: any) => (
        <Card key={o.id} className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{o.order_number}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString()} ·{" "}
                <Link
                  to="/store/$slug"
                  params={{ slug: o.vendors?.slug ?? "" }}
                  className="hover:text-primary"
                >
                  {o.vendors?.name}
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={statusColor[o.status] ?? ""}>{o.status}</Badge>
              <span className="font-semibold">{formatMoney(o.total)}</span>
            </div>
          </div>
          <div className="mt-3 space-y-1 text-sm">
            {o.order_items.map((it: any) => (
              <div key={it.id} className="flex justify-between text-muted-foreground">
                <span className="truncate">
                  {it.name} × {it.quantity}
                </span>
                <span>{formatMoney(Number(it.price) * it.quantity)}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
