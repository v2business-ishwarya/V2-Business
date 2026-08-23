import { createFileRoute, Link } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
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
  compareAtPrice: string;
  stock: string;
  category: string;
  featured_image: string;
  brand: string;
  sku: string;
  isActive: boolean;
};

const empty: FormState = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compareAtPrice: "",
  stock: "10",
  category: "",
  featured_image: "",
  brand: "",
  sku: "",
  isActive: true,
};

function VendorProducts() {
  const { data: vendor } = useMyVendor();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  const { data: rawProducts = [], isLoading } = useQuery({
    queryKey: ["vendor-products", vendor?.id],
    enabled: !!vendor,
    queryFn: () => api.getProducts({ vendorId: vendor?.id }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => api.getCategories(),
  });

  const products: any[] = (rawProducts as any)?.data ?? (Array.isArray(rawProducts) ? rawProducts : []);
  const cats: any[] = Array.isArray(categories) ? categories : [];

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.createProduct(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-products"] });
      toast.success("Product created successfully");
      setOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create product"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateProduct(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-products"] });
      toast.success("Product updated successfully");
      setOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to update product"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-products"] });
      toast.success("Product deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete product"),
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
      slug: p.slug || slugify(p.name),
      description: p.description ?? "",
      price: String(p.price),
      compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : "",
      stock: String(p.stock),
      category: p.category ?? (cats[0]?.name || "General"),
      featured_image: p.images?.[0] || p.featured_image || "",
      brand: p.brand ?? "",
      sku: p.sku ?? "",
      isActive: p.isActive !== false,
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.price) return toast.error("Name and price are required");
    const payload = {
      name: form.name.trim(),
      description: form.description || undefined,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      stock: Number(form.stock) || 0,
      category: form.category || (cats[0]?.name || "General"),
      images: form.featured_image ? [form.featured_image] : [],
      sku: form.sku || undefined,
      isActive: form.isActive,
    };

    if (form.id) {
      updateMutation.mutate({ id: form.id, payload });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Store Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalogue and inventory</p>
        </div>
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
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your product"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="999"
                  />
                </div>
                <div>
                  <Label>Original / MRP Price (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                    placeholder="1299"
                  />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={form.category || (cats[0]?.name || "General")}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {cats.map((c) => (
                        <SelectItem key={c.id || c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                      {cats.length === 0 && <SelectItem value="General">General</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Brand (optional)</Label>
                  <Input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label>SKU (optional)</Label>
                  <Input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Product Image URL</Label>
                <Input
                  value={form.featured_image}
                  onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>
              <Button
                onClick={save}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving…"
                  : form.id
                  ? "Save changes"
                  : "Create product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading products…</div>
      ) : products.length === 0 ? (
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
          {products.map((p: any) => {
            const img = p.images?.[0] || p.featured_image;
            return (
              <Card key={p.id} className="flex items-center gap-3 p-3">
                <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                  {img ? (
                    <img src={img} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <Package className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug || p.id }}
                    className="truncate font-medium hover:text-primary block"
                  >
                    {p.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {p.category ?? "General"} · Stock: {p.stock} · {p.isActive !== false ? "Active" : "Inactive"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatMoney(p.price)}</div>
                  {p.compareAtPrice && (
                    <div className="text-xs line-through text-muted-foreground">
                      {formatMoney(p.compareAtPrice)}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this product?")) deleteMutation.mutate(p.id);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
