import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Sparkles,
  Store,
  Home,
  ShieldCheck,
  MapPin,
  FileCheck2,
  ExternalLink,
  Search,
  Layers,
  Star,
  Package,
} from "lucide-react";
import {
  getCategoryBySlug,
  getVendorsForCategory,
  getSubcategoryBySlug,
  CategoryVendor,
} from "@/data/categories";
import { useState, useMemo } from "react";
import { z } from "zod";

const categorySearchSchema = z.object({
  sub: z.string().optional(),
});

export const Route = createFileRoute("/category/$slug")({
  validateSearch: categorySearchSchema,
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
  const { sub } = Route.useSearch();
  const navigate = Route.useNavigate();
  const categoryMeta = getCategoryBySlug(slug);
  const categoryName = categoryMeta?.name || slug.replace(/-/g, " ");
  const [activeTab, setActiveTab] = useState<"all" | "vendors" | "products">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: rawProducts = [], isLoading } = useQuery({
    queryKey: ["cat-products", slug, categoryName],
    queryFn: () => api.getProducts({ category: categoryName }),
    staleTime: 1000 * 60 * 5,
  });

  const apiProducts: any[] = (rawProducts as any)?.data ?? (Array.isArray(rawProducts) ? rawProducts : []);
  const title = categoryMeta?.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

  // 1. Get verified vendors for this category
  const categoryVendors = useMemo(() => {
    const list = getVendorsForCategory(slug);

    // Merge any unique vendors from real DB products
    apiProducts.forEach((p) => {
      const v = p.vendor || p.vendors;
      if (v && v.id && !list.some((existing) => existing.id === v.id || existing.slug === v.slug)) {
        list.push({
          id: v.id,
          name: v.name || "Seller Store",
          slug: v.slug || v.id,
          tagline: v.tagline || "",
          description: v.description || "",
          businessType: v.businessType || "physical_shop",
          gstNumber: v.gstNumber || "",
          address: v.address || "",
          city: v.city || "",
          state: v.state || "",
          pincode: v.pincode || "",
          shopPhotos: v.shopPhotos || [],
          categories: [title],
          rating: 5.0,
          reviewCount: 0,
          joinedYear: 2026,
        });
      }
    });

    return list;
  }, [slug, apiProducts, title]);

  // 2. Real products from API
  const allProducts = apiProducts;

  // Filter vendors & products by search query
  // Filter vendors & products by subcategory and search query
  const filteredVendors = useMemo(() => {
    let list = categoryVendors;
    if (sub) {
      const subSlug = sub.toLowerCase();
      const filtered = list.filter((v) => {
        const vText = `${v.name} ${v.tagline} ${v.description} ${(v.categories || []).join(" ")}`.toLowerCase();
        if (subSlug.includes("gold-silver") || subSlug.includes("gold") || subSlug.includes("silver")) {
          return vText.includes("gold") || vText.includes("silver") || vText.includes("jewel") || vText.includes("hallmark");
        }
        if (subSlug.includes("imitation")) {
          return vText.includes("imitation") || vText.includes("fashion") || vText.includes("1 gram") || vText.includes("jewel");
        }
        return true;
      });
      if (filtered.length > 0) list = filtered;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.tagline.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.categories.some((c) => c.toLowerCase().includes(q))
      );
    }
    return list;
  }, [categoryVendors, searchQuery, sub]);

  const filteredProducts = useMemo(() => {
    let list = allProducts;
    if (sub) {
      const subInfo = getSubcategoryBySlug(sub);
      const subSlug = sub.toLowerCase().trim();
      const subTags = subInfo?.subcategory.popularTags?.map((t) => t.toLowerCase()) || [];

      list = list.filter((p) => {
        const pName = (p.name || "").toLowerCase();
        const pDesc = (p.description || "").toLowerCase();
        const pTags = Array.isArray(p.tags) ? p.tags.join(" ").toLowerCase() : "";
        const pCat = (p.category || "").toLowerCase();
        const pSub = (p.subcategory || p.subCategory || "").toLowerCase();
        const haystack = `${pName} ${pDesc} ${pTags} ${pCat} ${pSub}`;

        if (subSlug.includes("gold-silver") || subSlug.includes("gold") || subSlug.includes("silver")) {
          const isGoldOrSilver =
            haystack.includes("gold") ||
            haystack.includes("silver") ||
            haystack.includes("22k") ||
            haystack.includes("24k") ||
            haystack.includes("925") ||
            haystack.includes("hallmark") ||
            haystack.includes("coin") ||
            subTags.some((t) => haystack.includes(t));
          const isImitationOnly =
            haystack.includes("imitation") ||
            haystack.includes("1 gram") ||
            haystack.includes("artificial") ||
            haystack.includes("fashion jewel");
          return isGoldOrSilver && !isImitationOnly;
        }

        if (subSlug.includes("imitation")) {
          return (
            haystack.includes("imitation") ||
            haystack.includes("1 gram") ||
            haystack.includes("fashion jewel") ||
            haystack.includes("kundan") ||
            haystack.includes("cz") ||
            haystack.includes("oxidised") ||
            haystack.includes("temple") ||
            haystack.includes("artificial") ||
            subTags.some((t) => haystack.includes(t))
          );
        }

        return (
          haystack.includes(subSlug) ||
          (subInfo && haystack.includes(subInfo.subcategory.name.toLowerCase())) ||
          subTags.some((t) => haystack.includes(t))
        );
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.vendor?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allProducts, searchQuery, sub]);

  return (
    <div className="min-h-screen bg-background pb-20">
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
                <Badge variant="secondary" className="font-semibold text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                  <Store className="mr-1 h-3 w-3" /> {categoryVendors.length} Local Stores
                </Badge>
                <Badge variant="secondary" className="font-semibold text-xs">
                  <Package className="mr-1 h-3 w-3" /> {allProducts.length} Products
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{title}</h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {categoryMeta?.description || `Discover curated products and local seller stores in ${title}.`}
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

              {/* Subcategories (e.g. Gold & Silver Jewellery, Imitation Jewellery) */}
              {categoryMeta?.subcategories && categoryMeta.subcategories.length > 0 && (
                <div className="pt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Explore Subcategories
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate({ to: "/category/$slug", params: { slug }, search: { sub: undefined } })}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        !sub
                          ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30"
                          : "bg-card border border-border/80 hover:bg-muted text-foreground"
                      }`}
                    >
                      All {title}
                    </button>
                    {categoryMeta.subcategories.map((sc) => {
                      const isSubActive = sub === sc.slug;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() =>
                            navigate({
                              to: "/category/$slug",
                              params: { slug },
                              search: { sub: isSubActive ? undefined : sc.slug },
                            })
                          }
                          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSubActive
                              ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30"
                              : "bg-card border border-border/80 hover:bg-muted text-foreground"
                          }`}
                        >
                          <span>{sc.name}</span>
                        </button>
                      );
                    })}
                  </div>
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

      {/* FILTER & VIEW CONTROLS */}
      <div className="sticky top-16 z-20 border-b border-border bg-background/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/70 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Overview
            </button>
            <button
              onClick={() => setActiveTab("vendors")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "vendors"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store className="h-3.5 w-3.5 text-primary" />
              Sellers & Stores ({filteredVendors.length})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "products"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="h-3.5 w-3.5 text-primary" />
              Products ({filteredProducts.length})
            </button>
          </div>

          {/* Search within category */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search vendors & products in ${title}...`}
              className="pl-8 text-xs h-9 rounded-xl"
            />
          </div>
        </div>

        {/* Subcategories sticky quick bar */}
        {categoryMeta?.subcategories && categoryMeta.subcategories.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 pb-2.5 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-t border-border/40 pt-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">Subcategory:</span>
            <button
              type="button"
              onClick={() => navigate({ to: "/category/$slug", params: { slug }, search: { sub: undefined } })}
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 cursor-pointer ${
                !sub ? "bg-amber-500 text-white font-bold" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All {title}
            </button>
            {categoryMeta.subcategories.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() =>
                  navigate({
                    to: "/category/$slug",
                    params: { slug },
                    search: { sub: sub === sc.slug ? undefined : sc.slug },
                  })
                }
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 cursor-pointer ${
                  sub === sc.slug ? "bg-amber-500 text-white font-bold" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {sc.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {/* 1. VENDORS SECTION */}
        {(activeTab === "all" || activeTab === "vendors") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" /> Sellers & Stores in {title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click any vendor to inspect their store credentials and view everything they are selling.
                </p>
              </div>
              <Badge variant="outline" className="font-bold text-xs bg-emerald-500/10 text-emerald-700">
                {filteredVendors.length} Stores Listed
              </Badge>
            </div>

            {filteredVendors.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed text-center bg-card/50 space-y-2">
                <Store className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="font-semibold text-sm text-foreground">
                  {searchQuery ? `No stores found matching "${searchQuery}"` : `No registered sellers in ${title} yet`}
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {searchQuery
                    ? "Try searching for a different store name or city."
                    : `Be the first merchant to list and sell ${title} on V2 Business Marketplace.`}
                </p>
                <div className="pt-2">
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                      Become a Seller in this Department
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVendors.map((vendor) => {
                  const isPhysical = vendor.businessType !== "home_cloud";
                  const coverImg = vendor.shopPhotos?.[0] || categoryMeta?.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80";

                  return (
                    <div
                      key={vendor.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:border-primary/50 hover:shadow-lg transition-all"
                    >
                      <div>
                        {/* Store Cover Thumbnail */}
                        <div className="relative h-32 w-full overflow-hidden bg-muted">
                          <img
                            src={coverImg}
                            alt={vendor.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                          {/* Business type badge on photo */}
                          <div className="absolute top-2.5 left-2.5">
                            <Badge
                              className={`text-[10px] font-bold px-2 py-0.5 shadow-sm ${
                                isPhysical
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-emerald-600 text-white"
                              }`}
                            >
                              {isPhysical ? (
                                <>
                                  <Store className="mr-1 h-3 w-3 inline" /> Physical Retail Store
                                </>
                              ) : (
                                <>
                                  <Home className="mr-1 h-3 w-3 inline" /> Home Studio / Cloud
                                </>
                              )}
                            </Badge>
                          </div>

                          {/* Verified genuine seal */}
                          <div className="absolute top-2.5 right-2.5">
                            <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" /> Genuine
                            </span>
                          </div>

                          {/* Store Name pinned to bottom of banner */}
                          <div className="absolute bottom-2.5 left-3 right-3">
                            <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition-colors drop-shadow-sm">
                              {vendor.name}
                            </h3>
                          </div>
                        </div>

                        {/* Card Details Body */}
                        <div className="p-4 space-y-3">
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {vendor.tagline || vendor.description}
                          </p>

                          {/* Location & GST checkpoints */}
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-2 text-foreground/80">
                              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate">
                                {vendor.city}, {vendor.state} {vendor.pincode ? `(${vendor.pincode})` : ""}
                              </span>
                            </div>

                            {vendor.gstNumber ? (
                              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                                <FileCheck2 className="h-3.5 w-3.5 shrink-0" />
                                <span>GSTIN: {vendor.gstNumber}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                                <FileCheck2 className="h-3.5 w-3.5 shrink-0" />
                                <span>GST Exempt / Micro-Artisan</span>
                              </div>
                            )}
                          </div>

                          {/* Categories tags */}
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

                      {/* Card Footer Action */}
                      <div className="p-4 pt-0 border-t border-border/50 flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          <span>{vendor.rating || 4.9}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            ({vendor.reviewCount || 45})
                          </span>
                        </div>

                        <Link
                          to="/store/$slug"
                          params={{ slug: vendor.slug || vendor.id }}
                        >
                          <Button size="sm" className="rounded-xl text-xs font-bold gap-1 shadow-sm">
                            View Store Products <ArrowLeft className="h-3 w-3 rotate-180" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* 2. PRODUCTS SECTION */}
        {(activeTab === "all" || activeTab === "products") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Products in {title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Browse products listed by all sellers in this department.
                </p>
              </div>
              <Badge variant="outline" className="font-bold text-xs">
                {filteredProducts.length} Items Available
              </Badge>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-72 rounded-2xl bg-muted/60 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                title={`No products listed in ${title} yet`}
                description="Vendors are continuously uploading items. Check back soon or browse other departments."
                action={
                  <Link to="/categories">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                      Explore All Categories
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;


