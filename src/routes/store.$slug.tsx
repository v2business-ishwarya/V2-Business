import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { SellerTrustCard } from "@/components/seller-trust-card";
import { Store, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const firstVendor = products[0]?.vendor || {};
  const storeName = firstVendor.name || "Verified Seller Storefront";

  return (
    <div className="pb-16">
      {/* Top Hero Banner */}
      <div className="relative h-44 w-full bg-gradient-to-r from-emerald-800 via-teal-700 to-primary sm:h-56 overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-black/20 blur-2xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Store Trust Header */}
        <div className="-mt-16 space-y-6">
          <SellerTrustCard
            vendor={{
              id: slug,
              name: storeName,
              slug: slug,
              businessType: firstVendor.businessType || "physical_shop",
              gstNumber: firstVendor.gstNumber || "29AABCV2026F1Z4",
              address: firstVendor.address || "Official Commercial Storefront",
              city: firstVendor.city || "Bangalore",
              state: firstVendor.state || "Karnataka",
              pincode: firstVendor.pincode || "560001",
              shopPhotos: firstVendor.shopPhotos || [],
            }}
            className="shadow-xl bg-card border-border"
          />
        </div>

        {/* Store Products Catalogue */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Store Products ({products.length})</h2>
              <p className="text-xs text-muted-foreground">Authentic items shipped directly by {storeName}</p>
            </div>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Buyer Escrow Active
            </Badge>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading store products…</div>
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

export default StorePage;
