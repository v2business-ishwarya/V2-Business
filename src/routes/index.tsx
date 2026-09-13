import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Package,
  Store,
  Sparkles,
  ShieldCheck,
  Truck,
  IndianRupee,
  ChevronRight,
  Star,
  Flame,
  CreditCard,
  Clock,
  Percent,
  Crown,
  Tag,
  Quote,
  CheckCircle2,
  Gift,
  ShoppingBag,
} from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { api } from "@/services/api";
import { MARKETPLACE_CATEGORIES } from "@/data/categories";
import { toast } from "sonner";
import * as React from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

// Curated Top Quick Bar Categories across 29 retail sectors
const QUICK_NAV_CATS = [
  { name: "Electronics & Gadgets", slug: "electronics-home-appliances" },
  { name: "Clothing & Fashion", slug: "clothing-fashion" },
  { name: "Grocery & Mart", slug: "grocery-supermarkets" },
  { name: "Beauty & Fragrance", slug: "beauty-personal-care" },
  { name: "Mobile & Telecom", slug: "mobile-telecom" },
  { name: "Home & Furniture", slug: "home-furniture" },
  { name: "Footwear", slug: "footwear" },
  { name: "Jewellery & Accessories", slug: "jewellery-accessories" },
  { name: "Restaurants & Food", slug: "restaurants-food" },
  { name: "Health & Pharmacy", slug: "pharmacy-healthcare" },
];

// Multi-category 3 Hero Banner Cards
const HERO_BANNERS = [
  {
    id: "banner-1",
    brandLogo: "SMART TECH & MOBILES",
    title: "Next-Gen Electronics & Audio",
    subtitle: "Smartphones, Earbuds, Laptops & Home Tech",
    discountTag: "Up To 40% Off",
    linkText: "Shop Now →",
    targetSlug: "electronics-home-appliances",
    bgImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=95",
    themeColor: "from-blue-950/85 via-slate-900/40 to-transparent",
    accentBadge: "TOP TECH DEALS",
  },
  {
    id: "banner-2",
    brandLogo: "TRENDING FASHION & APPAREL",
    title: "Designer Sarees, Kurtis & Men's Wear",
    subtitle: "Authentic Handloom Silks & Festive Collections",
    discountTag: "Up To 60% Off",
    linkText: "Shop Now →",
    targetSlug: "clothing-fashion",
    bgImage:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=95",
    themeColor: "from-amber-950/90 via-amber-900/50 to-transparent",
    accentBadge: "NEW ARRIVALS",
  },
  {
    id: "banner-3",
    brandLogo: "SUPERMARKET & ORGANICS",
    title: "Daily Groceries & Beauty Care",
    subtitle: "Farm Fresh Organics, Spices & Premium Cosmetics",
    discountTag: "Flat 20% Off",
    linkText: "Shop Now →",
    targetSlug: "grocery-supermarkets",
    bgImage:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=95",
    themeColor: "from-emerald-950/85 via-emerald-900/40 to-transparent",
    accentBadge: "FRESH ESSENTIALS",
  },
];

