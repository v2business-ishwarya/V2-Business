import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { EmptyState } from "@/components/empty-state";
import { Tag } from "lucide-react";
import { slugify } from "@/lib/utils-app";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories — V2 Business" }] }),
  component: CategoriesList,
});

function CategoriesList() {
  const { data: rawCats = [] } = useQuery({
    queryKey: ["all-cats-public"],
    queryFn: () => api.getCategories(),
  });

  const categories: any[] = Array.isArray(rawCats) ? rawCats : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Product Categories</h1>
      <p className="text-muted-foreground mt-1">Browse products across our marketplace categories</p>
      <div className="mt-6">
        {categories.length === 0 ? (
          <EmptyState
            title="No categories found."
            description="Categories will appear here once created."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.id || c.name}
                to="/category/$slug"
                params={{ slug: c.slug || slugify(c.name) }}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-sm hover:border-primary transition-colors"
              >
                {c.imageUrl || c.image_url ? (
                  <img
                    src={c.imageUrl || c.image_url}
                    alt={c.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                    <Tag className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <span className="text-sm font-semibold block">{c.name}</span>
                  {c.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {c.description}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
