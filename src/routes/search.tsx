import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
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
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Store, ShieldCheck, MapPin, ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  vendor: z.string().optional(),
  sort: z.enum(["new", "price_asc", "price_desc"]).optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Search — V2 Business" },
      { name: "description", content: "Search products, vendors, and categories on V2 Business." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const params = useSearch({ from: "/search" });
  const [term, setTerm] = useState(params.q ?? "");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sort, setSort] = useState(params.sort ?? "new");

  useEffect(() => {
    setTerm(params.q ?? "");
  }, [params.q]);

  const cats = useQuery({
    queryKey: ["all-cats"],
    queryFn: () => api.getCategories(),
  });

  const products = useQuery({
    queryKey: ["search-products", params.q, params.category, params.vendor, sort],
    queryFn: async () => {
      const res = await api.getProducts({
        search: params.q,
        category: params.category,
        vendorId: params.vendor,
        isActive: true,
      });
      const list: any[] = (res as any)?.data ?? (Array.isArray(res) ? res : []);
      return list;
    },
  });

  const catList: any[] = Array.isArray(cats.data) ? cats.data : [];
  let filteredProducts: any[] = products.data ?? [];

  // Filter by price range
  filteredProducts = filteredProducts.filter((p: any) => {
    const price = Number(p.price) || 0;
    return price >= priceRange[0] && price <= priceRange[1];
  });

  // Sort
  if (sort === "price_asc") {
    filteredProducts.sort((a: any, b: any) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (sort === "price_desc") {
    filteredProducts.sort((a: any, b: any) => (Number(b.price) || 0) - (Number(a.price) || 0));
  }

  // Extract matching stores from search query
  const matchingStores = (() => {
    if (!params.q) return [];
    const storeMap = new Map();
    (products.data ?? []).forEach((p: any) => {
      const v = p.vendor || p.vendors;
      if (v && v.id && !storeMap.has(v.id)) {
        storeMap.set(v.id, {
          id: v.id,
          name: v.name,
          slug: v.slug || v.id,
          city: v.city || "Verified Location",
          businessType: v.businessType || "physical_shop",
          gstNumber: v.gstNumber,
        });
      }
    });
    return Array.from(storeMap.values());
  })();

  const Filters = (
    <div className="space-y-6">
      <div>
        <Label className="text-xs uppercase text-muted-foreground font-semibold">Category</Label>
        <div className="mt-2 space-y-1">
          <Link
            to="/search"
            search={{ q: params.q }}
            className={`block rounded-md px-3 py-1.5 text-sm hover:bg-muted ${!params.category ? "bg-primary text-primary-foreground font-medium" : ""}`}
          >
            All Categories
          </Link>
          {catList.map((c: any) => (
            <Link
              key={c.id || c.name}
              to="/search"
              search={{ q: params.q, category: c.name }}
              className={`block rounded-md px-3 py-1.5 text-sm hover:bg-muted ${params.category === c.name ? "bg-primary text-primary-foreground font-medium" : ""}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase text-muted-foreground font-semibold">Price Range</Label>
        <div className="mt-3">
          <Slider
            min={0}
            max={50000}
            step={100}
            value={priceRange}
            onValueChange={(v) => setPriceRange(v as [number, number])}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            ₹{priceRange[0]} – ₹{priceRange[1]}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          window.location.assign(`/search?q=${encodeURIComponent(term)}`);
        }}
        className="relative mb-6"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search products, brands, stores, categories..."
          className="h-12 rounded-full pl-11 pr-4 text-sm"
        />
      </form>

      {/* Matching Stores & Vendors Showcase Banner */}
      {matchingStores.length > 0 && (
        <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Store className="h-4 w-4" /> Matching Verified Stores ({matchingStores.length})
            </span>
            <Badge variant="outline" className="text-[10px] bg-white text-emerald-700">
              Direct Seller Stores
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
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {store.businessType === "home_cloud" ? "🏡 Home Studio" : "🏪 Retail Shop"} · {store.city}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-8 px-2 text-xs font-semibold shrink-0 group-hover:text-primary">
                  Visit <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {products.isLoading
            ? "Searching..."
            : `${filteredProducts.length} results${params.q ? ` for "${params.q}"` : ""}`}
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

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{Filters}</div>
        </aside>
        <div>
          {filteredProducts.length === 0 && !products.isLoading ? (
            <EmptyState
              title="No products found"
              description="Try a different search term or adjust your price filters."
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

export default SearchPage;
