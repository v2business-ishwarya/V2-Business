import { createFileRoute } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
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
  const [form, setForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    logo_url: "",
    banner_url: "",
  });

  useEffect(() => {
    if (vendor)
      setForm({
        name: vendor.name,
        slug: vendor.slug,
        tagline: vendor.tagline ?? "",
        description: vendor.description ?? "",
        email: vendor.email ?? "",
        phone: vendor.phone ?? "",
        address: vendor.address ?? "",
        logo_url: vendor.logo_url ?? "",
        banner_url: vendor.banner_url ?? "",
      });
  }, [vendor]);

  const save = async () => {
    if (!user) return;
    if (!form.name) return toast.error("Store name is required");
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    const q = vendor
      ? supabase.from("vendors").update(payload).eq("id", vendor.id)
      : supabase.from("vendors").insert({ ...payload, user_id: user.id, status: "pending" });
    const { error } = await q;
    if (error) return toast.error(error.message);
    if (!vendor) {
      // add vendor role
      await supabase.from("user_roles").insert({ user_id: user.id, role: "vendor" });
    }
    toast.success(vendor ? "Store updated" : "Store submitted for approval");
    qc.invalidateQueries();
    refetch();
  };

  if (!vendor) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="Create your store"
          description="Set up your store profile to start selling. It will be reviewed by an admin."
        />
        <StoreForm form={form} setForm={setForm} onSave={save} submitLabel="Submit for approval" />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-sm">
          Status: <span className="font-medium capitalize">{vendor.status}</span>
        </p>
      </Card>
      <StoreForm form={form} setForm={setForm} onSave={save} submitLabel="Save changes" />
    </div>
  );
}

function StoreForm({ form, setForm, onSave, submitLabel }: any) {
  return (
    <Card className="p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Store name</Label>
          <Input
            value={form.name}
            onChange={(e: any) =>
              setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })
            }
          />
        </div>
        <div>
          <Label>URL slug</Label>
          <Input
            value={form.slug}
            onChange={(e: any) => setForm({ ...form, slug: slugify(e.target.value) })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Tagline</Label>
          <Input
            value={form.tagline}
            onChange={(e: any) => setForm({ ...form, tagline: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Description</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e: any) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e: any) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={form.phone}
            onChange={(e: any) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Address</Label>
          <Input
            value={form.address}
            onChange={(e: any) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div>
          <Label>Logo URL</Label>
          <Input
            value={form.logo_url}
            onChange={(e: any) => setForm({ ...form, logo_url: e.target.value })}
          />
        </div>
        <div>
          <Label>Banner URL</Label>
          <Input
            value={form.banner_url}
            onChange={(e: any) => setForm({ ...form, banner_url: e.target.value })}
          />
        </div>
      </div>
      <Button className="mt-4" onClick={onSave}>
        {submitLabel}
      </Button>
    </Card>
  );
}
