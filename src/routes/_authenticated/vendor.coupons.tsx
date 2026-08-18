import { createFileRoute } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vendor/coupons")({
  component: VendorCoupons,
});

function VendorCoupons() {
  const { data: vendor } = useMyVendor();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    code: "",
    discount_type: "percent",
    discount_value: "",
    min_order: "0",
    expires_at: "",
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ["vendor-coupons", vendor?.id],
    enabled: !!vendor,
    queryFn: async () =>
      (
        await supabase
          .from("coupons")
          .select("*")
          .eq("vendor_id", vendor!.id)
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  if (!vendor) return null;

  const add = async () => {
    if (!form.code || !form.discount_value) return toast.error("Code and value required");
    const { error } = await supabase.from("coupons").insert({
      vendor_id: vendor.id,
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order: Number(form.min_order) || 0,
      expires_at: form.expires_at || null,
    });
    if (error) return toast.error(error.message);
    setForm({
      code: "",
      discount_type: "percent",
      discount_value: "",
      min_order: "0",
      expires_at: "",
    });
    qc.invalidateQueries({ queryKey: ["vendor-coupons"] });
    toast.success("Coupon created");
  };
  const toggle = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["vendor-coupons"] });
  };
  const del = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["vendor-coupons"] });
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Create coupon</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Label>Code</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="SAVE10"
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={form.discount_type}
              onValueChange={(v) => setForm({ ...form, discount_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent</SelectItem>
                <SelectItem value="fixed">Fixed amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Value</Label>
            <Input
              type="number"
              step="0.01"
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
            />
          </div>
          <div>
            <Label>Min order</Label>
            <Input
              type="number"
              step="0.01"
              value={form.min_order}
              onChange={(e) => setForm({ ...form, min_order: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <Label>Expires at</Label>
            <Input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            />
          </div>
        </div>
        <Button className="mt-4" onClick={add}>
          Create coupon
        </Button>
      </Card>
      {coupons.length === 0 ? (
        <EmptyState title="No coupons yet" />
      ) : (
        <div className="space-y-2">
          {coupons.map((c) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-mono font-semibold">{c.code}</p>
                <p className="text-xs text-muted-foreground">
                  {c.discount_type === "percent"
                    ? `${c.discount_value}% off`
                    : `$${c.discount_value} off`}
                  {c.min_order > 0 && ` · min $${c.min_order}`}
                  {c.expires_at && ` · expires ${new Date(c.expires_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={c.active} onCheckedChange={(v) => toggle(c.id, v)} />
                <Button variant="ghost" size="icon" onClick={() => del(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
