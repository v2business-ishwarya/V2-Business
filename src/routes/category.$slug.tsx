import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/category/$slug")({
  head: () => ({ meta: [{ title: "Category — V2 Business" }] }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: cat } = useQuery({
    queryKey: ["cat", slug],
    queryFn: async () =>
      (await supabase.from("categories").select("*").eq("slug", slug).maybeSingle()).data,
  });
  const products = useQuery({
    queryKey: ["cat-products", cat?.id],
    enabled: !!cat?.id,
    queryFn: async () =>
      (
        await supabase
          .from("products")
          .select("*, vendors!inner(name,slug,status)")
          .eq("category_id", cat!.id)
          .eq("status", "active")
          .eq("vendors.status", "approved")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">{cat?.name ?? "Category"}</h1>
      {cat?.description && (
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{cat.description}</p>
      )}
      <div className="mt-6">
        {(products.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No products in this category yet."
            description="Vendors haven't listed anything here. Check back soon."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.data!.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
