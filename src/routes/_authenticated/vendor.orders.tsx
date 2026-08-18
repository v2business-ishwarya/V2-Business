import { createFileRoute } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

function VendorOrders() {
  const { data: vendor } = useMyVendor();
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["vendor-orders", vendor?.id],
    enabled: !!vendor,
    queryFn: async () =>
      (
        await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("vendor_id", vendor!.id)
          .order("created_at", { ascending: false })
      ).data ?? [],
  });
  const update = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: status as any })
      .eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["vendor-orders"] });
    toast.success("Order updated");
  };
  if (!vendor) return null;
  if (orders.length === 0)
    return (
      <EmptyState title="No orders yet" description="Orders from customers will appear here." />
    );
  return (
    <div className="space-y-3">
      {orders.map((o: any) => (
        <Card key={o.id} className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{o.order_number}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{o.status}</Badge>
              <span className="font-semibold">{formatMoney(o.total)}</span>
              <Select value={o.status} onValueChange={(v) => update(o.id, v)}>
                <SelectTrigger className="w-40">
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
          {o.shipping_address && (
            <div className="mt-3 rounded-lg bg-surface-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Ship to</p>
              <p>
                {o.shipping_address.full_name}, {o.shipping_address.street},{" "}
                {o.shipping_address.city} {o.shipping_address.postal_code},{" "}
                {o.shipping_address.country}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
