import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils-app";
import { getAdminDuesSummary, CURRENT_BILLING_MONTH } from "@/lib/vendor-admin-service";
import { useMemo } from "react";
import {
  Store,
  IndianRupee,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => api.getAdminStats(),
  });

  const duesSummary = useMemo(() => getAdminDuesSummary(), []);

  const cards = [
    { label: "Marketplace Sales Revenue", value: formatMoney(duesSummary.totalMarketplaceRevenue || (data?.revenue ?? 0)), icon: <TrendingUp className="h-4 w-4 text-emerald-600" /> },
    { label: "Customer Orders", value: duesSummary.totalMarketplaceOrders || (data?.orders ?? 0), icon: <ShoppingBag className="h-4 w-4 text-blue-600" /> },
    { label: "Active Vendors", value: duesSummary.activeVendorsCount, icon: <Store className="h-4 w-4 text-primary" /> },
    { label: "Monthly Dues Collected", value: formatMoney(duesSummary.totalCollectedDues), icon: <IndianRupee className="h-4 w-4 text-emerald-600" /> },
    { label: "Pending Dues Receivable", value: formatMoney(duesSummary.totalPendingDues), icon: <Clock className="h-4 w-4 text-amber-600" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Marketplace operations, vendor monthly dues, and customer sales metrics</p>
        </div>
        <Link to="/admin/vendors">
          <Button size="sm" className="gap-1.5 font-bold">
            <Store className="h-3.5 w-3.5" /> Manage Vendors & Dues <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* ⚠️ Pending Dues Notification for Admin */}
      {duesSummary.defaultingVendors.length > 0 && (
        <Card className="border-2 border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 font-bold">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-amber-950 dark:text-amber-200">
                  {duesSummary.defaultingVendors.length} Vendor{duesSummary.defaultingVendors.length > 1 ? "s" : ""} have unpaid monthly maintenance fees for {CURRENT_BILLING_MONTH}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total {formatMoney(duesSummary.totalPendingDues)} due payable to you. Send official warning notices or record payments.
                </p>
              </div>
            </div>
            <Link to="/admin/vendors">
              <Button size="sm" variant="outline" className="border-amber-500/40 text-amber-800 dark:text-amber-300 font-bold text-xs">
                View Defaulting Vendors
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label} className="p-4 border-2 border-border/60 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground">{c.label}</div>
              {c.icon}
            </div>
            <div className="mt-2 text-xl font-bold">{c.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
