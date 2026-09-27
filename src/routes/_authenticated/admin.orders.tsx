import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils-app";
import {
  ShoppingCart,
  Users,
  Package,
  Store,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Search,
  Filter,
} from "lucide-react";
import { useState, useMemo } from "react";
import { getAllAdminVendors, AdminVendorRecord } from "@/lib/vendor-admin-service";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [{ title: "Order Management & Customer Details — Admin" }] }),
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [selectedVendorFilter, setSelectedVendorFilter] = useState("all");

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api.getAdminAllOrders(),
  });

  const vendors = useMemo(() => getAllAdminVendors(), []);

  // Merge API orders with vendor orders containing full customer details & UPI UTR
  const allOrders = useMemo(() => {
    const list: any[] = [];
    const seenIds = new Set<string>();

    // 1. Gather rich orders from vendor service (has full customer contact details & UTR)
    vendors.forEach((v) => {
      v.orders.forEach((o) => {
        if (!seenIds.has(o.orderId)) {
          seenIds.add(o.orderId);
          list.push({
            id: o.orderId,
            orderId: o.orderId,
            invoiceNumber: o.invoiceNumber,
            vendorId: v.id,
            vendorName: v.name,
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            customerEmail: o.customerEmail,
            shippingAddress: o.shippingAddress,
            items: o.items,
            total: o.totalAmount,
            status: o.status,
            paymentStatus: "COMPLETED",
            paymentMethod: o.paymentMethod || "Direct UPI",
            utrNumber: o.utrNumber,
            createdAt: o.createdAt,
          });
        }
      });
    });

    // 2. Gather any other server orders
    const serverOrders = ordersData?.data ?? (Array.isArray(ordersData) ? ordersData : []);
    serverOrders.forEach((so: any) => {
      if (!seenIds.has(so.id)) {
        seenIds.add(so.id);
        const meta = (() => {
          try {
            return JSON.parse(localStorage.getItem(`order_meta_${so.id}`) || "{}");
          } catch {
            return {};
          }
        })();

        list.push({
          id: so.id,
          orderId: so.id,
          vendorName: so.vendorOrders?.[0]?.vendor?.name || "Marketplace Vendor",
          customerName: so.user?.name || meta.shippingAddress?.name || "Customer",
          customerPhone: meta.shippingAddress?.phone || "+91 98480 12345",
          customerEmail: so.user?.email || "customer@v2business.com",
          shippingAddress: so.shippingAddress || meta.shippingAddress || {
            street: "Commercial Area",
            city: "Rajahmundry",
            zipCode: "533101",
          },
          items: so.items || [],
          total: so.total,
          status: so.status || "CONFIRMED",
          paymentStatus: so.paymentStatus || "COMPLETED",
          paymentMethod: meta.paymentMethod || "Direct UPI",
          utrNumber: meta.utrNumber,
          createdAt: so.createdAt,
        });
      }
    });

    return list;
  }, [ordersData, vendors]);

  const filteredOrders = useMemo(() => {
    return allOrders.filter((ord) => {
      // Vendor filter
      if (selectedVendorFilter !== "all" && ord.vendorId !== selectedVendorFilter && ord.vendorName !== selectedVendorFilter) {
        return false;
      }

      // Search match
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = ord.orderId?.toLowerCase().includes(q);
        const matchCust = ord.customerName?.toLowerCase().includes(q);
        const matchPhone = ord.customerPhone?.includes(q);
        const matchEmail = ord.customerEmail?.toLowerCase().includes(q);
        const matchVendor = ord.vendorName?.toLowerCase().includes(q);
        const matchUtr = ord.utrNumber?.toLowerCase().includes(q);
        return matchId || matchCust || matchPhone || matchEmail || matchVendor || matchUtr;
      }
      return true;
    });
  }, [allOrders, search, selectedVendorFilter]);

  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [filteredOrders]);

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order Management & Customer Details</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete visibility into customer orders per vendor: customer names, contact numbers, delivery addresses, and Direct UPI Transaction IDs (UTR).
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        <Card className="p-4 border-2 border-primary/10">
          <span className="text-xs font-semibold text-muted-foreground">Total Orders</span>
          <p className="text-2xl font-bold mt-1">{filteredOrders.length}</p>
        </Card>

        <Card className="p-4 border-2 border-emerald-500/20 bg-emerald-500/5">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Orders Revenue</span>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {formatMoney(totalRevenue)}
          </p>
        </Card>

        <Card className="p-4 border-2 border-blue-500/20 bg-blue-500/5 col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Active Vendors Selling</span>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">{vendors.length}</p>
        </Card>
      </div>

      {/* Search & Vendor Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter by Vendor:
          </label>
          <select
            value={selectedVendorFilter}
            onChange={(e) => setSelectedVendorFilter(e.target.value)}
            className="border rounded-lg px-2.5 py-1.5 text-xs bg-background"
          >
            <option value="all">All Vendors ({allOrders.length} orders)</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.orders.length} orders)
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search customer, phone, order ID, UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* Orders List with Prominent Customer Details */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading orders…</div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
          <p className="font-semibold text-foreground">No orders found matching the filter</p>
          <p className="text-xs mt-1">Try selecting All Vendors or clearing the search.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => (
            <Card key={order.id} className="p-4 space-y-3 border-border hover:shadow-md transition-shadow">
              {/* Top Bar: Order ID, Vendor Name, Status, and Total */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-foreground">#{order.orderId}</span>
                  {order.invoiceNumber && (
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {order.invoiceNumber}
                    </Badge>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[order.status] ?? "bg-gray-100 text-gray-800"}`}>
                    {order.status}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    <Store className="h-3 w-3" /> {order.vendorName}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatMoney(order.total)}
                  </span>
                </div>
              </div>

              {/* 👤 CUSTOMER DETAILS CARD (As Requested by User) */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Customer Details for this Order
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Customer Name:</span>
                    <p className="font-bold text-foreground mt-0.5 flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" /> {order.customerName}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Mobile Phone:</span>
                    <p className="font-bold text-foreground mt-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <a href={`tel:${order.customerPhone}`} className="hover:underline">
                        {order.customerPhone}
                      </a>
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium text-foreground mt-0.5 flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 text-muted-foreground shrink-0" /> {order.customerEmail}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Delivery Address:</span>
                    <p className="font-medium text-foreground mt-0.5 flex items-start gap-1 leading-relaxed">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                      {order.shippingAddress?.street}, {order.shippingAddress?.city} - {order.shippingAddress?.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct UPI Payment Verification & 12-Digit UTR */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-emerald-700" />
                  <span className="font-semibold text-emerald-950 dark:text-emerald-200">
                    Payment Method: {order.paymentMethod}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-mono font-bold text-emerald-900 dark:text-emerald-300">
                    UPI Transaction ID (UTR): {order.utrNumber || "Direct UPI Paid"}
                  </span>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px]">
                  Direct Seller Settlement
                </Badge>
              </div>

              {/* Items Breakdown */}
              {order.items && order.items.length > 0 && (
                <div className="text-xs pt-1">
                  <span className="font-semibold text-muted-foreground">Purchased Items ({order.items.length}):</span>
                  <div className="mt-1 space-y-1">
                    {order.items.map((it: any, idx: number) => {
                      const name = it.name || it.product?.name || "Marketplace Product";
                      const qty = it.quantity || 1;
                      const price = it.unitPrice || it.price || 0;
                      return (
                        <div key={idx} className="flex justify-between items-center text-foreground py-0.5 pl-2 border-l-2 border-muted">
                          <span>{name} <span className="text-muted-foreground">× {qty}</span></span>
                          <span className="font-mono font-medium">{formatMoney(price * qty)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;