function Home() {
  const navigate = useNavigate();
  const { user } = useSession();

  // Live countdown timer for Flash Drops
  const [timeLeft, setTimeLeft] = React.useState({
    hours: 7,
    minutes: 38,
    seconds: 44,
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live products
  const { data: rawProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["home-products"],
    queryFn: () => api.getProducts({ limit: 12, isActive: true }),
  });

  const products: any[] =
    (rawProducts as any)?.data ?? (Array.isArray(rawProducts) ? rawProducts : []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* 1. TOP SUB-NAV CATEGORY BAR (Nykaa Style) */}
      <div className="border-b border-border/70 bg-card/75 backdrop-blur-md sticky top-[96px] sm:top-[57px] z-30 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto px-4 py-2 text-xs font-semibold scrollbar-none sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {QUICK_NAV_CATS.map((cat) => (
              <Link
                key={cat.slug}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="text-foreground/80 hover:text-primary transition-colors whitespace-nowrap py-1 border-b-2 border-transparent hover:border-primary"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-border/60">
            <Link to="/search">
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs hover:opacity-95">
                🔥 OFFERS
              </Badge>
            </Link>
            <Link
              to="/categories"
              className="text-primary font-bold hover:underline whitespace-nowrap text-xs flex items-center gap-0.5"
            >
              All (29) <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. NYKAA STYLE ANNOUNCEMENT TICKER */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 text-white py-2 px-4 shadow-sm overflow-hidden">
        <div className="mx-auto max-w-7xl flex items-center justify-center text-center text-xs sm:text-sm font-extrabold tracking-wider uppercase gap-3">
          <span>✨ 29 RETAIL CATEGORIES ACROSS RAJAHMUNDRY ARE LIVE ON V2 BUSINESS!</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">FREE LOCAL DELIVERY ON ORDERS ABOVE ₹499</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">100% VERIFIED LOCAL MERCHANTS ✨</span>
        </div>
      </div>

      {/* 3. HERO SHOWCASE: MULTI-CATEGORY HIGHLIGHTS */}
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6 lg:px-8">
        {/* Section Header Title */}
        <div className="flex items-center justify-center gap-3 mb-6 text-center">
          <span className="h-px w-12 bg-amber-500/40" />
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
              EXPLORE THE MARKETPLACE
            </span>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </h2>
          <span className="h-px w-12 bg-amber-500/40" />
        </div>

        {/* 3 Large Multi-Category Banner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {HERO_BANNERS.map((banner) => (
            <div
              key={banner.id}
              onClick={() =>
                navigate({ to: "/category/$slug", params: { slug: banner.targetSlug } })
              }
              className="group relative h-[380px] sm:h-[420px] rounded-3xl overflow-hidden shadow-lg border border-border/80 bg-muted cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
            >
              {/* Background Cover Image */}
              <img
                src={banner.bgImage}
                alt={banner.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Scrim */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${banner.themeColor} opacity-90 transition-opacity`}
              />

              {/* Brand Watermark / Badge Top Left */}
              <div className="absolute top-4 left-4 z-10">
                <span className="rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-amber-300 border border-amber-500/40 shadow-md flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  {banner.brandLogo}
                </span>
              </div>

              {/* Top Right Tag */}
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-white text-black font-black text-[10px] uppercase tracking-wider shadow-sm">
                  {banner.accentBadge}
                </Badge>
              </div>

              {/* Bottom Details & Shop Now Button */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10 space-y-2.5">
                <div>
                  <span className="inline-block rounded-lg bg-amber-500 text-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider shadow-sm">
                    {banner.discountTag}
                  </span>
                  <h3 className="mt-1 text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-white/90 font-medium drop-shadow-xs">
                    {banner.subtitle}
                  </p>
                </div>

                <Button
                  size="sm"
                  className="rounded-full bg-white hover:bg-amber-400 text-black font-extrabold text-xs px-5 shadow-md group-hover:translate-x-1 transition-all flex items-center gap-1.5"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BANK & INSTANT OFFERS TICKER STRIP */}
      <section className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-black font-black text-lg shadow-md shrink-0">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground flex items-center gap-2">
                <span>EXTRA 10% OFF ON UPI & ALL ONLINE PAYMENTS</span>
                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold">
                  CODE: V2B10
                </Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                Valid across all 29 marketplace categories on orders above ₹499 in Rajahmundry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/search">
              <Button size="sm" className="rounded-full font-bold text-xs shadow-xs px-4">
                Explore All Deals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. ⚡ FLASH DROPS & DEALS OF THE DAY (With Live Countdown) */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-card to-amber-900/10 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-600 text-white font-black text-[10px] tracking-wider uppercase animate-pulse">
                  ⚡ TODAY'S DEALS
                </Badge>
                <h2 className="text-lg sm:text-2xl font-black text-foreground">
                  Marketplace Flash Drops
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Special daily discounted prices from verified Rajahmundry merchants
              </p>
            </div>

            {/* Live Countdown Timer Clock */}
            <div className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-2xl border border-amber-500/40 shadow-inner">
              <Clock className="h-4 w-4 text-amber-400 animate-spin" />
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">Ends in:</span>
              <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-black text-amber-400">
                <span className="bg-black/50 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {String(timeLeft.hours).padStart(2, "0")}h
                </span>
                <span>:</span>
                <span className="bg-black/50 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {String(timeLeft.minutes).padStart(2, "0")}m
                </span>
                <span>:</span>
                <span className="bg-black/50 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {String(timeLeft.seconds).padStart(2, "0")}s
                </span>
              </div>
            </div>
          </div>

          {/* Flash Deal Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                title: "Wireless ANC Bluetooth Earbuds",
                store: "Sri Sai Tech & Mobiles",
                price: 1299,
                originalPrice: 2499,
                discount: "48% OFF",
                image:
                  "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=95",
                slug: "electronics-home-appliances",
              },
              {
                title: "Pure Kanchipuram Bridal Silk Saree",
                store: "Anand Silk Emporium",
                price: 4299,
                originalPrice: 8500,
                discount: "49% OFF",
                image:
                  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=95",
                slug: "clothing-fashion",
              },
              {
                title: "Cold-Pressed Wood Churned Sesame Oil (1L)",
                store: "Godavari Fresh Organics",
                price: 349,
                originalPrice: 499,
                discount: "30% OFF",
                image:
                  "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=95",
                slug: "grocery-supermarkets",
              },
              {
                title: "Smart Stainless Steel Vacuum Flask (1L)",
                store: "Rajahmundry Home Needs",
                price: 599,
                originalPrice: 1199,
                discount: "50% OFF",
                image:
                  "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=95",
                slug: "home-furniture",
              },
            ].map((deal, idx) => (
              <Link
                key={idx}
                to="/category/$slug"
                params={{ slug: deal.slug }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-3 shadow-xs hover:border-amber-500/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-muted">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge className="absolute top-2 left-2 bg-red-600 text-white font-black text-[9px] uppercase px-1.5 py-0.5">
                    {deal.discount}
                  </Badge>
                </div>
                <div className="pt-2.5 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {deal.store}
                  </p>
                  <h3 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {deal.title}
                  </h3>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-sm font-black text-foreground">₹{deal.price}</span>
                    <span className="text-[11px] text-muted-foreground line-through">₹{deal.originalPrice}</span>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-bold text-primary">
                  <span>Claim Deal</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 🛍️ BUDGET CORNERS (Shop by Price) */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-foreground flex items-center gap-2">
              <Tag className="h-5 w-5 text-amber-500" />
              Budget Corners
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Explore pocket-friendly collections tailored for every price range
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              price: "Under ₹299",
              subtitle: "Snacks, Spices & Daily Groceries",
              gradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
              border: "border-amber-500/30",
              slug: "grocery-supermarkets",
            },
            {
              price: "Under ₹599",
              subtitle: "Beauty, Personal Care & Cosmetics",
              gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
              border: "border-rose-500/30",
              slug: "beauty-personal-care",
            },
            {
              price: "Under ₹999",
              subtitle: "Fashion Kurtis, Footwear & Tech Accessories",
              gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
              border: "border-indigo-500/30",
              slug: "clothing-fashion",
            },
            {
              price: "Premium Stores",
              subtitle: "Electronics, Handlooms & Fine Boutiques",
              gradient: "from-amber-600/30 via-yellow-500/20 to-transparent",
              border: "border-amber-500/50",
              slug: "electronics-home-appliances",
            },
          ].map((corner, i) => (
            <Link
              key={i}
              to="/category/$slug"
              params={{ slug: corner.slug }}
              className={`group relative overflow-hidden rounded-2xl border ${corner.border} bg-gradient-to-br ${corner.gradient} bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <span className="text-lg sm:text-2xl font-black text-foreground block tracking-tight group-hover:text-primary transition-colors">
                {corner.price}
              </span>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {corner.subtitle}
              </p>
              <div className="mt-4 flex items-center text-xs font-extrabold text-primary gap-1">
                <span>Shop Collection</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. CIRCULAR STORY CATEGORIES (Nykaa Style Category Bubbles) */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-foreground">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Explore 29 verified departments across Rajahmundry
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Luxury Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {MARKETPLACE_CATEGORIES.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              to="/category/$slug"
              params={{ slug: cat.slug }}
              className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-border/70 bg-card p-2.5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="mt-2.5 w-full text-center">
                <span className="block text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  Explore &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. 💎 THE GODAVARI EDIT / CURATED LUXURY BOUTIQUES */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg sm:text-2xl font-black text-foreground">
                The Godavari Edit
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Handpicked heritage boutiques & artisanal treasures of Andhra Pradesh
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1"
          >
            Explore Edit <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: "Bridal & Heritage Silks",
              desc: "Authentic Uppada, Gadwal & Kanchipuram masterweaves",
              img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=95",
              tag: "HANDLOOM AUTHENTIC",
              slug: "clothing-fashion",
            },
            {
              title: "Smart Electronics & Mobiles",
              desc: "Latest 5G smartphones, smart TVs & home audio",
              img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=95",
              tag: "GENUINE WARRANTY",
              slug: "electronics-home-appliances",
            },
            {
              title: "Ayurveda & Luxury Fragrance",
              desc: "Pure sandalwood, natural perfumes & herbal skin wellness",
              img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=95",
              tag: "ORGANIC GLOW",
              slug: "beauty-personal-care",
            },
            {
              title: "Godavari Gourmet Staples",
              desc: "Farm fresh cold pressed oils, organic spices & sweets",
              img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=95",
              tag: "FARM TO KITCHEN",
              slug: "grocery-supermarkets",
            },
          ].map((edit, idx) => (
            <Link
              key={idx}
              to="/category/$slug"
              params={{ slug: edit.slug }}
              className="group relative h-80 rounded-3xl overflow-hidden border border-border bg-card shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <img
                src={edit.img}
                alt={edit.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute top-3.5 left-3.5">
                <Badge className="bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider">
                  {edit.tag}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <h3 className="text-base font-extrabold leading-tight">{edit.title}</h3>
                <p className="text-xs text-white/80 line-clamp-2">{edit.desc}</p>
                <div className="pt-2 flex items-center text-xs font-bold text-amber-300 gap-1">
                  <span>Explore Boutique</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 9. TRENDING BESTSELLERS & PRODUCTS ON V2 BUSINESS */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 text-black font-black text-[10px] tracking-wider uppercase">
                🔥 TOP PICKS
              </Badge>
              <h2 className="text-lg sm:text-2xl font-black text-foreground">
                Trending In Rajahmundry
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Direct from verified storefronts & local distributors
            </p>
          </div>
          <Link
            to="/search"
            className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1"
          >
            Explore Catalogue <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 rounded-3xl bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center bg-card">
            <Sparkles className="mx-auto h-8 w-8 text-amber-500 mb-2" />
            <h3 className="text-base font-bold text-foreground">Products Updating Daily</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Vendors across Rajahmundry are uploading items continuously. Browse categories or search stores.
            </p>
            <div className="mt-4">
              <Link to="/categories">
                <Button size="sm" className="rounded-full text-xs font-bold">
                  Browse All Categories
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 8).map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>



      {/* 11. VERIFIED RAJAHMUNDRY STORES SPOTLIGHT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-card via-card to-amber-500/5 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg sm:text-2xl font-black text-foreground">
                  Verified Local Merchants
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Shop directly from authenticated storefronts in Main Road, Danavaipeta, Morampudi & across Rajahmundry
              </p>
            </div>

            <Link to="/vendors">
              <Button variant="outline" size="sm" className="rounded-full font-bold text-xs border-amber-500/40">
                View All Vendors <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                name: "Sri Sai Tech & Mobiles",
                location: "Main Road & Fort Gate, Rajahmundry",
                category: "Electronics & Gadgets",
                rating: 4.9,
                badge: "Authorized Dealer",
                photo:
                  "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80",
              },
              {
                name: "Anand Silk Saree Emporium",
                location: "Danavaipeta, Rajahmundry",
                category: "Clothing & Fashion",
                rating: 4.8,
                badge: "Handloom Direct",
                photo:
                  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
              },
              {
                name: "Godavari Fresh Organics & Spices",
                location: "Aryapuram, Rajahmundry",
                category: "Grocery & Provisions",
                rating: 5.0,
                badge: "Daily Fresh",
                photo:
                  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
              },
            ].map((v, i) => (
              <div
                key={i}
                onClick={() => navigate({ to: "/vendors" })}
                className="group p-4 rounded-2xl border border-border bg-card shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer flex gap-3.5"
              >
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                  <img src={v.photo} alt={v.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-sm text-foreground truncate">{v.name}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{v.location}</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <Badge variant="secondary" className="text-[9px] font-bold px-1.5 h-4">
                      {v.badge}
                    </Badge>
                    <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {v.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. 💬 WHAT RAJAHMUNDRY IS SAYING (Customer Reviews & Social Proof) */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase px-3 py-1">
            ⭐️ REAL LOCAL BUYERS
          </Badge>
          <h2 className="text-xl sm:text-3xl font-black text-foreground mt-2">
            Loved By Shoppers in Rajahmundry
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            See how V2 Business is helping local families discover authentic stores and get fast home delivery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: "Lakshmi Prasanna",
              location: "Danavaipeta, Rajahmundry",
              review:
                "Ordered a festive Kanchipuram silk saree for my sister's wedding. Delivered within 4 hours directly from Anand Silks. Exceptional quality!",
              rating: 5,
              tag: "Verified Saree Buyer",
            },
            {
              name: "Venkat Rao M.",
              location: "Main Road, Rajahmundry",
              review:
                "Got my new smartphone & wireless earbuds from Sri Sai Tech on V2 Business. Genuine warranty, store walk-in bill & ultra-fast local delivery.",
              rating: 5,
              tag: "Verified Tech Buyer",
            },
            {
              name: "Pooja Reddy",
              location: "Aryapuram, Rajahmundry",
              review:
                "The wood-pressed sesame oil, fresh dry fruits and organic spices from Godavari Fresh are unmatched in purity. My weekly grocery hub now!",
              rating: 5,
              tag: "Weekly Grocery Shopper",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(item.rating)].map((_, r) => (
                    <Star key={r} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed">
                  "{item.review}"
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-sm text-foreground">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">{item.location}</p>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold border-amber-500/40 text-amber-700 dark:text-amber-300">
                  {item.tag}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 13. TRUST PILLARS (Why Choose V2 Business) */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 border-t border-border/60 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-2 p-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-foreground">100% Genuine Stores</h4>
            <p className="text-xs text-muted-foreground">Every vendor is verified with physical storefront checks</p>
          </div>

          <div className="space-y-2 p-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Truck className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Fast Local Delivery</h4>
            <p className="text-xs text-muted-foreground">Prompt delivery directly from stores in Rajahmundry</p>
          </div>

          <div className="space-y-2 p-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
              <IndianRupee className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Direct Store Pricing</h4>
            <p className="text-xs text-muted-foreground">Zero middleman markup, real local prices & wholesale deals</p>
          </div>

          <div className="space-y-2 p-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Secure Payments</h4>
            <p className="text-xs text-muted-foreground">Pay safely via UPI, NetBanking, Cards & Cash on Delivery</p>
          </div>
        </div>
      </section>



      {/* 15. VENDOR SELLER BANNER CALL-TO-ACTION */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-black p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left z-10">
            <Badge className="bg-black text-white font-black text-[10px] tracking-wider uppercase">
              FOR MERCHANTS & SELLERS
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Grow Your Store Online with V2 Business
            </h3>
            <p className="text-sm font-medium text-white/90 max-w-xl">
              Register your retail shop or home studio in Rajahmundry. Get your dedicated storefront, zero listing fee, and direct customer orders.
            </p>
          </div>

          <div className="z-10 shrink-0">
            <Link to="/vendor">
              <Button size="lg" className="rounded-full bg-black hover:bg-zinc-900 text-white font-black text-sm px-8 shadow-xl">
                Open Your Store Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
