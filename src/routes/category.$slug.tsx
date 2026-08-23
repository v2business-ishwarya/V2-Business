import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/category/$slug")({
  head: () => ({ meta: [{ title: "Category — V2 Business" }] }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();

  const { data: rawProducts = [], isLoading } = useQuery({
    queryKey: ["cat-products", slug],
    queryFn: () => api.getProducts({ category: slug }),
  });

  const products: any[] = (rawProducts as any)?.data ?? (Array.isArray(rawProducts) ? rawProducts : []);
  const title = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Showing products in {title}</p>
      <div className="mt-6">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading products…</div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products in this category yet."
            description="Vendors haven't listed anything here. Check back soon."
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
  );
}
