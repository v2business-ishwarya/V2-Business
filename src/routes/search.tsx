import { createFileRoute, useSearch, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Store,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Sparkles,
  X,
  ArrowRight,
  Camera,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  MARKETPLACE_CATEGORIES,
  matchCategoryFuzzy,
  matchSubcategoryFuzzy,
  getSubcategoryBySlug,
} from "@/data/categories";
import { VisualSearchModal } from "@/components/visual-search-modal";

const KNOWN_LOCATIONS = [
  "Rajahmundry",
  "Danavaipeta",
  "Main Road",
  "Aryapuram",
  "Morampudi",
  "Kakinada",
  "Vijayawada",
  "Visakhapatnam",
  "Hyderabad",
];

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  sub: z.string().optional(),
  vendor: z.string().optional(),
  location: z.string().optional(),
  sort: z.enum(["new", "price_asc", "price_desc"]).optional(),
  visual: z.string().optional(),
  visualLabel: z.string().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Search Products, Categories, Vendors & Locations — V2 Business" },
      {
        name: "description",
        content:
          "Search products, local vendors, categories, and store locations across V2 Business Marketplace.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const params = useSearch({ from: "/search" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [term, setTerm] = useState(params.q ?? "");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sort, setSort] = useState(params.sort ?? "new");
  const [categoryFilterSearch, setCategoryFilterSearch] = useState("");
  const [locationFilterSearch, setLocationFilterSearch] = useState("");
  const [visualModalOpen, setVisualModalOpen] = useState(false);

  useEffect(() => {
    setTerm(params.q ?? "");
  }, [params.q]);

  // Instant fuzzy match for categories from query (e.g. "jewellery" or "jewwley")
  const matchedCategories = useMemo(() => {
    return params.q ? matchCategoryFuzzy(params.q) : [];
  }, [params.q]);
  const matchedCategory = matchedCategories[0] || null;

  // Determine if search query includes or targets a known location
  const isLocationSearch =
    Boolean(params.location) ||
    Boolean(
      params.q &&
        KNOWN_LOCATIONS.some((loc) =>
          params.q!.toLowerCase().trim().includes(loc.toLowerCase())
        )
    );

  const products = useQuery({
    queryKey: [
      "search-products",
      params.q,
      params.category,
      params.sub,
      params.vendor,
      params.location,
      sort,
    ],
    queryFn: async () => {
      const cleanTerm = isLocationSearch ? undefined : params.q;
      const subMatch = params.sub ? getSubcategoryBySlug(params.sub) : null;
      // If query is a known category or subcategory, target the category directly in 1 request!
      const targetCategory =
        params.category ||
        (subMatch ? subMatch.category.name : undefined) ||
        (matchedCategories.length > 0 ? matchedCategories[0].name : undefined);
      const searchParam = targetCategory ? undefined : cleanTerm;

      const res = await api.getProducts({
        search: searchParam,
        category: targetCategory,
        vendorId: params.vendor,
        isActive: true,
      });
      let list: any[] = (res as any)?.data ?? (Array.isArray(res) ? res : []);
      return list;
    },
    initialData: () => {
      const cleanQ = (params.q || "").trim().toLowerCase();
      if (!cleanQ) return undefined;

      const matchedCats = matchCategoryFuzzy(cleanQ);
      const matchedCatNames = matchedCats.map((c) => c.name.toLowerCase());

      // 1. Check autocomplete cache from header
      const autoData = qc.getQueryData<any>(["live-search-autocomplete", cleanQ]);
      if (autoData?.products && autoData.products.length > 0) {
        return autoData.products;
      }

      // 2. Check quick catalog and home products cache
      const catalogData = qc.getQueryData<any>(["quick-catalog"]);
      const homeData = qc.getQueryData<any>(["home-products"]);
      const pool = [
        ...((catalogData as any)?.data ?? (Array.isArray(catalogData) ? catalogData : [])),
        ...((homeData as any)?.data ?? (Array.isArray(homeData) ? homeData : [])),
      ];
      if (pool.length > 0) {
        const matched = pool.filter((p: any) => {
          const n = (p.name || "").toLowerCase();
          const c = (p.category || "").toLowerCase();
          const d = (p.description || "").toLowerCase();
          const matchesCategoryFuzzy = matchedCatNames.some(
            (mcn) => c.includes(mcn) || mcn.includes(c)
          );
          return (
            matchesCategoryFuzzy ||
            n.includes(cleanQ) ||
            c.includes(cleanQ) ||
            d.includes(cleanQ)
          );
        });
        if (matched.length > 0) return matched;
      }

      // 3. Check category products cache if matching category
      if (matchedCats.length > 0) {
        const catKey = ["cat-products", matchedCats[0].slug, matchedCats[0].name];
        const catData = qc.getQueryData<any>(catKey);
        if (catData) {
          const list = (catData as any)?.data ?? (Array.isArray(catData) ? catData : []);
          if (list.length > 0) return list;
        }
      }

      return undefined;
    },
    staleTime: 1000 * 60 * 5,
  });

  const catList = MARKETPLACE_CATEGORIES;
  const filteredCategoryList = catList.filter((c) =>
    c.name.toLowerCase().includes(categoryFilterSearch.toLowerCase().trim())
  );

  // Extract all available vendors and stores from products and localStorage
  const allStores = useMemo(() => {
    const storeMap = new Map<string, any>();

    // 1. Read custom localStorage vendor stores
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("vendor_store_")) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const vData = JSON.parse(raw);
              const storeId = vData.id || key.replace("vendor_store_", "");
              if (!storeMap.has(storeId)) {
                storeMap.set(storeId, {
                  id: storeId,
                  name: vData.name || "Custom Seller Store",
                  slug: vData.slug || "custom-store",
                  city: vData.city || "Rajahmundry",
                  address: vData.address || "Commercial Storefront",
                  businessType: vData.businessType || "physical_shop",
                  gstNumber: vData.gstNumber,
                  categories: Array.isArray(vData.categories)
                    ? vData.categories
                    : [vData.category || "General"],
                });
              }
            }
          }
        }
      }
    } catch {}

    // 2. Read stores from DB products
    (products.data ?? []).forEach((p: any) => {
      const v = p.vendor || p.vendors;
      if (v && v.id && !storeMap.has(v.id)) {
        let vendorCity = v.city || "Rajahmundry";
        let vendorAddress = v.address || "Official Store";
        try {
          const stored = localStorage.getItem(`vendor_store_${v.id}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.city) vendorCity = parsed.city;
            if (parsed.address) vendorAddress = parsed.address;
          }
        } catch {}

        storeMap.set(v.id, {
          id: v.id,
          name: v.name || "Seller Store",
          slug: v.slug || v.id,
          city: vendorCity,
          address: vendorAddress,
          businessType: v.businessType || "physical_shop",
          gstNumber: v.gstNumber,
          categories: [p.category || "General"],
        });
      }
    });

    return Array.from(storeMap.values());
  }, [products.data]);

  // Aggregate list of available locations across all stores & known locations
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>(KNOWN_LOCATIONS);
    allStores.forEach((s) => {
      if (s.city && s.city.trim()) locSet.add(s.city.trim());
    });
    return Array.from(locSet).filter((loc) =>
      loc.toLowerCase().includes(locationFilterSearch.toLowerCase().trim())
    );
  }, [allStores, locationFilterSearch]);

  // Matching stores according to query or location/category filters
  const matchingStores = useMemo(() => {
    const qLower = (params.q || "").toLowerCase().trim();
    const locParamLower = (params.location || "").toLowerCase().trim();
    const catParamLower = (params.category || "").toLowerCase().trim();

    if (!qLower && !locParamLower && !catParamLower) return [];

    return allStores.filter((store) => {
      const sName = (store.name || "").toLowerCase();
      const sCity = (store.city || "").toLowerCase();
      const sAddr = (store.address || "").toLowerCase();
      const sCats = (store.categories || []).map((c: string) => c.toLowerCase());

      if (locParamLower && sCity !== locParamLower && !sCity.includes(locParamLower)) {
        return false;
      }

      if (catParamLower && !sCats.some((c: string) => c.includes(catParamLower))) {
        return false;
      }

      if (qLower) {
        const matchesName = sName.includes(qLower);
        const matchesCity = sCity.includes(qLower);
        const matchesAddr = sAddr.includes(qLower);
        const matchesCat = sCats.some((c: string) => c.includes(qLower));
        return matchesName || matchesCity || matchesAddr || matchesCat;
      }

      return true;
    });
  }, [allStores, params.q, params.location, params.category]);

  // Client-side filtering of products across categories, locations, vendors, and query terms
  let filteredProducts: any[] = useMemo(() => {
    let list = [...(products.data ?? [])];
    const qLower = (params.q || "").toLowerCase().trim();
    const locFilter = (params.location || "").toLowerCase().trim();

    // 1. Filter by location (vendor city or address or product tags/description)
    if (locFilter) {
      list = list.filter((p: any) => {
        const v = p.vendor || p.vendors;
        const vendorStore = v?.id ? allStores.find((s) => s.id === v.id) : null;
        const vendorCity = (vendorStore?.city || v?.city || "Rajahmundry").toLowerCase();
        const vendorAddress = (vendorStore?.address || v?.address || "").toLowerCase();
        const tags = Array.isArray(p.tags) ? p.tags.join(" ").toLowerCase() : "";
        const desc = (p.description || "").toLowerCase();

        return (
          vendorCity.includes(locFilter) ||
          vendorAddress.includes(locFilter) ||
          tags.includes(locFilter) ||
          desc.includes(locFilter)
        );
      });
    }

    // 2. Filter by search term across products, vendors, categories & locations
    if (qLower) {
      const matchedCatNames = matchedCategories.map((c) => c.name.toLowerCase());

      list = list.filter((p: any) => {
        const pName = (p.name || "").toLowerCase();
        const pDesc = (p.description || "").toLowerCase();
        const pBrand = (p.brand || "").toLowerCase();
        const pTags = Array.isArray(p.tags) ? p.tags.join(" ").toLowerCase() : "";
        const pCat = (p.category || "").toLowerCase();
        const v = p.vendor || p.vendors;
        const vName = (v?.name || "").toLowerCase();

        const vendorStore = v?.id ? allStores.find((s) => s.id === v.id) : null;
        const vCity = (vendorStore?.city || v?.city || "Rajahmundry").toLowerCase();
        const vAddr = (vendorStore?.address || v?.address || "").toLowerCase();

        // If query matches a category via fuzzy match, products in that category ALWAYS match!
        const matchesCategoryFuzzy = matchedCatNames.some(
          (mcn) => pCat.includes(mcn) || mcn.includes(pCat)
        );

        return (
          matchesCategoryFuzzy ||
          pName.includes(qLower) ||
          pDesc.includes(qLower) ||
          pBrand.includes(qLower) ||
          pTags.includes(qLower) ||
          pCat.includes(qLower) ||
          vName.includes(qLower) ||
          vCity.includes(qLower) ||
          vAddr.includes(qLower)
        );
      });
    }

    // 3. Filter by category
    if (params.category) {
      const catObj = MARKETPLACE_CATEGORIES.find(
        (c) =>
          c.name.toLowerCase() === params.category!.toLowerCase() ||
          c.slug === params.category!.toLowerCase() ||
          (c.aliases && c.aliases.some((a) => a.toLowerCase() === params.category!.toLowerCase()))
      );
      const catAliases = [
        params.category!.toLowerCase(),
        ...(catObj?.aliases || []).map((a) => a.toLowerCase()),
      ];
      list = list.filter((p: any) => {
        if (!p.category && !p.categories) return false;
        const pCats = Array.isArray(p.categories) ? p.categories : [p.category];
        return pCats.some((catStr: string) => {
          if (!catStr) return false;
          const cLower = catStr.toLowerCase();
          return catAliases.some((alias) => cLower.includes(alias) || alias.includes(cLower));
        });
      });
    }

    // 3.5. Filter by subcategory
    if (params.sub) {
      const subInfo = getSubcategoryBySlug(params.sub);
      const subSlug = params.sub.toLowerCase().trim();
      const subTags = subInfo?.subcategory.popularTags?.map((t) => t.toLowerCase()) || [];

      list = list.filter((p: any) => {
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
            haystack.includes("fashion jewel") ||
            haystack.includes("artificial");
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

    // 4. Filter by vendor ID
    if (params.vendor) {
      list = list.filter((p: any) => {
        const v = p.vendor || p.vendors;
        return v?.id === params.vendor;
      });
    }

    // 5. Filter by price range
    list = list.filter((p: any) => {
      const price = Number(p.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // 6. Sort
    if (sort === "price_asc") {
      list.sort((a: any, b: any) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sort === "price_desc") {
      list.sort((a: any, b: any) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    return list;
  }, [products.data, params.q, params.location, params.category, params.sub, params.vendor, priceRange, sort, allStores]);

  // Check if search query matches a known category
  const matchingCategory = useMemo(() => {
    if (!params.q) return null;
    const q = params.q.toLowerCase().trim();
    return catList.find(
      (c) =>
        c.name.toLowerCase() === q ||
        c.slug === q ||
        (c.aliases && c.aliases.some((a) => a.toLowerCase() === q))
    );
  }, [params.q, catList]);

  // Resolve target category metadata for subcategories
  const targetCategoryMeta = useMemo(() => {
    if (params.category) {
      const found = MARKETPLACE_CATEGORIES.find(
        (c) =>
          c.name.toLowerCase() === params.category!.toLowerCase() ||
          c.slug === params.category!.toLowerCase() ||
          (c.aliases && c.aliases.some((a) => a.toLowerCase() === params.category!.toLowerCase()))
      );
      if (found) return found;
    }
    if (params.sub) {
      const subInfo = getSubcategoryBySlug(params.sub);
      if (subInfo) return subInfo.category;
    }
    if (matchedCategory) {
      return matchedCategory;
    }
    return null;
  }, [params.category, params.sub, matchedCategory]);

  const availableSubcategories = targetCategoryMeta?.subcategories || [];
  const activeSubcategoryObj = params.sub ? getSubcategoryBySlug(params.sub)?.subcategory : null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/search",
      search: {
        ...params,
        q: term.trim() || undefined,
      },
    });
  };

  const handleClearQuery = () => {
    setTerm("");
    navigate({
      to: "/search",
      search: {
        ...params,
        q: undefined,
      },
    });
  };

  const Filters = (
    <div className="space-y-6">
      {/* 1. Location Filter Section */}
      <div>
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-rose-500" /> Location / City
          </Label>
          {params.location && (
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/search",
                  search: { ...params, location: undefined },
                })
              }
              className="text-[11px] text-rose-600 hover:underline font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="mt-2 mb-2">
          <Input
            placeholder="Filter locations..."
            value={locationFilterSearch}
            onChange={(e) => setLocationFilterSearch(e.target.value)}
            className="h-8 text-xs rounded-xl bg-muted/50"
          />
        </div>

        <div className="mt-1 space-y-0.5 max-h-[220px] overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/search",
                search: { ...params, location: undefined },
              })
            }
            className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted ${
              !params.location
                ? "bg-rose-500 text-white font-bold"
                : "text-foreground"
            }`}
          >
            <span>All Locations</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-bold">
              {availableLocations.length}
            </Badge>
          </button>
          {availableLocations.map((loc) => {
            const isSelected =
              params.location?.toLowerCase() === loc.toLowerCase();
            return (
              <button
                key={loc}
                type="button"
                onClick={() =>
                  navigate({
                    to: "/search",
                    search: { ...params, location: isSelected ? undefined : loc },
                  })
                }
                className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs transition-colors hover:bg-muted text-left ${
                  isSelected
                    ? "bg-rose-500 text-white font-bold"
                    : "text-foreground/90 font-medium"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isSelected ? "text-white" : "text-rose-500"
                    }`}
                  />
                  <span className="truncate">{loc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Category Filter Section */}
      <div className="pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Categories ({catList.length})
          </Label>
          {params.category && (
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/search",
                  search: { ...params, category: undefined },
                })
              }
              className="text-[11px] text-primary hover:underline font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="mt-2 mb-2">
          <Input
            placeholder="Filter categories..."
            value={categoryFilterSearch}
            onChange={(e) => setCategoryFilterSearch(e.target.value)}
            className="h-8 text-xs rounded-xl bg-muted/50"
          />
        </div>

        <div className="mt-1 space-y-0.5 max-h-[260px] overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/search",
                search: { ...params, category: undefined },
              })
            }
            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors hover:bg-muted ${
              !params.category
                ? "bg-primary text-primary-foreground font-bold"
                : "text-foreground"
            }`}
          >
            <span>All Categories</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-bold">
              {catList.length}
            </Badge>
          </button>
          {filteredCategoryList.map((c) => {
            const isSelected =
              params.category === c.name ||
              params.category === c.slug ||
              (c.aliases && c.aliases.includes(params.category || ""));
            const showSubcategories =
              Boolean(c.subcategories && c.subcategories.length > 0) &&
              (isSelected || (targetCategoryMeta && targetCategoryMeta.id === c.id));

            return (
              <div key={c.id} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/search",
                      search: {
                        ...params,
                        category: isSelected ? undefined : c.name,
                        sub: isSelected ? undefined : params.sub,
                      },
                    })
                  }
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs transition-colors hover:bg-muted text-left group ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-foreground/90 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="h-5 w-5 rounded-md overflow-hidden bg-muted shrink-0 border border-border/40">
                      <img src={c.imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <span className="truncate">{c.name}</span>
                  </div>
                  {c.subcategories && c.subcategories.length > 0 && (
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1 py-0 h-4 border-primary/30 ${
                        isSelected ? "bg-white/20 text-white" : "text-primary"
                      }`}
                    >
                      {c.subcategories.length} subs
                    </Badge>
                  )}
                </button>

                {/* Subcategories nested tree */}
                {showSubcategories && (
                  <div className="ml-5 pl-2.5 border-l-2 border-amber-500/40 space-y-1 py-1">
                    {c.subcategories!.map((sub) => {
                      const isSubSelected = params.sub === sub.slug;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() =>
                            navigate({
                              to: "/search",
                              search: {
                                ...params,
                                category: c.name,
                                sub: isSubSelected ? undefined : sub.slug,
                              },
                            })
                          }
                          className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1 text-[11px] transition-colors hover:bg-muted text-left ${
                            isSubSelected
                              ? "bg-amber-500 text-white font-bold shadow-xs"
                              : "text-muted-foreground hover:text-foreground font-medium"
                          }`}
                        >
                          <span className="truncate">↳ {sub.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Price Range Filter Section */}
      <div className="pt-2 border-t border-border/60">
        <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">
          Price Range
        </Label>
        <div className="mt-3 space-y-2">
          <Slider
            min={0}
            max={50000}
            step={100}
            value={priceRange}
            onValueChange={(v) => setPriceRange(v as [number, number])}
          />
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Input Bar with Location, Category, Vendor, Products placeholder */}
      <form onSubmit={handleSearchSubmit} className="relative mb-5 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search products, categories, vendors, location (e.g. Rajahmundry)..."
            className="h-12 rounded-full pl-11 pr-10 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          {term.trim().length > 0 && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="absolute right-11 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {/* Visual Camera Search Trigger */}
          <button
            type="button"
            onClick={() => setVisualModalOpen(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground/75 hover:text-amber-500 rounded-full hover:bg-amber-500/10 transition-colors cursor-pointer flex items-center justify-center"
            title="Search by image or camera"
            aria-label="Visual Image Search"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <Button
          type="submit"
          className="h-12 rounded-full px-6 font-semibold shadow-sm shrink-0 gap-1.5"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
        </Button>
      </form>

      {/* Visual Search Match Banner */}
      {params.visual === "true" && (
        <div className="mb-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Visual Lens Search Result
                </span>
                <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0.5">
                  AI Matched
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 font-medium mt-0.5">
                Showing matching products for <strong>"{params.visualLabel || params.q || 'Selected Item'}"</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVisualModalOpen(true)}
              className="h-8 rounded-full border-amber-500/40 hover:bg-amber-500/10 text-xs font-semibold gap-1.5"
            >
              <Camera className="h-3.5 w-3.5 text-amber-600" />
              <span>Search Another Photo</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate({
                  to: "/search",
                  search: { ...params, visual: undefined, visualLabel: undefined },
                })
              }
              className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Active Filter Badges */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {params.q && (
          <Badge
            variant="outline"
            className="py-1 px-3 text-xs bg-muted/60 flex items-center gap-1.5 rounded-full"
          >
            <span>Query: <strong>"{params.q}"</strong></span>
            <X
              className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={handleClearQuery}
            />
          </Badge>
        )}

        {params.location && (
          <Badge
            variant="outline"
            className="py-1 px-3 text-xs bg-rose-500/10 text-rose-700 border-rose-500/20 flex items-center gap-1.5 rounded-full"
          >
            <MapPin className="h-3 w-3 text-rose-500" />
            <span>Location: <strong>{params.location}</strong></span>
            <X
              className="h-3.5 w-3.5 cursor-pointer text-rose-600 hover:text-rose-900"
              onClick={() =>
                navigate({ to: "/search", search: { ...params, location: undefined } })
              }
            />
          </Badge>
        )}

        {params.category && (
          <Badge
            variant="outline"
            className="py-1 px-3 text-xs bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5 rounded-full"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Category: <strong>{params.category}</strong></span>
            <X
              className="h-3.5 w-3.5 cursor-pointer text-primary hover:text-primary/80"
              onClick={() =>
                navigate({ to: "/search", search: { ...params, category: undefined, sub: undefined } })
              }
            />
          </Badge>
        )}

        {params.sub && (
          <Badge
            variant="outline"
            className="py-1 px-3 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 flex items-center gap-1.5 rounded-full"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Subcategory: <strong>{activeSubcategoryObj?.name || params.sub}</strong></span>
            <X
              className="h-3.5 w-3.5 cursor-pointer text-amber-600 hover:text-amber-800"
              onClick={() =>
                navigate({ to: "/search", search: { ...params, sub: undefined } })
              }
            />
          </Badge>
        )}

        {matchedCategory && !params.category && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              navigate({ to: "/category/$slug", params: { slug: matchedCategory.slug } })
            }
            className="h-7 text-xs rounded-full border-amber-500/40 text-amber-600 bg-amber-500/10 gap-1 font-bold"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Category: {matchedCategory.name}</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Horizontal Subcategory Filter Chips Row */}
      {availableSubcategories.length > 0 && (
        <div className="mb-6 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Subcategories:</span>
            </span>
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/search",
                  search: { ...params, sub: undefined },
                })
              }
              className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 transition-all ${
                !params.sub
                  ? "bg-amber-500 text-white font-bold shadow-xs"
                  : "bg-background hover:bg-muted text-foreground border border-border/80"
              }`}
            >
              All {targetCategoryMeta?.name || "Items"}
            </button>
            {availableSubcategories.map((sub) => {
              const isSubSelected = params.sub === sub.slug;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/search",
                      search: {
                        ...params,
                        category: targetCategoryMeta?.name || params.category || "Jewellery, Gold & Silver",
                        sub: isSubSelected ? undefined : sub.slug,
                      },
                    })
                  }
                  className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                    isSubSelected
                      ? "bg-amber-500 text-white font-bold shadow-xs"
                      : "bg-background hover:bg-muted text-foreground border border-border/80"
                  }`}
                >
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
          {params.sub && (
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/search",
                  search: { ...params, sub: undefined },
                })
              }
              className="text-xs text-muted-foreground hover:text-foreground font-medium shrink-0 self-end sm:self-auto cursor-pointer"
            >
              Clear subcategory filter
            </button>
          )}
        </div>
      )}

      {/* Prominent Matched Category Spotlight Card */}
      {matchedCategory && (
        <div className="mb-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl overflow-hidden bg-muted shrink-0 border border-amber-500/20 shadow-xs">
              <img
                src={matchedCategory.imageUrl}
                alt={matchedCategory.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider">
                  Category Match
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">{matchedCategory.itemCount}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5">
                {matchedCategory.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {matchedCategory.description}
              </p>
              {matchedCategory.subcategories && matchedCategory.subcategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-semibold text-muted-foreground">Subcategories:</span>
                  {matchedCategory.subcategories.map((sub) => {
                    const isSubSelected = params.sub === sub.slug;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/search",
                            search: {
                              ...params,
                              category: matchedCategory.name,
                              sub: isSubSelected ? undefined : sub.slug,
                            },
                          })
                        }
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors border cursor-pointer ${
                          isSubSelected
                            ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                            : "bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/25 hover:bg-amber-500/20"
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <Link
            to="/category/$slug"
            params={{ slug: matchedCategory.slug }}
            className="shrink-0"
          >
            <Button size="sm" className="rounded-full font-bold w-full sm:w-auto shadow-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black">
              Explore All {matchedCategory.name.split("&")[0].trim()} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Matching Stores & Vendors Showcase Banner */}
      {matchingStores.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
              <Store className="h-4 w-4 text-amber-600" /> Matching Stores ({matchingStores.length})
            </span>
            <Badge
              variant="outline"
              className="text-[10px] bg-background text-amber-700 dark:text-amber-300 border-amber-500/30"
            >
              Local Storefronts
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {matchingStores.map((store: any) => (
              <Link
                key={store.id}
                to="/store/$slug"
                params={{ slug: store.slug || store.id }}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <Store className="h-5 w-5" />
                  </div>
                  <div className="truncate text-xs">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-foreground text-sm truncate">{store.name}</p>
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                      <span>{store.city || "Rajahmundry"}</span>
                      <span>·</span>
                      <span>{store.businessType === "home_cloud" ? "🏡 Home Studio" : "🏪 Retail Shop"}</span>
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs font-semibold shrink-0 group-hover:text-primary"
                >
                  Visit <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results Header & Controls */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {products.isLoading
            ? "Searching products, vendors, categories & locations..."
            : `${filteredProducts.length} product results${
                params.q ? ` for "${params.q}"` : ""
              }${params.location ? ` in ${params.location}` : ""}`}
        </p>
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as any)}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="price_asc">Price: low → high</SelectItem>
              <SelectItem value="price_desc">Price: high → low</SelectItem>
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto p-6">
              {Filters}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Product Cards */}
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-4 shadow-xs">
            {Filters}
          </div>
        </aside>
        <div>
          {products.isLoading && filteredProducts.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-3 space-y-3 animate-pulse"
                >
                  <div className="aspect-square w-full rounded-xl bg-muted/60" />
                  <div className="h-4 w-3/4 rounded bg-muted/60" />
                  <div className="h-5 w-1/2 rounded bg-muted/60" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your search query, location, or filters to find what you're looking for."
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

      {/* Visual Image Search Modal */}
      <VisualSearchModal
        open={visualModalOpen}
        onOpenChange={setVisualModalOpen}
      />
    </div>
  );
}

export default SearchPage;
