import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Sparkles, Layers, ChevronRight } from "lucide-react";
import { slugify } from "@/lib/utils-app";
import { MARKETPLACE_CATEGORIES, MarketplaceCategory } from "@/data/categories";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Browse 30+ Categories — V2 Business" },
      {
        name: "description",
        content: "Explore 30 verified marketplace categories across retail, fashion, electronics, grocery, and professional services.",
      },
    ],
  }),
  component: CategoriesList,
});

function CategoriesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "essentials" | "fashion" | "tech" | "services">("all");

  const { data: rawCats = [] } = useQuery({
    queryKey: ["all-cats-public"],
    queryFn: () => api.getCategories(),
  });

  // Master 30 marketplace categories
  const allCategories: MarketplaceCategory[] = useMemo(() => {
    return MARKETPLACE_CATEGORIES;
  }, []);

  const filteredCategories = useMemo(() => {
    let result = allCategories;

    // Filter tab logic
    if (selectedFilter === "essentials") {
      result = result.filter((c) =>
        ["grocery-supermarkets", "pharmacy-healthcare", "restaurants-food", "agriculture-farming", "local-home-services"].includes(c.slug)
      );
    } else if (selectedFilter === "fashion") {
      result = result.filter((c) =>
        ["clothing-fashion", "jewellery-accessories", "footwear", "beauty-personal-care", "optical-eyewear", "wedding-events"].includes(c.slug)
      );
    } else if (selectedFilter === "tech") {
      result = result.filter((c) =>
        ["electronics-home-appliances", "mobile-telecom", "home-furniture", "hardware-construction", "automobile", "repair-maintenance"].includes(c.slug)
      );
    } else if (selectedFilter === "services") {
      result = result.filter((c) =>
        ["professional-services", "printing-business-services", "education-coaching", "real-estate-property", "travel-transport", "entertainment-recreation", "pet-shops-animal-care", "books-stationery", "sports-fitness", "flowers-gifts", "religious-pooja", "kids-baby", "other-specialty-shops"].includes(c.slug)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.popularTags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allCategories, searchQuery, selectedFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER HERO */}
      <div className="relative border-b border-border/80 bg-gradient-to-b from-primary/10 via-background to-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-3 bg-primary/15 text-primary border-primary/30 font-bold px-3 py-1">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> 30 Specialized Categories
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Explore All Marketplace Categories
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground">
            From daily groceries and luxury fashion to electronics, agriculture, and specialized local business services.
          </p>

          {/* SEARCH BAR */}
          <div className="relative mx-auto mt-8 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category, product type or tags (e.g. Jewellery, Organic Veggies, Furniture)..."
              className="h-12 rounded-2xl border-2 pl-12 pr-4 text-sm shadow-sm transition-all focus:border-primary"
            />
          </div>

          {/* FILTER PILLS */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { id: "all", label: `All (${allCategories.length})` },
              { id: "essentials", label: "Groceries & Essentials" },
              { id: "fashion", label: "Fashion & Beauty" },
              { id: "tech", label: "Electronics & Hardware" },
              { id: "services", label: "Services & Specialty" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={selectedFilter === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`rounded-full text-xs font-bold transition-all ${
                  selectedFilter === tab.id
                    ? "shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORY GRID CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {filteredCategories.length === 0 ? (
          <EmptyState
            title="No matching categories found"
            description="Try searching with a different keyword or reset the category filter tab."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((c) => (
              <Link
                key={c.id || c.slug}
                to="/category/$slug"
                params={{ slug: c.slug || slugify(c.name) }}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Visual Category Photo Banner */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80";
                    }}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Top Item Count Pill */}
                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/20 shadow-sm">
                      {c.itemCount}
                    </span>
                  </div>

                  {/* Title Over Photo */}
                  <div className="absolute bottom-3 left-4 right-4 text-left">
                    <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight drop-shadow group-hover:text-emerald-300 transition-colors">
                      {c.name}
                    </h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {c.description}
                  </p>

                  {/* Popular Tags */}
                  {c.popularTags && c.popularTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.popularTags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Link Footer */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary group-hover:underline">
                    <span>Browse Products</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

