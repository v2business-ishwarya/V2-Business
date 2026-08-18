import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Info } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor/payments")({
  head: () => ({ meta: [{ title: "Payments — Vendor" }] }),
  component: VendorPaymentsPage,
});

function VendorPaymentsPage() {
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["payment-providers"],
    queryFn: () => api.getPaymentProviders(),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.getAdminSettings(),
  });

  const commissionSetting = (settings as any[]).find(
    (s: any) => s.key === "PLATFORM_COMMISSION_RATE"
  );
  const commissionRate = commissionSetting?.value?.rate
    ? (parseFloat(commissionSetting.value.rate) * 100).toFixed(0)
    : "10";

  const enabledProviders = (providers as any[]).filter((p: any) => p.isEnabled);

  const providerLabels: Record<string, string> = {
    razorpay: "Razorpay",
    cashfree: "Cashfree",
    mock: "Mock (Testing)",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payment Providers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View active payment gateways and your commission details
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3 text-sm text-blue-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">How payments work</p>
          <p className="mt-1">
            Payment processing is handled by the platform. When a customer pays, the platform
            collects the full amount and credits your earnings after deducting a{" "}
            <strong>{commissionRate}% platform commission</strong>. Settlements are processed
            directly to your linked bank account.
          </p>
        </div>
      </div>

      {/* Commission Card */}
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
            <span className="text-green-700 font-bold text-lg">{commissionRate}%</span>
          </div>
          <div>
            <p className="font-semibold">Platform Commission</p>
            <p className="text-sm text-muted-foreground">
              {commissionRate}% of each order total is retained by the platform. The remaining{" "}
              {100 - parseInt(commissionRate)}% is your revenue.
            </p>
          </div>
        </div>
      </Card>

      {/* Active payment gateways */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Active Payment Gateways</h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading…</div>
        ) : enabledProviders.length === 0 ? (
          <Card className="p-6 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No payment gateways are currently active. Contact the platform admin.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {enabledProviders.map((p: any) => (
              <Card key={p.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-indigo-700" />
                  </div>
                  <div>
                    <p className="font-semibold">{providerLabels[p.name] ?? p.name}</p>
                    <p className="text-xs text-muted-foreground">Managed by platform</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
