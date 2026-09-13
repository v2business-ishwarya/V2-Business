import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { SellerTrustCard } from "@/components/seller-trust-card";
import { Store, ShieldCheck, MapPin, Sparkles, Search, Tag, ArrowLeft, Star, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getVendorByIdOrSlug, MASTER_VENDORS } from "@/data/categories";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/store/$slug")({
  head: ({ params }) => {
    const v = getVendorByIdOrSlug(params.slug);
    const title = v?.name || "Verified Seller Storefront";
    return {
      meta: [
        { title: `${title} — Official Storefront on V2 Business` },
        { name: "description", content: v?.tagline || v?.description || `Explore products from ${title}` },
      ],
    };
  },
  component: StorePage,
});

function StorePage() {
  const { slug } = Route.useParams();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const vendorMeta = useMemo(() => {
    return getVendorByIdOrSlug(slug);
  }, [slug]);

  const { data: rawProducts = [], isLoading } = useQuery({
    queryKey: ["store-products", slug],
    queryFn: () => api.getProducts({ vendorId: slug, isActive: true }),
  });

  const apiProducts: any[] = (rawProducts as any)?.data ?? (Array.isArray(rawProducts) ? rawProducts : []);

  // Merge products from API and vendor's featured catalog
  const storeProducts = useMemo(() => {
    const list = [...apiProducts];
    if (vendorMeta?.featuredProducts) {
      vendorMeta.featuredProducts.forEach((fp) => {
        if (!list.some((p) => p.id === fp.id)) {
          list.push({
            ...fp,
            slug: fp.id,
            vendor: {
              id: vendorMeta.id,
              name: vendorMeta.name,
              slug: vendorMeta.slug,
              businessType: vendorMeta.businessType,
              gstNumber: vendorMeta.gstNumber,
              city: vendorMeta.city,
              state: vendorMeta.state,
            },
          });
        }
      });
    }
    return list;
  }, [apiProducts, vendorMeta]);

  const firstVendor = apiProducts[0]?.vendor || {};
  const storeName = vendorMeta?.name || firstVendor.name || "Verified Seller Storefront";
  const businessType = vendorMeta?.businessType || firstVendor.businessType || "physical_shop";
  const gstNumber = vendorMeta?.gstNumber || firstVendor.gstNumber || "";
  const address = vendorMeta?.address || firstVendor.address || "Official Commercial Storefront";
  const city = vendorMeta?.city || firstVendor.city || "Bangalore";
  const state = vendorMeta?.state || firstVendor.state || "Karnataka";
  const pincode = vendorMeta?.pincode || firstVendor.pincode || "560001";
  const shopPhotos = vendorMeta?.shopPhotos || firstVendor.shopPhotos || [];
  const categories = vendorMeta?.categories || [firstVendor.category || "General Products"];

  // Filter products by selected category and search text
  const filteredProducts = useMemo(() => {
    return storeProducts.filter((p) => {
      const matchCat =
        selectedCat === "all" ||
        (p.category && p.category.toLowerCase().includes(selectedCat.toLowerCase())) ||
        (selectedCat.toLowerCase().includes((p.category || "").toLowerCase()));

      const matchSearch =
        !search.trim() ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [storeProducts, selectedCat, search]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Hero Banner */}
      <div className="relative h-48 w-full bg-gradient-to-r from-emerald-900 via-teal-800 to-primary sm:h-60 overflow-hidden">
        {vendorMeta?.shopPhotos?.[0] && (
          <div className="absolute inset-0 opacity-25">
            <img
              src={vendorMeta.shopPhotos[0]}
              alt={storeName}
              className="h-full w-full object-cover blur-xs"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        )}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-black/20 blur-2xl" />

        <div className="relative mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
          <Link
            to="/vendors"
            className="inline-flex items-center text-xs font-semibold text-white/80 hover:text-white transition-colors bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to All Vendors
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Store Trust Header */}
        <div className="-mt-20 space-y-6">
          <SellerTrustCard
            vendor={{
              id: slug,
              name: storeName,
              slug: slug,
              businessType: businessType,
              gstNumber: gstNumber,
              isGstExempt: vendorMeta?.isGstExempt,
              address: address,
              city: city,
              state: state,
              pincode: pincode,
              shopPhotos: shopPhotos,
              categories: categories,
              rating: vendorMeta?.rating || 4.9,
              reviewCount: vendorMeta?.reviewCount || 50,
            }}
            className="shadow-xl bg-card border-border"
          />
        </div>

        {/* Store Products Catalogue Section */}
        <div className="mt-10 space-y-6">
          {/* Header & Internal Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" /> Store Catalog ({storeProducts.length} Items)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Authentic, quality-inspected products shipped directly from {storeName}'s verified inventory.
              </p>
            </div>

            {/* In-store search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search products in this store..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs h-9 rounded-xl"
              />
            </div>
          </div>

          {/* Department / Category Filter Tabs (if vendor sells across categories) */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedCat("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCat === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All Departments ({storeProducts.length})
              </button>
              {categories.map((catName) => (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setSelectedCat(catName)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedCat === catName
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {catName}
                </button>
              ))}
            </div>
          )}

          {/* Product Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-muted/60 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              description={search ? `No items in ${storeName} matching "${search}".` : "Check back soon for new arrivals from this vendor."}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((p: any) => (
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

