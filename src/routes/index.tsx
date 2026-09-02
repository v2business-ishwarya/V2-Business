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
  DollarSign,
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
    <div className="relative overflow-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/20 via-emerald-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-[600px] right-[-200px] -z-10 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Headline & Interactive Search */}
          <motion.div
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Pulsing Pill Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              India's Next-Gen Multi-Vendor Marketplace
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15]">
              Shop Direct from{" "}
              <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-400 bg-clip-text text-transparent">
                Verified Creators & Stores.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              Discover unique products from independent vendors across India. Enjoy unified multi-vendor carts, direct vendor shipping, and transparent pricing.
            </p>

            {/* Interactive Hero Search Form */}
            <motion.form
              onSubmit={handleSearchSubmit}
              className="relative mx-auto max-w-lg lg:mx-0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <div className="relative flex items-center rounded-full border-2 border-primary/20 bg-card p-1.5 shadow-lg transition-all focus-within:border-primary focus-within:shadow-primary/20">
                <Search className="ml-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search products, brands, stores..."
                  className="border-0 bg-transparent px-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                />
                <Button type="submit" className="rounded-full px-6 font-semibold shadow-md">
                  Search
                </Button>
              </div>

              {/* Suggested Quick Tags */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground lg:justify-start">
                <span className="font-medium">Trending:</span>
                {["Handmade Decor", "Wireless Audio", "Organic Tea", "Designer Watches"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => navigate({ to: "/search", search: { q: tag } })}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.form>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 lg:justify-start">
              <Link to="/search">
                <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 font-semibold px-7">
                  Explore Products <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/vendor">
                <Button size="lg" variant="outline" className="rounded-full border-2 px-7 font-semibold">
                  <Store className="mr-2 h-4 w-4" /> Open Your Store
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Animated Interactive 3D Mockup Cards */}
          <motion.div
            className="lg:col-span-5 relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            {/* Central Glow Card */}
            <div className="relative w-full max-w-md rounded-3xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur-xl">
              {/* Top Banner inside visual */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">V2 Marketplace Hub</h3>
                    <p className="text-xs text-muted-foreground">Live Seller Activity</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px]">
                  ● Live Sync
                </Badge>
              </div>

              {/* Sample Product Spotlight */}
              <div className="mt-4 rounded-2xl bg-muted/50 p-3 flex gap-3 items-center">
                <div className="h-16 w-16 rounded-xl bg-primary/10 grid place-items-center shrink-0">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Trending Item</p>
                  <p className="font-bold text-sm truncate">Handcrafted Wooden Craft</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-sm">{formatMoney(1499)}</span>
                    <span className="text-xs line-through text-muted-foreground">{formatMoney(1999)}</span>
                  </div>
                </div>
              </div>

              {/* Floating Notification 1: Order Payout */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-md"
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-600">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-semibold">Instant 90% Net Settlement</p>
                  <p className="text-muted-foreground">₹1,349 credited to Seller Bank</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </motion.div>

              {/* Floating Notification 2: Express Shipping */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
                className="mt-2.5 flex items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-md"
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/20 text-blue-600">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-semibold">Delhivery Automated Dispatch</p>
                  <p className="text-muted-foreground">Tracking ID: DEL98472910</p>
                </div>
                <span className="text-[10px] font-bold text-blue-600">On Time</span>
              </motion.div>
            </div>

            {/* Floating Top-Right Mini Badge */}
            <motion.div
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -top-6 -right-4 rounded-2xl border border-primary/20 bg-background/90 p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-2 text-xs font-semibold"
            >
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>100% Buyer Protected</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* LIVE STATS & TRUST STRIP */}
      <section className="border-y border-border/70 bg-card/50 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { label: "Verified Sellers", val: "100+", icon: Store, color: "text-primary" },
              { label: "Curated Products", val: "10,000+", icon: Package, color: "text-emerald-500" },
              { label: "Transparent Commission", val: "10% Flat", icon: DollarSign, color: "text-amber-500" },
              { label: "Direct Net Settlements", val: "90% Payouts", icon: Zap, color: "text-blue-500" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3.5"
              >
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight">{stat.val}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE CATEGORY EXPLORER */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
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
                whileHover={{ y: -6, scale: 1.02 }}
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
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <Badge variant="outline" className="mb-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
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
            <motion.div
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              {products.map((p: any) => (
                <motion.div
                  key={p.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* INTERACTIVE DUAL-EXPERIENCE TABS (BUYERS VS SELLERS) */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
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
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                activeTab === "buyers"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Shoppers
            </button>
            <button
              onClick={() => setActiveTab("sellers")}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 md:grid-cols-3"
            >
              {[
                {
                  title: "Unified Multi-Vendor Cart",
                  desc: "Add items from multiple independent stores in a single cart and check out in one click with UPI, Cards, or NetBanking.",
                  icon: ShoppingBag,
                },
                {
                  title: "Transparent Individual Invoices",
                  desc: "Get crystal-clear itemized bills generated per vendor for hassle-free warranty, returns, and GST accounting.",
                  icon: Layers,
                },
                {
                  title: "Direct Verified Deliveries",
                  desc: "Orders are dispatched directly by the sellers with live courier tracking updates via Delhivery and Shiprocket.",
                  icon: Truck,
                },
              ].map((item, i) => (
                <Card key={i} className="p-6 transition-all hover:border-primary hover:shadow-lg">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </Card>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="sellers"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 md:grid-cols-3"
            >
              {[
                {
                  title: "Zero Upfront Listing Fees",
                  desc: "List unlimited products and build your custom storefront without paying any setup fee. We only succeed when you make a sale.",
                  icon: Store,
                },
                {
                  title: "Direct 90% Net Bank Settlements",
                  desc: "Receive 90% of every sale directly to your bank account with only a flat 10% platform fee deducted automatically.",
                  icon: DollarSign,
                },
                {
                  title: "Built-in Logistics & Shipping",
                  desc: "Choose between your own delivery network or toggle automated courier pick-ups via integrated Delhivery & Shiprocket.",
                  icon: Truck,
                },
              ].map((item, i) => (
                <Card key={i} className="p-6 transition-all hover:border-primary hover:shadow-lg">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* INTERACTIVE VENDOR EARNINGS CALCULATOR */}
      <section className="bg-gradient-to-b from-card to-muted/40 py-20 border-y">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
              Revenue Simulator
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">Calculate Your Seller Earnings</h2>
            <p className="text-sm text-muted-foreground mt-2">
              See how much you take home with our transparent 10% marketplace commission.
            </p>
          </div>

          <Card className="p-8 shadow-xl border-primary/20">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Estimated Monthly Sales</span>
                  <span className="text-2xl font-extrabold text-primary">{formatMoney(vendorRevenue)}</span>
                </div>
                <Slider
                  min={10000}
                  max={1000000}
                  step={5000}
                  value={[vendorRevenue]}
                  onValueChange={(val) => setVendorRevenue(val[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹10,000 / mo</span>
                  <span>₹5,00,000 / mo</span>
                  <span>₹10,00,000 / mo</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t">
                <div className="rounded-2xl bg-muted/70 p-4">
                  <span className="text-xs text-muted-foreground block">Platform Fee (10%)</span>
                  <span className="text-xl font-bold text-muted-foreground">{formatMoney(platformCommission)}</span>
                  <span className="text-[11px] text-muted-foreground block mt-1">Includes payment gateway & platform ops</span>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold block">Your Direct Net Payout (90%)</span>
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatMoney(vendorTakeHome)}</span>
                  <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 block mt-1">Deposited directly to your bank account</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link to="/vendor">
                  <Button size="lg" className="rounded-full px-8 font-semibold shadow-lg shadow-primary/20">
                    Start Selling Today <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS (3-STEP ANIMATED TIMELINE) */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
            Process
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">How V2 Business Works</h2>
          <p className="text-sm text-muted-foreground mt-2">Simple, transparent, and seamless for everyone.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          {[
            {
              step: "01",
              title: "Discover Independent Sellers",
              desc: "Explore thousands of products listed by real store owners with customer reviews and ratings.",
              icon: Search,
            },
            {
              step: "02",
              title: "Unified Secure Checkout",
              desc: "Pay securely with Razorpay or Cashfree. Orders are automatically split by vendor in backend.",
              icon: ShieldCheck,
            },
            {
              step: "03",
              title: "Direct Vendor Dispatch",
              desc: "Sellers pack and ship your orders with express couriers. Receive separate invoices per store.",
              icon: Truck,
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="text-3xl font-extrabold text-primary/30 mb-4">{s.step}</div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground mb-4 shadow-md">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-emerald-600 to-teal-700 px-6 py-14 text-center text-primary-foreground shadow-2xl sm:px-12 sm:py-20"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-black/10 blur-2xl" />

          <h2 className="text-3xl font-extrabold sm:text-5xl">
            Ready to Experience Modern Marketplace Shopping?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90 text-sm sm:text-base">
            Join thousands of shoppers and sellers across India. Open your store or browse verified independent collections today.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/search">
              <Button size="lg" className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 shadow-xl">
                Browse Products
              </Button>
            </Link>
            <Link to="/vendor">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-2 border-white/80 bg-white/10 text-white hover:bg-white/20 font-bold px-8"
              >
                Become a Seller
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
