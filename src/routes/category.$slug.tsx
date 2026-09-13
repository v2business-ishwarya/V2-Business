import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Tag, Layers } from "lucide-react";
import { getCategoryBySlug } from "@/data/categories";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const cat = getCategoryBySlug(params.slug);
    const title = cat?.name || params.slug.charAt(0).toUpperCase() + params.slug.slice(1).replace(/-/g, " ");
    return {
      meta: [
        { title: `${title} — V2 Business Marketplace` },
        { name: "description", content: cat?.description || `Explore ${title} on V2 Business` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const categoryMeta = getCategoryBySlug(slug);

  const { data: rawProducts = [], isLoading } = useQuery({
    queryKey: ["cat-products", slug],
    queryFn: () => api.getProducts({ category: slug }),
  });

  const products: any[] = (rawProducts as any)?.data ?? (Array.isArray(rawProducts) ? rawProducts : []);
  const title = categoryMeta?.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* CATEGORY HERO BANNER */}
      <div className="relative overflow-hidden border-b border-border/80 bg-muted/30">
        {categoryMeta?.imageUrl && (
          <div className="absolute inset-0 z-0 opacity-20 dark:opacity-15">
            <img
              src={categoryMeta.imageUrl}
              alt={title}
              className="h-full w-full object-cover blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            to="/categories"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to All Categories
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 font-bold">
                  <Sparkles className="mr-1 h-3 w-3" /> Marketplace Category
                </Badge>
                {categoryMeta?.itemCount && (
                  <Badge variant="secondary" className="font-semibold text-xs">
                    {categoryMeta.itemCount}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{title}</h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {categoryMeta?.description || `Discover curated products and verified seller stores in ${title}.`}
              </p>

              {/* Popular Tags */}
              {categoryMeta?.popularTags && categoryMeta.popularTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {categoryMeta.popularTags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-card border border-border/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {categoryMeta?.imageUrl && (
              <div className="hidden md:block shrink-0">
                <div className="relative h-28 w-44 rounded-2xl overflow-hidden shadow-lg border border-white/10">
                  <img
                    src={categoryMeta.imageUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCTS CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-muted-foreground">
            {isLoading ? "Searching catalog…" : `${products.length} product${products.length === 1 ? "" : "s"} listed`}
          </p>
          <Link to="/search">
            <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
              Advanced Search & Filters
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title={`No products listed in ${title} yet`}
            description="Vendors are continuously uploading items. Check back soon or browse our other categories."
            action={{
              label: "Explore All Categories",
              onClick: () => {
                window.location.href = "/categories";
              },
            }}
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

