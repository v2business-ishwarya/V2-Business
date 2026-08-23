import { createFileRoute } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { formatMoney } from "@/lib/utils-app";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vendor/orders")({
  component: VendorOrders,
});

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

function VendorOrders() {
  const { data: vendor } = useMyVendor();
  const qc = useQueryClient();

  const { data: rawOrders = [], isLoading } = useQuery({
    queryKey: ["vendor-orders", vendor?.id],
    enabled: !!vendor,
    queryFn: () => api.getVendorOrders(),
  });

  const orders: any[] = (rawOrders as any)?.data ?? (Array.isArray(rawOrders) ? rawOrders : []);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateVendorOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-orders"] });
      toast.success("Order status updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update order"),
  });

  if (!vendor) return null;
  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading orders…</div>;
  if (orders.length === 0)
    return (
      <EmptyState title="No orders yet" description="Orders from customers will appear here." />
    );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Vendor Orders</h1>
        <p className="text-sm text-muted-foreground">Fulfill orders and manage shipments</p>
      </div>

      <div className="space-y-3">
        {orders.map((o: any) => {
          const items = o.items || o.order?.items || [];
          const currentStatus = (o.status || "PENDING").toUpperCase();

          return (
            <Card key={o.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Order #{o.orderNumber || o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{currentStatus}</Badge>
                  <span className="font-semibold">{formatMoney(o.total || o.subtotal || 0)}</span>
                  <Select
                    value={currentStatus}
                    onValueChange={(v) => updateMutation.mutate({ id: o.id, status: v })}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {items.length > 0 && (
                <div className="mt-3 space-y-1 text-sm border-t pt-3">
                  {items.map((it: any) => (
                    <div key={it.id || it.productId} className="flex justify-between text-muted-foreground">
                      <span className="truncate">
                        {it.product?.name || it.name || "Item"} × {it.quantity}
                      </span>
                      <span>{formatMoney(Number(it.price) * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
              {o.order?.shippingAddress && (
                <div className="mt-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Delivery Address</p>
                  <p>
                    {typeof o.order.shippingAddress === "string"
                      ? o.order.shippingAddress
                      : `${o.order.shippingAddress.street || ""}, ${o.order.shippingAddress.city || ""} ${o.order.shippingAddress.zipCode || ""}`}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
