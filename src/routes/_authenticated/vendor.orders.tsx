import { createFileRoute } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { QrCode, CheckCircle2, Copy, Check, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor/orders")({
  component: VendorOrders,
});

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

function getOrderMeta(o: any) {
  if (o.utrNumber) return { utrNumber: o.utrNumber, paymentMethod: o.paymentMethod || "DIRECT_UPI" };
  if (o.order?.utrNumber) return { utrNumber: o.order.utrNumber, paymentMethod: o.order.paymentMethod || "DIRECT_UPI" };

  if (typeof window !== "undefined") {
    try {
      const ids = [o.id, o.orderId, o.order?.id, o.orderNumber].filter(Boolean);
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

function VendorOrders() {
  const { data: vendor } = useMyVendor();
  const qc = useQueryClient();
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

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

              {/* Direct UPI Payment Verification Section */}
              {utr && (
                <div
                  className={`mt-3 rounded-xl border p-3.5 space-y-2.5 ${
                    currentStatus === "PENDING" || currentStatus === "UNDER_VERIFICATION"
                      ? "border-amber-300 bg-amber-500/10"
                      : "border-emerald-300 bg-emerald-500/10"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-emerald-700" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Customer Direct UPI Payment
                      </span>
                    </div>
                    {currentStatus === "PENDING" || currentStatus === "UNDER_VERIFICATION" ? (
                      <Badge className="bg-amber-600 hover:bg-amber-600 text-white text-[10px] font-bold">
                        Verification Required
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold">
                        ✓ Payment Confirmed
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground font-medium">Submitted 12-Digit UTR:</span>
                    <code className="rounded bg-background border px-2.5 py-1 font-mono text-sm font-bold text-foreground tracking-wider">
                      {utr}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(utr);
                        setCopiedUtr(utr);
                        toast.success("UTR copied to clipboard!");
                        setTimeout(() => setCopiedUtr(null), 2500);
                      }}
                    >
                      {copiedUtr === utr ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      {copiedUtr === utr ? "Copied" : "Copy"}
                    </Button>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {currentStatus === "PENDING" || currentStatus === "UNDER_VERIFICATION"
                      ? "⚠️ Check your PhonePe / Google Pay / Bank SMS for this credit before clicking confirm or shipping."
                      : "Payment has been verified in your bank account. Proceed with packaging and shipment."}
                  </p>

                  {(currentStatus === "PENDING" || currentStatus === "UNDER_VERIFICATION") && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-300/40">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-xs"
                        onClick={() => {
                          updateMutation.mutate({ id: o.id, status: "PROCESSING" });
                          if (meta?.orderId) {
                            try {
                              meta.paymentStatus = "CONFIRMED";
                              localStorage.setItem(`order_meta_${meta.orderId}`, JSON.stringify(meta));
                            } catch {}
                          }
                          toast.success("Payment verified! Order marked as Processing.");
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirm Payment Received
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10 text-xs font-semibold"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure this payment was not received in your bank? This will cancel the order.",
                            )
                          ) {
                            updateMutation.mutate({ id: o.id, status: "CANCELLED" });
                            toast.error("Order cancelled due to unverified payment.");
                          }
                        }}
                      >
                        Payment Not Found
                      </Button>
                    </div>
                  )}
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
