import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Settings, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Website Settings — Admin" }] }),
  component: AdminSettingsPage,
});

const SETTING_DEFS = [
  { key: "PLATFORM_NAME", label: "Platform Name", type: "text", description: "The display name of your marketplace" },
  { key: "PLATFORM_CURRENCY", label: "Currency", type: "text", description: "Default currency (e.g. INR, USD)" },
  { key: "PLATFORM_COMMISSION_RATE", label: "Commission Rate (%)", type: "number", description: "Platform commission. Stored as decimal (e.g. 0.10 = 10%)" },
  { key: "MAINTENANCE_MODE", label: "Maintenance Mode", type: "toggle", description: "Put the marketplace in maintenance mode" },
  { key: "INVOICE_PREFIX", label: "Invoice Prefix", type: "text", description: "Prefix for invoice numbers (e.g. INV)" },
];

function AdminSettingsPage() {
  const qc = useQueryClient();
  const [vals, setVals] = useState<Record<string, any>>({});

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.getAdminSettings(),
  });

  useEffect(() => {
    const map: Record<string, any> = {};
    (settings as any[]).forEach((s) => {
      if (s.key === "PLATFORM_COMMISSION_RATE") {
        map[s.key] = s.value?.rate != null ? String(parseFloat(s.value.rate) * 100) : "10";
      } else if (s.key === "MAINTENANCE_MODE") {
        map[s.key] = s.value?.enabled ?? false;
      } else {
        map[s.key] = s.value?.name ?? s.value?.value ?? s.value ?? "";
      }
    });
    setVals((prev) => ({ ...map, ...prev }));
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: ({ key, value, description }: any) =>
      api.updateAdminSetting(key, value, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Setting saved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const save = (def: (typeof SETTING_DEFS)[0]) => {
    const raw = vals[def.key];
    let value: any;
    if (def.key === "PLATFORM_COMMISSION_RATE") {
      value = { rate: parseFloat(raw) / 100 };
    } else if (def.key === "MAINTENANCE_MODE") {
      value = { enabled: raw };
    } else if (def.key === "PLATFORM_NAME") {
      value = { name: raw };
    } else {
      value = { value: raw };
    }
    updateMutation.mutate({ key: def.key, value, description: def.description });
  };

  const maintenanceOn = vals["MAINTENANCE_MODE"] === true;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Website Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage platform-wide configuration and maintenance</p>
      </div>

      {maintenanceOn && (
        <div className="flex gap-3 items-center rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Maintenance mode is currently <strong>ON</strong>. The marketplace is not accessible to customers.</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading settings…</div>
      ) : (
        <div className="space-y-4">
          {SETTING_DEFS.map((def) => (
            <Card key={def.key} className="p-5">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                  <Label className="font-semibold">{def.label}</Label>
                  <p className="text-xs text-muted-foreground">{def.description}</p>
                  <p className="text-xs font-mono text-muted-foreground">{def.key}</p>
                </div>
                <div className="flex items-center gap-3">
                  {def.type === "toggle" ? (
                    <>
                      <span className="text-sm text-muted-foreground">{vals[def.key] ? "ON" : "OFF"}</span>
                      <Switch
                        checked={vals[def.key] ?? false}
                        onCheckedChange={(v) => {
                          setVals((p) => ({ ...p, [def.key]: v }));
                          updateMutation.mutate({ key: def.key, value: { enabled: v }, description: def.description });
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        className="w-44"
                        type={def.type}
                        value={vals[def.key] ?? ""}
                        onChange={(e) => setVals((p) => ({ ...p, [def.key]: e.target.value }))}
                      />
                      <Button size="sm" onClick={() => save(def)} disabled={updateMutation.isPending}>
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
