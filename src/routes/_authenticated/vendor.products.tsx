import { createFileRoute, Link } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { formatMoney, slugify } from "@/lib/utils-app";
import { useState } from "react";
import { toast } from "sonner";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/vendor/products")({
  component: VendorProducts,
});

type FormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discount_price: string;
  stock: string;
  category_id: string;
  featured_image: string;
  brand: string;
  sku: string;
  status: "draft" | "active" | "archived";
};
const empty: FormState = {
  name: "",
  slug: "",
  description: "",
  price: "",
  discount_price: "",
  stock: "0",
  category_id: "",
  featured_image: "",
  brand: "",
  sku: "",
  status: "active",
};

function VendorProducts() {
  const { data: vendor } = useMyVendor();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  const { data: products = [] } = useQuery({
    queryKey: ["vendor-products", vendor?.id],
    enabled: !!vendor,
    queryFn: async () =>
      (
        await supabase
          .from("products")
          .select("*, categories(name)")
          .eq("vendor_id", vendor!.id)
          .order("created_at", { ascending: false })
      ).data ?? [],
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () =>
      (await supabase.from("categories").select("id,name").order("name")).data ?? [],
  });

  if (!vendor || vendor.status !== "approved")
    return (
      <EmptyState
        title="Store not active"
        description="Products can be managed once your store is approved."
      />
    );

  const openNew = () => {
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (p: any) => {
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description ?? "",
      price: String(p.price),
      discount_price: p.discount_price != null ? String(p.discount_price) : "",
      stock: String(p.stock),
      category_id: p.category_id ?? "",
      featured_image: p.featured_image ?? "",
      brand: p.brand ?? "",
      sku: p.sku ?? "",
      status: p.status,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.price) return toast.error("Name and price are required");
    const slug = form.slug || slugify(form.name);
    const payload = {
      vendor_id: vendor.id,
      name: form.name,
      slug,
      description: form.description || null,
      price: Number(form.price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      stock: Number(form.stock) || 0,
      category_id: form.category_id || null,
      featured_image: form.featured_image || null,
      brand: form.brand || null,
      sku: form.sku || null,
      status: form.status,
    };
    const q = form.id
      ? supabase.from("products").update(payload).eq("id", form.id)
      : supabase.from("products").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Product updated" : "Product created");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["vendor-products"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["vendor-products"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Products</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" /> New product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit product" : "New product"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: form.slug || slugify(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Discount price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.discount_price}
                    onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={form.category_id || undefined}
                    onValueChange={(v) => setForm({ ...form, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {cats.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Brand</Label>
                  <Input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Featured image URL</Label>
                <Input
                  value={form.featured_image}
                  onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: any) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={save}>{form.id ? "Save changes" : "Create product"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No products yet"
          description="Add your first product to start selling."
          action={
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" /> New product
            </Button>
          }
        />
      ) : (
        <div className="grid gap-2">
          {products.map((p: any) => (
            <Card key={p.id} className="flex items-center gap-3 p-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-muted">
                {p.featured_image ? (
                  <img src={p.featured_image} className="h-full w-full object-cover" alt="" />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="truncate font-medium hover:text-primary"
                >
                  {p.name}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {p.categories?.name ?? "Uncategorized"} · Stock: {p.stock} · {p.status}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatMoney(p.discount_price ?? p.price)}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => del(p.id)}>
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
