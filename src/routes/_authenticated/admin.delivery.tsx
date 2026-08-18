import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Truck, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/delivery")({
  head: () => ({ meta: [{ title: "Delivery Management — Admin" }] }),
  component: AdminDeliveryPage,
});

function AdminDeliveryPage() {
  const qc = useQueryClient();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["admin-delivery-providers"],
    queryFn: () => api.getDeliveryProviders(),
  });

  const { data: shipments = [], isLoading: shipmentsLoading } = useQuery({
    queryKey: ["admin-shipments"],
    queryFn: () => api.getShipments(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateDeliveryProvider(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-delivery-providers"] });
      toast.success("Delivery provider updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const providerInfo: Record<string, { label: string; desc: string }> = {
    delhivery: { label: "Delhivery", desc: "Pan-India courier & logistics network" },
    shiprocket: { label: "Shiprocket", desc: "Multi-courier aggregator with 25+ partners" },
    own: { label: "Vendor Self-Delivery", desc: "Vendor manages their own delivery" },
    platform: { label: "Platform Managed", desc: "Platform arranges delivery on vendor's behalf" },
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    picked_up: "bg-blue-100 text-blue-800",
    in_transit: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Delivery Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure delivery providers and track shipments</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Delivery Providers</h2>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Delivery API credentials are stored securely via environment variables. Configure DELHIVERY_API_KEY in your .env file.</span>
        </div>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading…</div>
        ) : providers.length === 0 ? (
          <Card className="p-6 text-center">
            <Truck className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No delivery providers found. Seed providers via Prisma Studio.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {providers.map((p: any) => {
              const info = providerInfo[p.name] ?? { label: p.name, desc: "Delivery provider" };
              return (
                <Card key={p.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{info.label}</p>
                      <p className="text-sm text-muted-foreground">{info.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">{p.isEnabled ? "Active" : "Off"}</Label>
                      <Switch
                        checked={p.isEnabled}
                        onCheckedChange={(checked) =>
                          updateMutation.mutate({ id: p.id, data: { isEnabled: checked } })
                        }
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Active Shipments</h2>
        {shipmentsLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading shipments…</div>
        ) : (shipments as any[]).length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No shipments yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {(shipments as any[]).map((s: any) => (
              <Card key={s.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="font-mono text-sm">#{s.id.substring(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">Carrier: {s.carrier}</p>
                    {s.trackingNumber && (
                      <p className="text-xs font-mono bg-muted px-2 py-0.5 rounded inline-block">
                        {s.trackingNumber}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[s.status] ?? "bg-gray-100 text-gray-800"}`}>
                    {s.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
