import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  vendor: z.string().optional(),
  sort: z.enum(["new", "price_asc", "price_desc", "rating"]).optional(),
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
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sort, setSort] = useState(params.sort ?? "new");

  useEffect(() => {
    setTerm(params.q ?? "");
  }, [params.q]);

  const cats = useQuery({
    queryKey: ["all-cats"],
    queryFn: async () =>
      (await supabase.from("categories").select("id,slug,name").order("name")).data ?? [],
  });

  const vendors = useQuery({
    queryKey: ["all-vendors-approved"],
    queryFn: async () =>
      (await supabase.from("vendors").select("id,slug,name").eq("status", "approved").order("name"))
        .data ?? [],
  });

  const products = useQuery({
    queryKey: [
      "search",
      params.q,
      params.category,
      params.vendor,
      sort,
      inStock,
      onSale,
      minRating,
      priceRange,
    ],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("*, vendors!inner(id,name,slug,status), categories(id,name,slug)")
        .eq("status", "active")
        .eq("vendors.status", "approved");
      if (params.q)
        q = q.or(
          `name.ilike.%${params.q}%,description.ilike.%${params.q}%,brand.ilike.%${params.q}%`,
        );
      if (params.category) q = q.eq("categories.slug", params.category);
      if (params.vendor) q = q.eq("vendors.slug", params.vendor);
      if (inStock) q = q.gt("stock", 0);
      if (onSale) q = q.not("discount_price", "is", null);
      if (minRating > 0) q = q.gte("avg_rating", minRating);
      q = q.gte("price", priceRange[0]).lte("price", priceRange[1]);
      if (sort === "price_asc") q = q.order("price", { ascending: true });
      else if (sort === "price_desc") q = q.order("price", { ascending: false });
      else if (sort === "rating") q = q.order("avg_rating", { ascending: false });
      else q = q.order("created_at", { ascending: false });
      const { data } = await q.limit(60);
      // Also do a client-side vendor-name filter when searching text
      if (params.q) {
        const t = params.q.toLowerCase();
        return (data ?? []).filter(
          (p: any) =>
            p.name.toLowerCase().includes(t) ||
            (p.description ?? "").toLowerCase().includes(t) ||
            (p.brand ?? "").toLowerCase().includes(t) ||
            p.vendors?.name.toLowerCase().includes(t) ||
            p.categories?.name?.toLowerCase().includes(t),
        );
      }
      return data ?? [];
    },
  });

  const Filters = (
    <div className="space-y-6">
      <div>
        <Label className="text-xs uppercase text-muted-foreground">Category</Label>
        <div className="mt-2 space-y-1">
          <Link
            to="/search"
            search={{ q: params.q }}
            className={`block rounded-md px-2 py-1 text-sm hover:bg-surface-muted ${!params.category ? "bg-primary-soft font-medium text-primary" : ""}`}
          >
            All
          </Link>
          {(cats.data ?? []).map((c) => (
            <Link
              key={c.id}
              to="/search"
              search={{ q: params.q, category: c.slug }}
              className={`block rounded-md px-2 py-1 text-sm hover:bg-surface-muted ${params.category === c.slug ? "bg-primary-soft font-medium text-primary" : ""}`}
            >
              {c.name}
            </Link>
          ))}
          {(cats.data ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground">No categories yet.</p>
          )}
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase text-muted-foreground">Vendor</Label>
        <div className="mt-2 max-h-56 space-y-1 overflow-auto">
          <Link
            to="/search"
            search={{ q: params.q }}
            className={`block rounded-md px-2 py-1 text-sm hover:bg-surface-muted ${!params.vendor ? "bg-primary-soft font-medium text-primary" : ""}`}
          >
            All
          </Link>
          {(vendors.data ?? []).map((v) => (
            <Link
              key={v.id}
              to="/search"
              search={{ q: params.q, vendor: v.slug }}
              className={`block rounded-md px-2 py-1 text-sm hover:bg-surface-muted ${params.vendor === v.slug ? "bg-primary-soft font-medium text-primary" : ""}`}
            >
              {v.name}
            </Link>
          ))}
          {(vendors.data ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground">No vendors yet.</p>
          )}
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase text-muted-foreground">Price range</Label>
        <div className="mt-3">
          <Slider
            min={0}
            max={10000}
            step={10}
            value={priceRange}
            onValueChange={(v) => setPriceRange(v as [number, number])}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            ${priceRange[0]} – ${priceRange[1]}
          </p>
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase text-muted-foreground">Minimum rating</Label>
        <div className="mt-3">
          <Slider
            min={0}
            max={5}
            step={1}
            value={[minRating]}
            onValueChange={(v) => setMinRating(v[0])}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {minRating > 0 ? `${minRating}+ stars` : "Any"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={inStock} onCheckedChange={(v) => setInStock(!!v)} /> In stock only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={onSale} onCheckedChange={(v) => setOnSale(!!v)} /> On sale
        </label>
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
          placeholder="Search products, vendors, categories..."
          className="h-12 rounded-full pl-11 pr-4"
        />
      </form>

      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {products.isLoading
            ? "Searching..."
            : `${products.data?.length ?? 0} results${params.q ? ` for "${params.q}"` : ""}`}
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
              <SelectItem value="rating">Top rated</SelectItem>
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

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{Filters}</div>
        </aside>
        <div>
          {(products.data?.length ?? 0) === 0 && !products.isLoading ? (
            <EmptyState
              title="No products found"
              description="Try a different search term or clear your filters."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {(products.data ?? []).map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
