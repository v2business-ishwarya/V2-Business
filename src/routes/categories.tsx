import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/empty-state";
import { Tag } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories — V2 Business" }] }),
  component: CategoriesList,
});

function CategoriesList() {
  const { data } = useQuery({
    queryKey: ["all-cats-public"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
      <div className="mt-6">
        {(data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No categories created."
            description="Categories will appear here once created by admins."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {data!.map((c) => (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-5 text-center shadow-soft hover:border-primary"
              >
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
                    <Tag className="h-5 w-5" />
                  </div>
                )}
                <span className="text-sm font-medium">{c.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
