import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Truck, Package, Building2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor/delivery")({
  head: () => ({ meta: [{ title: "Delivery Config — Vendor" }] }),
  component: VendorDeliveryPage,
});

const DELIVERY_OPTIONS = [
  {
    id: "own",
    label: "Self Delivery",
    desc: "You manage packing and delivery yourself or via your own couriers",
    icon: Package,
  },
  {
    id: "delhivery",
    label: "Delhivery Courier",
    desc: "Platform-integrated courier with pan-India coverage and tracking",
    icon: Truck,
  },
  {
    id: "shiprocket",
    label: "Shiprocket",
    desc: "Multi-courier aggregator with 25+ courier partners and auto-selection",
    icon: Truck,
  },
  {
    id: "platform",
    label: "Platform Managed",
    desc: "The platform arranges delivery on your behalf — you just pack the order",
    icon: Building2,
  },
];

function VendorDeliveryPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string>("own");
  const [trackingInfo, setTrackingInfo] = useState("");

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["vendor-delivery-config"],
    queryFn: () => api.getDeliveryConfig(),
  });

  useEffect(() => {
    if ((configs as any[]).length > 0) {
      const active = (configs as any[]).find((c: any) => c.isEnabled);
      if (active) {
        setSelected(active.provider);
        setTrackingInfo(active.credentials?.trackingInfo ?? "");
      }
    }
  }, [configs]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.updateDeliveryConfig({
        provider: selected,
        isEnabled: true,
        credentials:
          selected === "own" ? { trackingInfo } : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-delivery-config"] });
      toast.success("Delivery configuration saved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Delivery Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how your orders are delivered to customers
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {DELIVERY_OPTIONS.map((opt) => {
              const isActive = selected === opt.id;
              return (
                <Card
                  key={opt.id}
                  className={`p-5 cursor-pointer transition-all border-2 ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-transparent hover:border-muted-foreground/20"
                  }`}
                  onClick={() => setSelected(opt.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <opt.icon className="h-5 w-5" />
                    </div>
                    {isActive && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="font-semibold">{opt.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{opt.desc}</p>
                </Card>
              );
            })}
          </div>

          {selected === "own" && (
            <Card className="p-5 space-y-3">
              <Label className="font-semibold">Self-Delivery Tracking Instructions</Label>
              <p className="text-sm text-muted-foreground">
                Add instructions or a tracking link template for customers (e.g. your courier's tracking page URL).
              </p>
              <Input
                placeholder="e.g. Track at https://mycourier.com/track?id={trackingId}"
                value={trackingInfo}
                onChange={(e) => setTrackingInfo(e.target.value)}
              />
            </Card>
          )}

          <Button
            className="w-full sm:w-auto"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving…" : "Save delivery preference"}
          </Button>
        </>
      )}
    </div>
  );
}
