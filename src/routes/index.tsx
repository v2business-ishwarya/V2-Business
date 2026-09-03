import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Package,
  Store,
  Sparkles,
  Tag,
  ShieldCheck,
  TrendingUp,
  Truck,
  Zap,
  CheckCircle2,
  Search,
  IndianRupee,
  Users,
  ChevronRight,
  Layers,
  ShoppingBag,
  Clock,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/use-session";
import { api } from "@/services/api";
import { formatMoney, slugify } from "@/lib/utils-app";
import * as React from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [heroSearch, setHeroSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"buyers" | "sellers">("buyers");
  const [vendorRevenue, setVendorRevenue] = React.useState<number>(150000);

  // Fetch live categories
  const { data: rawCategories = [] } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => api.getCategories(),
  });

  // Fetch live products
  const { data: rawProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["home-products"],
    queryFn: () => api.getProducts({ limit: 8, isActive: true }),
  });

  const categories: any[] = Array.isArray(rawCategories) ? rawCategories : [];
  const products: any[] = (rawProducts as any)?.data ?? (Array.isArray(rawProducts) ? rawProducts : []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate({ to: "/search", search: { q: heroSearch.trim() } });
    } else {
      navigate({ to: "/search" });
    }
  };

  // Vendor calculations
  const platformCommission = Math.round(vendorRevenue * 0.1);
  const vendorTakeHome = vendorRevenue - platformCommission;

  const defaultCategories = [
    { name: "Electronics & Gadgets", slug: "electronics", icon: Zap, count: "1,200+ items" },
    { name: "Fashion & Apparel", slug: "fashion", icon: ShoppingBag, count: "3,400+ items" },
    { name: "Home & Decor", slug: "home-decor", icon: Store, count: "850+ items" },
    { name: "Beauty & Wellness", slug: "beauty", icon: Sparkles, count: "920+ items" },
    { name: "Artisanal & Crafts", slug: "handmade", icon: Tag, count: "640+ items" },
    { name: "Sports & Fitness", slug: "sports", icon: TrendingUp, count: "510+ items" },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="relative overflow-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground min-h-screen">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/20 via-emerald-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-[600px] right-[-200px] -z-10 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8 lg:pt-16 lg:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Left Column: Headline & Interactive Search */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pulsing Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              India's Next-Gen Multi-Vendor Marketplace
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15] text-foreground">
              Shop Direct from{" "}
              <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Verified Indian Stores.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              Discover thousands of unique products from independent vendors across India. Enjoy unified multi-vendor carts, direct vendor shipping, and transparent INR pricing.
            </p>

            {/* Interactive Hero Search Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative mx-auto max-w-lg lg:mx-0"
            >
              <div className="relative flex items-center rounded-full border-2 border-primary/30 bg-card p-1.5 shadow-lg transition-all focus-within:border-primary focus-within:shadow-primary/20">
                <Search className="ml-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search products, brands, stores..."
                  className="border-0 bg-transparent px-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                />
                <Button type="submit" className="rounded-full px-6 font-bold shadow-md">
                  Search
                </Button>
              </div>

              {/* Suggested Quick Tags */}
              <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground lg:justify-start">
                <span className="font-semibold text-foreground">Trending:</span>
                {["Handmade Decor", "Wireless Audio", "Organic Tea", "Designer Watches"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => navigate({ to: "/search", search: { q: tag } })}
                    className="rounded-full bg-muted border border-border px-3 py-1 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 lg:justify-start">
              <Link to="/search">
                <Button size="lg" className="rounded-full shadow-lg shadow-primary/25 font-bold px-7 h-12">
                  Explore Products <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/vendor">
                <Button size="lg" variant="outline" className="rounded-full border-2 px-7 font-bold h-12">
                  <Store className="mr-2 h-4 w-4" /> Open Your Store
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive 3D Mockup Cards */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Central Card */}
            <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
              {/* Top Banner inside visual */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">V2 Marketplace Hub</h3>
                    <p className="text-xs text-muted-foreground">Live Seller Activity</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/25 text-[11px] font-semibold">
                  ● Live Sync
                </Badge>
              </div>

              {/* Sample Product Spotlight */}
              <div className="mt-4 rounded-2xl bg-muted/60 p-3 flex gap-3 items-center border border-border/50">
                <div className="h-16 w-16 rounded-xl bg-primary/15 grid place-items-center shrink-0">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Trending Item</p>
                  <p className="font-bold text-sm truncate">Handcrafted Wooden Craft</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-sm text-foreground">{formatMoney(1499)}</span>
                    <span className="text-xs line-through text-muted-foreground">{formatMoney(1999)}</span>
                  </div>
                </div>
              </div>

              {/* Floating Notification 1: Order Payout */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-md"
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-600">
                  <IndianRupee className="h-4 w-4" />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold">Instant 90% Net Settlement</p>
                  <p className="text-muted-foreground">₹1,349 credited to Seller Bank</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              </motion.div>

              {/* Floating Notification 2: Express Shipping */}
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
                className="mt-2.5 flex items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-md"
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/20 text-blue-600">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold">Delhivery Automated Dispatch</p>
                  <p className="text-muted-foreground">Tracking: DEL98472910</p>
                </div>
                <span className="text-[10px] font-bold text-blue-600 shrink-0">On Time</span>
              </motion.div>
            </div>

            {/* Floating Mini Badge */}
            <div className="absolute -top-5 -right-3 rounded-2xl border border-primary/20 bg-background/95 p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-2 text-xs font-bold text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>100% Buyer Protected</span>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE STATS & TRUST STRIP */}
      <section className="border-y border-border/70 bg-card/60 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { label: "Verified Sellers", val: "100+", icon: Store, color: "text-primary" },
              { label: "Curated Products", val: "10,000+", icon: Package, color: "text-emerald-500" },
              { label: "Transparent Commission", val: "10% Flat", icon: IndianRupee, color: "text-amber-500" },
              { label: "Direct Net Settlements", val: "90% Payouts", icon: Zap, color: "text-blue-500" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5"
              >
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-foreground">{stat.val}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE CATEGORY EXPLORER */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20 font-semibold">
              Catalogue
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">Explore Categories</h2>
            <p className="text-sm text-muted-foreground mt-1">Browse collections curated across hundreds of vendors</p>
          </div>
          <Link to="/categories" className="text-sm font-semibold text-primary hover:underline inline-flex items-center">
            View all categories <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {displayCategories.slice(0, 6).map((c: any, idx: number) => {
            const IconComp = c.icon || Tag;
            return (
              <motion.div
                key={c.id || c.slug || idx}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug || slugify(c.name) }}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-sm transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <IconComp className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm line-clamp-1">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.count || "Browse Store"}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FEATURED PRODUCTS SHOWCASE */}
      <section className="bg-muted/40 py-16 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <Badge variant="outline" className="mb-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold">
                Live Stock
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Featured Marketplace Products</h2>
              <p className="text-sm text-muted-foreground mt-1">Direct from independent sellers across India</p>
            </div>
            <Link to="/search" className="text-sm font-semibold text-primary hover:underline inline-flex items-center">
              Explore full catalogue <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="Products are loading or being listed"
              description="Be the first vendor to add products or browse categories."
              action={
                <Link to="/vendor">
                  <Button>Open a store</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p: any) => (
                <div key={p.id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* INTERACTIVE DUAL-EXPERIENCE TABS (BUYERS VS SELLERS) */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20 font-semibold">
            Tailored For You
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">Built For Shoppers & Ambitious Sellers</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Switch between modes to see how V2 Business transforms your shopping and selling experience.
          </p>

          {/* Interactive Toggle Switch */}
          <div className="mt-6 inline-flex rounded-full border bg-muted p-1 shadow-inner">
            <button
              onClick={() => setActiveTab("buyers")}
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                activeTab === "buyers"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Shoppers
            </button>
            <button
              onClick={() => setActiveTab("sellers")}
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                activeTab === "sellers"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Store Owners / Vendors
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "buyers" ? (
            <motion.div
              key="buyers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid gap-6 md:grid-cols-3"
            >
              {[
                {
                  title: "One Multi-Store Cart",
                  desc: "Add items from multiple independent vendors into a single cart and checkout once smoothly.",
                  icon: ShoppingBag,
                },
                {
                  title: "Direct Seller Shipping",
                  desc: "Track dispatch from Delhivery or independent courier straight from each seller's warehouse.",
                  icon: Truck,
                },
                {
                  title: "100% Protected Checkout",
                  desc: "Encrypted Razorpay & Cashfree gateway payments with full buyer guarantee and issue resolution.",
                  icon: ShieldCheck,
                },
              ].map((feat, i) => (
                <Card key={i} className="p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
                    <feat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{feat.desc}</p>
                </Card>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="sellers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid gap-6 md:grid-cols-3"
            >
              {[
                {
                  title: "Zero Setup Fees",
                  desc: "Create and brand your store in 2 minutes. List unlimited products with custom inventory rules.",
                  icon: Store,
                },
                {
                  title: "90% Direct Bank Settlements",
                  desc: "Pay only 10% platform commission on completed orders. Retain 90% of your earnings.",
                  icon: IndianRupee,
                },
                {
                  title: "Built-In Automated Logistics",
                  desc: "Connect Delhivery or Shiprocket with 1 click or use your own local delivery fleet.",
                  icon: Truck,
                },
              ].map((feat, i) => (
                <Card key={i} className="p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-4">
                    <feat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{feat.desc}</p>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* LIVE VENDOR EARNINGS CALCULATOR / SIMULATOR */}
      <section className="bg-gradient-to-br from-card via-surface-muted to-muted/50 py-16 border-t border-border/70">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="p-8 sm:p-12 shadow-xl border-2 border-primary/20">
            <div className="text-center max-w-xl mx-auto mb-8">
              <Badge variant="outline" className="mb-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold">
                Transparent Calculator
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Estimate Your Monthly Earnings</h2>
              <p className="text-sm text-muted-foreground mt-1">
                See exactly how much you take home with our transparent 10% platform commission.
              </p>
            </div>

            <div className="space-y-6 max-w-xl mx-auto">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Projected Monthly Sales:</span>
                <span className="text-2xl font-extrabold text-primary">{formatMoney(vendorRevenue)}</span>
              </div>

              <Slider
                value={[vendorRevenue]}
                min={10000}
                max={1000000}
                step={5000}
                onValueChange={(vals) => setVendorRevenue(vals[0])}
                className="my-4"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹10,000</span>
                <span>₹5,00,000</span>
                <span>₹10,00,000</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="rounded-2xl bg-muted/70 p-4 text-center">
                  <p className="text-xs text-muted-foreground font-medium">Platform Fee (10%)</p>
                  <span className="text-xl font-bold text-muted-foreground">{formatMoney(platformCommission)}</span>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">Your Net Payout (90%)</p>
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatMoney(vendorTakeHome)}</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link to="/vendor">
                  <Button size="lg" className="rounded-full px-8 font-bold shadow-lg shadow-primary/25">
                    Start Selling Now — Open Free Store <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* HOW V2 BUSINESS WORKS TIMELINE */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20 font-semibold">
            Simple 3-Step Process
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">How V2 Business Works</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Seamless workflow connecting Indian shoppers directly with independent creators.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          {[
            {
              step: "01",
              title: "Discover Unique Stores",
              desc: "Explore verified creators across electronics, handicrafts, fashion, and home goods.",
              badge: "Explore",
            },
            {
              step: "02",
              title: "Unified Checkout",
              desc: "Pay securely in Indian Rupee (INR) via UPI, Cards, NetBanking with zero hidden charges.",
              badge: "Secure Pay",
            },
            {
              step: "03",
              title: "Direct Doorstep Delivery",
              desc: "Vendors dispatch automated shipments via Delhivery with live SMS and WhatsApp tracking.",
              badge: "Express Track",
            },
          ].map((item, i) => (
            <Card key={i} className="relative p-8 rounded-3xl border border-border shadow-sm hover:border-primary/50 transition-all">
              <span className="text-4xl font-extrabold text-primary/20 absolute top-6 right-6">{item.step}</span>
              <Badge variant="secondary" className="mb-4">{item.badge}</Badge>
              <h3 className="font-bold text-xl mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* HIGH-IMPACT BOTTOM CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary via-emerald-700 to-teal-900 p-10 sm:p-16 text-primary-foreground text-center overflow-hidden shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-black/20 blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to Experience the Future of Indian Commerce?
            </h2>
            <p className="text-primary-foreground/90 text-sm sm:text-base">
              Join thousands of happy customers and 100+ growing store owners today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/search">
                <Button size="lg" className="h-12 rounded-full bg-white text-emerald-800 hover:bg-white/95 font-bold px-8 shadow-xl hover:scale-105 transition-all">
                  Start Shopping Now
                </Button>
              </Link>
              <Link to="/vendor">
                <Button size="lg" className="h-12 rounded-full bg-black/30 border-2 border-white text-white hover:bg-black/50 font-bold px-8 shadow-xl hover:scale-105 transition-all">
                  Open a Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
