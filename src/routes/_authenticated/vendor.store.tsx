import { createFileRoute } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useSession } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils-app";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vendor/store")({
  component: VendorStore,
});

function VendorStore() {
  const { user } = useSession();
  const { data: vendor, refetch } = useMyVendor();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    bankAccount: "",
    ifscCode: "",
  });

  useEffect(() => {
    if (vendor || user) {
      const savedStore = localStorage.getItem(`vendor_store_${user?.id}`);
      if (savedStore) {
        try {
          setForm(JSON.parse(savedStore));
          return;
        } catch {}
      }
      setForm({
        name: vendor?.name || user?.name || "",
        slug: slugify(vendor?.name || user?.name || "my-store"),
        tagline: "",
        description: "",
        email: user?.email || "",
        phone: "",
        address: "",
        bankAccount: "",
        ifscCode: "",
      });
    }
  }, [vendor, user]);

  const save = async () => {
    if (!user) return;
    if (!form.name.trim()) return toast.error("Store name is required");
    setLoading(true);
    try {
      if (user.id && form.name !== user.name) {
        await api.updateUser(user.id, { name: form.name });
      }
      localStorage.setItem(`vendor_store_${user.id}`, JSON.stringify(form));
      toast.success("Store profile and payout details updated");
      qc.invalidateQueries();
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save store profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Store Profile & Payouts</h1>
        <p className="text-sm text-muted-foreground">Manage your seller branding and banking details for automated settlements</p>
      </div>

      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Store / Business Name</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })
              }
            />
          </div>
          <div>
            <Label>Store URL Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Tagline</Label>
            <Input
              placeholder="e.g. Premium Handcrafted Goods"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Store Description</Label>
            <Textarea
              rows={3}
              placeholder="Tell customers about your brand"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Contact Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Contact Phone</Label>
            <Input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Store Address</Label>
            <Input
              placeholder="Full dispatch / business address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2 pt-4 border-t">
            <h3 className="font-semibold text-sm">Payout Bank Account (for 90% Direct Net Settlements)</h3>
            <p className="text-xs text-muted-foreground mb-3">Your sales earnings will be credited directly to this account</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Bank Account Number</Label>
                <Input
                  placeholder="e.g. 9876543210123"
                  value={form.bankAccount}
                  onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                />
              </div>
              <div>
                <Label>Bank IFSC Code</Label>
                <Input
                  placeholder="e.g. HDFC0001234"
                  value={form.ifscCode}
                  onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
          </div>
        </div>

        <Button className="mt-6" onClick={save} disabled={loading}>
          {loading ? "Saving…" : "Save Store Details"}
        </Button>
      </Card>
    </div>
  );
}
