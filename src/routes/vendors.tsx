import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/vendors")({
  head: () => ({ meta: [{ title: "All vendors — V2 Business" }] }),
  component: VendorsList,
});

function VendorsList() {
  const { data } = useQuery({
    queryKey: ["all-vendors-public"],
    queryFn: async () =>
      (await supabase.from("vendors").select("*").eq("status", "approved").order("name")).data ??
      [],
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">All vendors</h1>
      <div className="mt-6">
        {(data?.length ?? 0) === 0 ? (
          <EmptyState title="No vendors yet" description="Approved vendors will appear here." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {data!.map((v) => (
              <Link
                key={v.id}
                to="/store/$slug"
                params={{ slug: v.slug }}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-5 text-center shadow-soft hover:border-primary"
              >
                {v.logo_url ? (
                  <img
                    src={v.logo_url}
                    alt={v.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary">
                    <Store className="h-6 w-6" />
                  </div>
                )}
                <span className="line-clamp-1 text-sm font-medium">{v.name}</span>
                {v.tagline && (
                  <span className="line-clamp-1 text-xs text-muted-foreground">{v.tagline}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
