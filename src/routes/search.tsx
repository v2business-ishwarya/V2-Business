import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
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
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
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
          placeholder="Search products, brands, categories..."
          className="h-12 rounded-full pl-11 pr-4"
        />
      </form>

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
