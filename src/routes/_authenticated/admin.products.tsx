import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, search],
    queryFn: () => api.getProducts({ page, limit: perPage, search: search || undefined }),
  });

  const products = (data as any)?.products ?? (Array.isArray(data) ? data : []);
  const total = (data as any)?.total ?? products.length;

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.updateProduct(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = search
    ? products.filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">All Products</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage all marketplace products</p>
      </div>

      <input
        className="border rounded-lg px-3 py-2 text-sm w-full max-w-sm"
        placeholder="Search products…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading products…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No products found.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {filtered.map((p: any) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center gap-4">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-12 w-12 rounded-lg object-cover bg-muted"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Vendor: {p.vendor?.name ?? p.vendorId?.substring(0, 8) ?? "—"}
                      &nbsp;·&nbsp;Stock: {p.stock ?? "—"}
                    </p>
                  </div>
                  <p className="font-bold text-sm whitespace-nowrap">₹{Number(p.price ?? 0).toFixed(2)}</p>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-muted-foreground">{p.isActive !== false ? "Active" : "Hidden"}</span>
                    <Switch
                      checked={p.isActive !== false}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: p.id, isActive: v })}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {total > perPage && (
            <div className="flex justify-center gap-2 pt-4">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                Page {page} of {Math.ceil(total / perPage)}
              </span>
              <Button size="sm" variant="outline" disabled={page >= Math.ceil(total / perPage)} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
