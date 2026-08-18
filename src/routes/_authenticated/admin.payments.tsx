import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreditCard, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  head: () => ({ meta: [{ title: "Payment Management — Admin" }] }),
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const qc = useQueryClient();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["admin-payment-providers"],
    queryFn: () => api.getPaymentProviders(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updatePaymentProvider(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payment-providers"] });
      toast.success("Payment provider updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const providerLabels: Record<string, string> = {
    razorpay: "Razorpay",
    cashfree: "Cashfree",
    mock: "Mock (Testing)",
  };

  const providerDescriptions: Record<string, string> = {
    razorpay: "India's leading payment gateway — supports UPI, cards, wallets",
    cashfree: "Fast settlements, payment links, UPI, and more",
    mock: "Sandbox mode for testing payment flows without real transactions",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payment Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure and manage payment gateways. API keys are stored securely on the server.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 text-sm text-amber-800">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          API credentials are configured via environment variables on the server. Enable/disable providers here; credentials never leave the backend.
        </span>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : providers.length === 0 ? (
        <Card className="p-8 text-center">
          <CreditCard className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">No payment providers configured</p>
          <p className="text-sm text-muted-foreground mt-1">
            Run a database migration to seed payment provider records, or add them via Prisma Studio.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {providers.map((p: any) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-base">{providerLabels[p.name] ?? p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {providerDescriptions[p.name] ?? "Payment provider"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">{p.isEnabled ? "Active" : "Inactive"}</Label>
                  <Switch
                    checked={p.isEnabled}
                    onCheckedChange={(checked) =>
                      updateMutation.mutate({ id: p.id, data: { isEnabled: checked } })
                    }
                  />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${p.isEnabled ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-xs text-muted-foreground">
                  {p.isEnabled ? "Accepting payments" : "Disabled"}
                  {p.apiKey ? " · API key configured" : " · No API key"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
