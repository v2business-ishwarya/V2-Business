import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Store } from "lucide-react";

export const Route = createFileRoute("/store/$slug")({
  head: () => ({ meta: [{ title: "Store — V2 Business" }] }),
  component: StorePage,
});

function StorePage() {
  const { slug } = Route.useParams();

  const { data: rawProducts = [], isLoading } = useQuery({
    queryKey: ["store-products", slug],
    queryFn: () => api.getProducts({ vendorId: slug, isActive: true }),
  });

  const products: any[] = (rawProducts as any)?.data ?? (Array.isArray(rawProducts) ? rawProducts : []);
  const storeName = products[0]?.vendor?.name || "Seller Storefront";

  return (
    <div>
      <div className="h-40 w-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 sm:h-52" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border bg-muted">
            <Store className="h-9 w-9 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{storeName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Verified Marketplace Seller</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Store Products ({products.length})</h2>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading products…</div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products listed yet"
              description="Check back soon for new arrivals from this vendor."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
