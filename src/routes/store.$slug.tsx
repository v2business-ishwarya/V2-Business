import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Store, MapPin, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/store/$slug")({
  head: () => ({ meta: [{ title: "Store — V2 Business" }] }),
  component: StorePage,
});

function StorePage() {
  const { slug } = Route.useParams();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["store", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendors")
        .select("*")
        .eq("slug", slug)
        .eq("status", "approved")
        .maybeSingle();
      return data;
    },
  });

  const products = useQuery({
    queryKey: ["store-products", vendor?.id],
    enabled: !!vendor?.id,
    queryFn: async () =>
      (
        await supabase
          .from("products")
          .select("*, vendors(name,slug,status)")
          .eq("vendor_id", vendor!.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading store...</div>;
  if (!vendor)
    return (
      <div className="mx-auto max-w-3xl p-8">
        <EmptyState
          title="Store not found"
          description="This store may not exist or is not yet approved."
        />
      </div>
    );

  return (
    <div>
      <div className="relative">
        {vendor.banner_url ? (
          <img src={vendor.banner_url} alt="" className="h-56 w-full object-cover sm:h-72" />
        ) : (
          <div className="h-40 w-full bg-gradient-to-br from-primary-soft to-primary/10 sm:h-56" />
        )}
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-surface-muted">
            {vendor.logo_url ? (
              <img src={vendor.logo_url} alt={vendor.name} className="h-full w-full object-cover" />
            ) : (
              <Store className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{vendor.name}</h1>
            {vendor.tagline && <p className="text-sm text-muted-foreground">{vendor.tagline}</p>}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {vendor.address && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {vendor.address}
                </span>
              )}
              {vendor.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {vendor.email}
                </span>
              )}
              {vendor.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {vendor.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {vendor.description && (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-sm font-semibold">About</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
              {vendor.description}
            </p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Products</h2>
          {(products.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="This vendor hasn't added products yet."
              description="Check back soon — new items may be on their way."
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
    </div>
  );
}
