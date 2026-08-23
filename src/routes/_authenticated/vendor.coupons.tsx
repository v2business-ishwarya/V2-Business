import { createFileRoute } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
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
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vendor/coupons")({
  component: VendorCoupons,
});

interface Coupon {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number;
  expires_at?: string;
  active: boolean;
}

function VendorCoupons() {
  const { data: vendor } = useMyVendor();
  const storageKey = `vendor_coupons_${vendor?.id}`;

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percent" as "percent" | "fixed",
    discount_value: "",
    min_order: "0",
    expires_at: "",
  });

  useEffect(() => {
    if (vendor?.id) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setCoupons(JSON.parse(saved));
          return;
        } catch {}
      }
      const initial: Coupon[] = [
        {
          id: "1",
          code: "WELCOME10",
          discount_type: "percent",
          discount_value: 10,
          min_order: 500,
          active: true,
        },
      ];
      setCoupons(initial);
      localStorage.setItem(storageKey, JSON.stringify(initial));
    }
  }, [vendor?.id, storageKey]);

  const saveToStorage = (newList: Coupon[]) => {
    setCoupons(newList);
    if (vendor?.id) {
      localStorage.setItem(storageKey, JSON.stringify(newList));
    }
  };

  if (!vendor) return null;

  const add = () => {
    if (!form.code.trim() || !form.discount_value) return toast.error("Code and discount value are required");

    const newCoupon: Coupon = {
      id: String(Date.now()),
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order: Number(form.min_order) || 0,
      expires_at: form.expires_at || undefined,
      active: true,
    };

    saveToStorage([...coupons, newCoupon]);
    setForm({
      code: "",
      discount_type: "percent",
      discount_value: "",
      min_order: "0",
      expires_at: "",
    });
    toast.success("Coupon created");
  };

  const toggle = (id: string, active: boolean) => {
    saveToStorage(coupons.map((c) => (c.id === id ? { ...c, active } : c)));
  };

  const del = (id: string) => {
    saveToStorage(coupons.filter((c) => c.id !== id));
    toast.success("Coupon removed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Store Coupons & Discounts</h1>
        <p className="text-sm text-muted-foreground">Create promotional discount codes for your customers</p>
      </div>

      <Card className="p-6">
        <h2 className="text-base font-semibold mb-4">Create New Coupon</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Coupon Code *</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. FESTIVE20"
            />
          </div>
          <div>
            <Label>Discount Type</Label>
            <Select
              value={form.discount_type}
              onValueChange={(v: any) => setForm({ ...form, discount_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Flat Amount (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Discount Value *</Label>
            <Input
              type="number"
              step="0.01"
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
              placeholder="e.g. 10 or 100"
            />
          </div>
          <div>
            <Label>Minimum Order Value (₹)</Label>
            <Input
              type="number"
              value={form.min_order}
              onChange={(e) => setForm({ ...form, min_order: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="col-span-2">
            <Label>Expiry Date (optional)</Label>
            <Input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            />
          </div>
        </div>
        <Button className="mt-4" onClick={add}>
          Create Coupon
        </Button>
      </Card>

      {coupons.length === 0 ? (
        <EmptyState title="No coupons active" description="Create a promotional coupon above." />
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-mono font-semibold text-base">{c.code}</p>
                <p className="text-xs text-muted-foreground">
                  {c.discount_type === "percent" ? `${c.discount_value}% off` : `₹${c.discount_value} flat off`}
                  {c.min_order > 0 && ` · min order ₹${c.min_order}`}
                  {c.expires_at && ` · expires ${new Date(c.expires_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={c.active} onCheckedChange={(v) => toggle(c.id, v)} />
                <Button variant="ghost" size="icon" onClick={() => del(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
