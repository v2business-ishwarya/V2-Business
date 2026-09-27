import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useSession } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils-app";

import { QrCode, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account/orders")({
  component: Orders,
});

const statusColor: Record<string, string> = {
  pending: "bg-warning/20 text-warning",
  under_verification: "bg-amber-100 text-amber-800 border-amber-300",
  confirmed: "bg-primary-soft text-primary",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
};

function getOrderMeta(o: any) {
  if (o.utrNumber) return { utrNumber: o.utrNumber, paymentMethod: o.paymentMethod || "DIRECT_UPI" };
  if (o.order?.utrNumber) return { utrNumber: o.order.utrNumber, paymentMethod: o.order.paymentMethod || "DIRECT_UPI" };

  if (typeof window !== "undefined") {
    try {
      const ids = [o.id, o.order_number, o.orderNumber].filter(Boolean);
      for (const id of ids) {
        const raw = localStorage.getItem(`order_meta_${id}`);
        if (raw) return JSON.parse(raw);
      }
      const allDirect = JSON.parse(localStorage.getItem("all_direct_upi_orders") || "[]");
      const found = allDirect.find((d: any) => ids.includes(d.orderId));
      if (found) return found;
    } catch {}
  }
  return null;
}

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

          {(() => {
            const meta = getOrderMeta(o);
            const utr = meta?.utrNumber || o.utrNumber || o.order?.utrNumber;
            const isDirectUpi = meta?.paymentMethod === "DIRECT_UPI" || Boolean(utr);
            const isPending =
              (o.status || "").toLowerCase() === "pending" && meta?.paymentStatus !== "CONFIRMED";

            if (!isDirectUpi) return null;

            return (
              <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <QrCode className="h-3.5 w-3.5 text-emerald-700" />
                  <span className="font-semibold text-foreground">Direct UPI Payment</span>
                  {utr && (
                    <span className="font-mono text-muted-foreground">
                      UTR: <strong className="text-foreground">{utr}</strong>
                    </span>
                  )}
                </div>
                <div>
                  {isPending ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Clock className="h-3 w-3 text-amber-600" /> Awaiting Seller Bank Check
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Payment Confirmed
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          <div className="mt-3 space-y-1 text-sm border-t pt-2">
            {(o.order_items || o.items || []).map((it: any) => (
              <div key={it.id} className="flex justify-between text-muted-foreground">
                <span className="truncate">
                  {it.name || it.product?.name || "Item"} × {it.quantity}
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
