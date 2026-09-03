import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Percent, TrendingUp, IndianRupee } from "lucide-react";
import { formatMoney } from "@/lib/utils-app";

export const Route = createFileRoute("/_authenticated/admin/commission")({
  head: () => ({ meta: [{ title: "Commission Management — Admin" }] }),
  component: AdminCommissionPage,
});

function AdminCommissionPage() {
  const qc = useQueryClient();
  const [rate, setRate] = useState("10");

  const { data: rawSettings = [] } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.getAdminSettings(),
    select: (data: any) => {
      const list = Array.isArray(data) ? data : data?.data ?? [];
      const s = list.find((d: any) => d.key === "PLATFORM_COMMISSION_RATE");
      if (s?.value) {
        if (typeof s.value === "object" && s.value.rate != null) {
          setRate(String(parseFloat(s.value.rate) * 100));
        } else if (typeof s.value === "number") {
          setRate(String(s.value * 100));
        } else if (typeof s.value === "string") {
          try {
            const parsed = JSON.parse(s.value);
            if (parsed.rate != null) setRate(String(parseFloat(parsed.rate) * 100));
          } catch {
            setRate(s.value);
          }
        }
      }
      return list;
    },
  });

  const { data: rawCommissions = [], isLoading } = useQuery({
    queryKey: ["admin-commissions"],
    queryFn: () => api.getAdminCommissions(),
  });

  const commissionsList: any[] = Array.isArray(rawCommissions)
    ? rawCommissions
    : (rawCommissions as any)?.data ?? [];

  const updateMutation = useMutation({
    mutationFn: () =>
      api.updateAdminSetting(
        "PLATFORM_COMMISSION_RATE",
        { rate: parseFloat(rate) / 100 },
        "Platform commission rate applied to all orders"
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success(`Commission rate updated to ${rate}%`);
    },
    onError: (e: any) => toast.error(e.message || "Failed to update commission rate"),
  });

  const totalPlatformEarnings = commissionsList.reduce(
    (s, c) => s + (Number(c.platformEarnings) || 0),
    0
  );
  const totalVendorEarnings = commissionsList.reduce(
    (s, c) => s + (Number(c.vendorEarnings) || 0),
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Commission Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure platform commission and view earnings breakdown
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Platform Earnings (10%)</p>
              <p className="text-xl font-bold">{formatMoney(totalPlatformEarnings)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vendor Payouts (90%)</p>
              <p className="text-xl font-bold">{formatMoney(totalVendorEarnings)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
              <Percent className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Commission Rate</p>
              <p className="text-xl font-bold">{rate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rate Configuration */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">Configure Commission Rate</h2>
        <p className="text-sm text-muted-foreground">
          This rate applies to all marketplace orders. Sellers receive the remainder directly.
        </p>
        <div className="flex gap-3 items-end">
          <div className="w-40">
            <Label htmlFor="comm-rate">Commission % (e.g. 10)</Label>
            <Input
              id="comm-rate"
              type="number"
              min="0"
              max="100"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save Rate"}
          </Button>
        </div>
      </Card>

      {/* Commission Records */}
      <section className="space-y-3">
        <h2 className="font-semibold">Commission Records</h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading commission records…</div>
        ) : commissionsList.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No commission records recorded yet. Records will appear here automatically when customer orders are placed.
          </Card>
        ) : (
          <div className="space-y-2">
            {commissionsList.map((c: any) => {
              const orderId = typeof c.orderId === "string" ? c.orderId.substring(0, 8) : c.id?.substring(0, 8) || "Order";
              const vendorName = c.vendor?.name || (typeof c.vendorId === "string" ? c.vendorId.substring(0, 8) : "Vendor");
              const ratePercent = typeof c.rate === "number" ? (c.rate * 100).toFixed(0) : "10";

              return (
                <Card key={c.id || Math.random()} className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="font-mono text-sm font-semibold">Order #{orderId}</p>
                      <p className="text-xs text-muted-foreground">
                        Vendor: {vendorName} &nbsp;·&nbsp; Rate: {ratePercent}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        Platform: {formatMoney(Number(c.platformEarnings) || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vendor: {formatMoney(Number(c.vendorEarnings) || 0)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
