import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Store } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { slugify } from "@/lib/utils-app";

export const Route = createFileRoute("/vendors")({
  head: () => ({ meta: [{ title: "Marketplace Vendors — V2 Business" }] }),
  component: VendorsList,
});

function VendorsList() {
  const { data: rawProducts = [], isLoading } = useQuery({
    queryKey: ["all-vendors-public"],
    queryFn: () => api.getProducts({ isActive: true }),
  });

  const products: any[] = (rawProducts as any)?.data ?? (Array.isArray(rawProducts) ? rawProducts : []);

  // Extract unique vendors from product list
  const vendorMap: Record<string, { id: string; name: string; slug: string }> = {};
  products.forEach((p) => {
    if (p.vendor && p.vendor.id) {
      vendorMap[p.vendor.id] = {
        id: p.vendor.id,
        name: p.vendor.name || "Seller Store",
        slug: p.vendor.id,
      };
    }
  });

  const vendors = Object.values(vendorMap);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Marketplace Vendors</h1>
      <p className="text-muted-foreground mt-1">Discover verified sellers and independent brands</p>
      <div className="mt-6">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading vendors…</div>
        ) : vendors.length === 0 ? (
          <EmptyState title="No vendors yet" description="Approved vendors will appear here once active." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {vendors.map((v) => (
              <Link
                key={v.id}
                to="/store/$slug"
                params={{ slug: v.slug }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-sm hover:border-primary transition-colors"
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                  <Store className="h-7 w-7" />
                </div>
                <span className="line-clamp-1 text-sm font-semibold">{v.name}</span>
                <span className="text-xs text-muted-foreground">Verified Seller</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
