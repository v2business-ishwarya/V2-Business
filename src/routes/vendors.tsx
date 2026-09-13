import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Store, Home, ShieldCheck, MapPin, Search, Sparkles, Star, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MARKETPLACE_CATEGORIES, CategoryVendor } from "@/data/categories";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/vendors")({
  head: () => ({
    meta: [
      { title: "Marketplace Vendors & Stores — V2 Business" },
      { name: "description", content: "Discover verified seller stores across 30 departments on V2 Business Marketplace" },
    ],
  }),
  component: VendorsList,
});

function VendorsList() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  const { data: rawProducts = [], isLoading } = useQuery({
    queryKey: ["all-vendors-public"],
    queryFn: () => api.getProducts({ isActive: true }),
  });

  const products: any[] = (rawProducts as any)?.data ?? (Array.isArray(rawProducts) ? rawProducts : []);

  // Use only real registered vendors from DB products & registered store profiles
  const allVendors = useMemo(() => {
    const list: CategoryVendor[] = [];

    // Read custom local storage vendors
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("vendor_store_")) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const vData = JSON.parse(raw);
              if (!list.some((m) => m.id === vData.id || m.slug === vData.slug)) {
                list.push({
                  id: vData.id || key.replace("vendor_store_", ""),
                  name: vData.name || "Custom Seller Store",
                  slug: vData.slug || "custom-store",
                  tagline: vData.tagline || "Verified Seller Storefront",
                  description: vData.description || "",
                  businessType: vData.businessType || "physical_shop",
                  gstNumber: vData.gstNumber || "",
                  address: vData.address || "Commercial Storefront",
                  city: vData.city || "Rajahmundry",
                  state: vData.state || "Andhra Pradesh",
                  pincode: vData.pincode || "533101",
                  shopPhotos: vData.shopPhotos || [],
                  categories: Array.isArray(vData.categories) ? vData.categories : [vData.category || "General"],
                  rating: 5.0,
                  reviewCount: 1,
                  joinedYear: 2026,
                });
              }
            }
          }
        }
      }
    } catch {}

    // Extract unique vendors from DB products
    products.forEach((p) => {
      const v = p.vendor || p.vendors;
      if (v && v.id && !list.some((existing) => existing.id === v.id || existing.slug === v.slug)) {
        list.push({
          id: v.id,
          name: v.name || "Seller Store",
          slug: v.slug || v.id,
          tagline: "Verified Marketplace Seller",
          description: "",
          businessType: v.businessType || "physical_shop",
          gstNumber: v.gstNumber || "",
          address: v.address || "Official Store",
          city: v.city || "Rajahmundry",
          state: v.state || "Andhra Pradesh",
          pincode: v.pincode || "533101",
          shopPhotos: v.shopPhotos || [],
          categories: [p.category || "General Products"],
          rating: 4.8,
          reviewCount: 20,
          joinedYear: 2024,
        });
      }
    });

    return list;
  }, [products]);

  // Filter vendors by category and search
  const filteredVendors = useMemo(() => {
    return allVendors.filter((v) => {
      const matchCat =
        selectedCat === "all" ||
        v.categories.some((c) => c.toLowerCase().includes(selectedCat.toLowerCase()));

      const matchSearch =
        !search.trim() ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.tagline.toLowerCase().includes(search.toLowerCase()) ||
        v.city.toLowerCase().includes(search.toLowerCase()) ||
        v.categories.some((c) => c.toLowerCase().includes(search.toLowerCase()));

      return matchCat && matchSearch;
    });
  }, [allVendors, selectedCat, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
              <Sparkles className="mr-1 h-3 w-3" /> Seller Directory
            </Badge>
            <Badge variant="secondary" className="font-semibold text-xs">
              {allVendors.length} Verified Stores
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">Marketplace Stores & Vendors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse authentic local stores, direct craft workshops, and verified suppliers across all 30 departments.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores, city, categories..."
            className="pl-9 text-xs h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Popular Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCat("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedCat === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All Departments ({allVendors.length})
        </button>
        {MARKETPLACE_CATEGORIES.slice(0, 10).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCat === cat.name
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Vendor Cards Grid */}
      <div>
        {filteredVendors.length === 0 ? (
          <EmptyState
            title="No stores found"
            description={search ? `No seller matches "${search}". Try searching for another city or category.` : "No active vendors currently in this department."}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => {
              const isPhysical = vendor.businessType !== "home_cloud";
              const coverImg = vendor.shopPhotos?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80";

              return (
                <div
                  key={vendor.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  <div>
                    {/* Cover Photo */}
                    <div className="relative h-36 w-full overflow-hidden bg-muted">
                      <img
                        src={coverImg}
                        alt={vendor.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      <div className="absolute top-2.5 left-2.5">
                        <Badge
                          className={`text-[10px] font-bold px-2 py-0.5 shadow-sm ${
                            isPhysical
                              ? "bg-primary text-primary-foreground"
                              : "bg-amber-600 text-white"
                          }`}
                        >
                          {isPhysical ? (
                            <>
                              <Store className="mr-1 h-3 w-3 inline" /> Physical Store
                            </>
                          ) : (
                            <>
                              <Home className="mr-1 h-3 w-3 inline" /> Home Studio
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Genuine
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3">
                        <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                          {vendor.name}
                        </h3>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {vendor.tagline || vendor.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-foreground/80">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">
                          {vendor.city}, {vendor.state}
                        </span>
                      </div>

                      {/* Multi Categories Badges */}
                      {vendor.categories && vendor.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {vendor.categories.map((c, i) => (
                            <span
                              key={i}
                              className="rounded bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-foreground"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 pt-0 border-t border-border/50 flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span>{vendor.rating || 4.9}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({vendor.reviewCount || 40})
                      </span>
                    </div>

                    <Link
                      to="/store/$slug"
                      params={{ slug: vendor.slug || vendor.id }}
                    >
                      <Button size="sm" className="rounded-xl text-xs font-bold gap-1 shadow-sm">
                        Visit Store <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorsList;

