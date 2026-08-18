import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

  const { data: settings = [] } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.getAdminSettings(),
    select: (data: any[]) => {
      const s = data.find((d) => d.key === "PLATFORM_COMMISSION_RATE");
      if (s?.value?.rate) setRate(String(parseFloat(s.value.rate) * 100));
      return data;
    },
  });

  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ["admin-commissions"],
    queryFn: () => api.getAdminCommissions(),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api.updateAdminSetting("PLATFORM_COMMISSION_RATE", { rate: parseFloat(rate) / 100 },
        "Platform commission rate applied to all orders"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success(`Commission rate updated to ${rate}%`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalPlatformEarnings = (commissions as any[]).reduce(
    (s, c) => s + (c.platformEarnings ?? 0), 0
  );
  const totalVendorEarnings = (commissions as any[]).reduce(
    (s, c) => s + (c.vendorEarnings ?? 0), 0
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
            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Platform Earnings</p>
              <p className="text-xl font-bold">{formatMoney(totalPlatformEarnings)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vendor Payouts</p>
              <p className="text-xl font-bold">{formatMoney(totalVendorEarnings)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Percent className="h-5 w-5 text-purple-700" />
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
          This rate applies to all future orders. Historical orders retain the rate at the time of order.
        </p>
        <div className="flex gap-3 items-end">
          <div className="w-40">
            <Label>Commission % (e.g. 10)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </Card>

      {/* Commission Records */}
      <section className="space-y-3">
        <h2 className="font-semibold">Commission Records</h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading…</div>
        ) : (commissions as any[]).length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No commission records yet. Place an order to start tracking.
          </Card>
        ) : (
          <div className="space-y-2">
            {(commissions as any[]).map((c: any) => (
              <Card key={c.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="font-mono text-sm">Order #{c.orderId.substring(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      Vendor: {c.vendor?.name ?? c.vendorId.substring(0, 8)} &nbsp;·&nbsp;
                      Rate: {(c.rate * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-700">
                      Platform: {formatMoney(c.platformEarnings)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vendor: {formatMoney(c.vendorEarnings)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
