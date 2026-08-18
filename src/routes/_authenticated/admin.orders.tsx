import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils-app";
import { ShoppingCart, Users, Package, Store, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [{ title: "Order Management — Admin" }] }),
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api.getAdminAllOrders(),
  });

  const orders = ordersData?.data ?? [];

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const paymentColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Order Management</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage all marketplace orders and vendor sub-orders</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <Card key={order.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-medium">#{order.id.substring(0, 8)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status] ?? "bg-gray-100 text-gray-800"}`}>
                      {order.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentColor[order.paymentStatus] ?? "bg-gray-100 text-gray-800"}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customer: {order.user?.name ?? order.user?.email ?? "—"} &nbsp;·&nbsp;
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                  {order.vendorOrders && order.vendorOrders.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {order.vendorOrders.length} vendor sub-order{order.vendorOrders.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{formatMoney(order.total)}</p>
                  <p className="text-xs text-muted-foreground">{order.items?.length ?? 0} item(s)</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
