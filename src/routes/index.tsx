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
  ChevronLeft,
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

// Normal Standard Quick Bar Categories (Starting with Jewellery, Toys, Clothing)
const QUICK_NAV_CATS = [
  { name: "Jewellery", slug: "jewellery-accessories" },
  { name: "Toys & Kids", slug: "kids-baby" },
  { name: "Clothing", slug: "clothing-fashion" },
  { name: "Electronics", slug: "electronics-home-appliances" },
  { name: "Grocery", slug: "grocery-supermarkets" },
  { name: "Beauty", slug: "beauty-personal-care" },
  { name: "Mobiles", slug: "mobile-telecom" },
  { name: "Home & Furniture", slug: "home-furniture" },
  { name: "Footwear", slug: "footwear" },
  { name: "Restaurants", slug: "restaurants-food" },
];

// Interactive Hero Carousel Slides
const HERO_SLIDES = [
  {
    id: "slide-1",
    tag: "🔥 GRAND MARKETPLACE FESTIVAL",
    title: "Mega Deals Up to 70% Off",
    highlight: "Across 29 Retail Categories",
    subtitle: "Shop top brand electronics, festive jewellery, fashion & groceries directly from verified merchants.",
    ctaText: "Shop All Deals",
    targetLink: "/search",
    bgImage:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=95",
    themeColor: "from-black/90 via-amber-950/60 to-transparent",
    badgeColor: "bg-gradient-to-r from-amber-500 to-yellow-500 text-black",
  },
  {
    id: "slide-2",
    tag: "✨ 100% BIS HALLMARKED",
    title: "Heritage Gold & Certified Diamonds",
    highlight: "Direct Jeweller Rates",
    subtitle: "Exquisite bridal sets, daily wear certified gold, pure silver & solitaires with insured delivery.",
    ctaText: "Explore Jewellery",
    targetLink: "/category/jewellery-accessories",
    bgImage:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=95",
    themeColor: "from-black/90 via-yellow-950/60 to-transparent",
    badgeColor: "bg-yellow-400 text-black",
  },
  {
    id: "slide-3",
    tag: "⚡ NEXT-GEN GADGETS",
    title: "Smartphones, Laptops & Smart Living",
    highlight: "Extra 10% Instant UPI Discount",
    subtitle: "Upgrade your lifestyle with genuine brand warranty, instant doorstep delivery, and best local prices.",
    ctaText: "Explore Electronics",
    targetLink: "/category/electronics-home-appliances",
    bgImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1920&q=95",
    themeColor: "from-black/90 via-blue-950/60 to-transparent",
    badgeColor: "bg-indigo-500 text-white",
  },
  {
    id: "slide-4",
    tag: "👗 NEW SEASON FASHION",
    title: "Pure Silk Sarees & Designer Ethnic",
    highlight: "Wholesale Merchant Prices",
    subtitle: "Handcrafted traditional sarees, festive lehengas, kurtis, and men's ethnic collections.",
    ctaText: "Shop Fashion",
    targetLink: "/category/clothing-fashion",
    bgImage:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=95",
    themeColor: "from-black/90 via-rose-950/60 to-transparent",
    badgeColor: "bg-rose-500 text-white",
  },
];

// Multi-category 3 Hero Banner Cards (Starting with Jewellery, Toys, Clothing)
const HERO_BANNERS = [
  {
    id: "banner-1",
    brandLogo: "JEWELLERY & ORNAMENTS",
    title: "Gold, Silver & Diamonds",
    subtitle: "BIS Hallmarked Jewellery & Certified Silver",
    discountTag: "Up To 50% Off",
    linkText: "Shop Now →",
    targetSlug: "jewellery-accessories",
    bgImage:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=95",
    themeColor: "from-amber-950/90 via-amber-900/50 to-transparent",
    accentBadge: "HALLMARKED",
  },
  {
    id: "banner-2",
    brandLogo: "TOYS & BABY ESSENTIALS",
    title: "Toys, Games & Kids Care",
    subtitle: "Educational Toys, Strollers & Kids Fashion",
    discountTag: "Flat 30% Off",
    linkText: "Shop Now →",
    targetSlug: "kids-baby",
    bgImage:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=95",
    themeColor: "from-purple-950/85 via-indigo-900/40 to-transparent",
    accentBadge: "KIDS SPECIAL",
  },
  {
    id: "banner-3",
    brandLogo: "CLOTHING & APPAREL",
    title: "Clothing, Sarees & Ethnic",
    subtitle: "Designer Silk Sarees, Kurtis & Men's Wear",
    discountTag: "Up To 60% Off",
    linkText: "Shop Now →",
    targetSlug: "clothing-fashion",
    bgImage:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=95",
    themeColor: "from-rose-950/85 via-pink-900/40 to-transparent",
    accentBadge: "NEW ARRIVALS",
  },
];

function Home() {
  const navigate = useNavigate();
  const { user } = useSession();

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto-advance slides every 5 seconds when not hovered
  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  // Mobile Touch swipe support
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

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
      {/* 1. TOP SUB-NAV CATEGORY BAR */}
      <div className="border-b border-border/70 bg-card/75 backdrop-blur-md sticky top-[96px] sm:top-[57px] z-30 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto px-4 py-1.5 text-xs font-semibold scrollbar-none sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {QUICK_NAV_CATS.map((cat) => (
              <Link
                key={cat.slug}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="text-foreground/80 hover:text-primary transition-colors whitespace-nowrap py-0.5 border-b-2 border-transparent hover:border-primary"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-border/60">
            <Link to="/search">
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded-full shadow-2xs hover:opacity-95">
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

      {/* 2. ANNOUNCEMENT TICKER WITH SMOOTH CONTINUOUS SCROLL ANIMATION */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 text-white py-1.5 shadow-sm overflow-hidden whitespace-nowrap select-none">
        <div className="animate-marquee flex items-center text-xs font-extrabold tracking-wider uppercase">
          <div className="flex items-center gap-8 px-4 shrink-0">
            <span>✨ 29 RETAIL CATEGORIES ARE LIVE ON V2 BUSINESS!</span>
            <span className="text-yellow-200/80">✦</span>
            <span>⚡ FREE DELIVERY ON ORDERS ABOVE ₹499</span>
            <span className="text-yellow-200/80">✦</span>
            <span>🛡️ 100% VERIFIED MERCHANTS & DIRECT LOCAL PRICES</span>
            <span className="text-yellow-200/80">✦</span>
            <span>🔥 NEW FESTIVE DISCOUNTS & FLASH DEALS EVERY HOUR</span>
            <span className="text-yellow-200/80">✦</span>
            <span>🚀 FAST HOME DELIVERY ACROSS MULTIPLE CITIES</span>
            <span className="text-yellow-200/80">✦</span>
          </div>
          <div className="flex items-center gap-8 px-4 shrink-0" aria-hidden="true">
            <span>✨ 29 RETAIL CATEGORIES ARE LIVE ON V2 BUSINESS!</span>
            <span className="text-yellow-200/80">✦</span>
            <span>⚡ FREE DELIVERY ON ORDERS ABOVE ₹499</span>
            <span className="text-yellow-200/80">✦</span>
            <span>🛡️ 100% VERIFIED MERCHANTS & DIRECT LOCAL PRICES</span>
            <span className="text-yellow-200/80">✦</span>
            <span>🔥 NEW FESTIVE DISCOUNTS & FLASH DEALS EVERY HOUR</span>
            <span className="text-yellow-200/80">✦</span>
            <span>🚀 FAST HOME DELIVERY ACROSS MULTIPLE CITIES</span>
            <span className="text-yellow-200/80">✦</span>
          </div>
        </div>
      </div>

      {/* 2.5 INTERACTIVE HERO GALLERY SLIDER / CAROUSEL */}
      <section className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <div
          className="relative h-[220px] sm:h-[300px] md:h-[360px] lg:h-[380px] w-full rounded-2xl overflow-hidden shadow-lg border border-border/80 group select-none bg-neutral-900"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Slide items */}
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {/* Background Image */}
                <img
                  src={slide.bgImage}
                  alt={slide.title}
                  className="h-full w-full object-cover object-center transform scale-100 transition-transform duration-7000 ease-out group-hover:scale-105"
                />

                {/* Dark & Vibrant Gradient Overlay for text contrast */}
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.themeColor}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-16 max-w-2xl text-white">
                  {/* Badge */}
                  <div className="mb-1.5 sm:mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase shadow-md ${slide.badgeColor}`}
                    >
                      {slide.tag}
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-1 sm:mb-2 drop-shadow-sm">
                    {slide.title}
                    <span className="block text-amber-300 font-extrabold mt-0.5">
                      {slide.highlight}
                    </span>
                  </h2>

                  {/* Subtitle */}
                  <p className="hidden sm:block text-xs sm:text-sm text-gray-200/90 font-medium mb-3 sm:mb-4 line-clamp-2 max-w-lg">
                    {slide.subtitle}
                  </p>

                  {/* CTA Button */}
                  <div className="mt-1">
                    <Link to={slide.targetLink}>
                      <Button
                        size="sm"
                        className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold text-xs sm:text-sm px-4 sm:px-6 h-8 sm:h-9 shadow-lg gap-1.5 hover:scale-105 transition-transform"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom Slide Indicators */}
          <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10 shadow-xs">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                type="button"
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide
                    ? "w-4 sm:w-5 bg-amber-400"
                    : "w-1.5 bg-white/50 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. HERO SHOWCASE: MULTI-CATEGORY HIGHLIGHTS (Decreased Compact Size) */}
      <section className="mx-auto max-w-7xl px-4 pt-4 pb-5 sm:px-6 lg:px-8">
        {/* Section Header Title */}
        <div className="flex items-center justify-center gap-2 mb-4 text-center">
          <span className="h-px w-10 bg-amber-500/40" />
          <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
              EXPLORE THE MARKETPLACE
            </span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </h2>
          <span className="h-px w-10 bg-amber-500/40" />
        </div>

        {/* 3 Compact Multi-Category Banner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HERO_BANNERS.map((banner) => (
            <div
              key={banner.id}
              onClick={() =>
                navigate({ to: "/category/$slug", params: { slug: banner.targetSlug } })
              }
              className="group relative h-[240px] sm:h-[280px] rounded-2xl overflow-hidden shadow-md border border-border/80 bg-muted cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
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
              <div className="absolute top-3 left-3 z-10">
                <span className="rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-500/40 shadow-xs flex items-center gap-1">
                  <Flame className="h-3 w-3 text-amber-400" />
                  {banner.brandLogo}
                </span>
              </div>

              {/* Top Right Tag */}
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-white text-black font-black text-[9px] uppercase tracking-wider shadow-xs px-2 py-0.5">
                  {banner.accentBadge}
                </Badge>
              </div>

              {/* Bottom Details & Shop Now Button */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10 space-y-1.5">
                <div>
                  <span className="inline-block rounded-md bg-amber-500 text-black px-2 py-0.5 text-[11px] font-black uppercase tracking-wider shadow-xs">
                    {banner.discountTag}
                  </span>
                  <h3 className="mt-1 text-base sm:text-lg font-black text-white leading-tight drop-shadow-sm">
                    {banner.title}
                  </h3>
                  <p className="text-[11px] text-white/90 font-medium drop-shadow-xs">
                    {banner.subtitle}
                  </p>
                </div>

                <Button
                  size="sm"
                  className="h-7 rounded-full bg-white hover:bg-amber-400 text-black font-extrabold text-[11px] px-3.5 shadow-sm group-hover:translate-x-1 transition-all flex items-center gap-1"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="h-3 w-3" />
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

          {/* Flash Deal Cards Grid: 3x3 (9 items) on Mobile, 8 items (4x2) on PC */}
          <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {[
              {
                title: "Wireless ANC Bluetooth Earbuds",
                store: "Sri Sai Tech",
                price: 1299,
                originalPrice: 2499,
                discount: "48% OFF",
                image:
                  "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=95",
                slug: "electronics-home-appliances",
              },
              {
                title: "Pure Kanchipuram Bridal Silk Saree",
                store: "Anand Silks",
                price: 4299,
                originalPrice: 8500,
                discount: "49% OFF",
                image:
                  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=95",
                slug: "clothing-fashion",
              },
              {
                title: "Cold-Pressed Wood Sesame Oil (1L)",
                store: "Godavari Organics",
                price: 349,
                originalPrice: 499,
                discount: "30% OFF",
                image:
                  "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=95",
                slug: "grocery-supermarkets",
              },
              {
                title: "Smart Stainless Vacuum Flask (1L)",
                store: "Rajahmundry Home",
                price: 599,
                originalPrice: 1199,
                discount: "50% OFF",
                image:
                  "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=95",
                slug: "home-furniture",
              },
              {
                title: "Organic Sandalwood Face Ubtan",
                store: "Veda Naturals",
                price: 249,
                originalPrice: 499,
                discount: "50% OFF",
                image:
                  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=95",
                slug: "beauty-personal-care",
              },
              {
                title: "20000mAh Fast Charging Power Bank",
                store: "TechZone Mobile",
                price: 899,
                originalPrice: 1799,
                discount: "50% OFF",
                image:
                  "https://images.unsplash.com/photo-1609592426868-80f4a7c06a3e?auto=format&fit=crop&w=800&q=95",
                slug: "mobile-telecom",
              },
              {
                title: "Handmade Leather Comfort Chappal",
                store: "Godavari Footwear",
                price: 499,
                originalPrice: 999,
                discount: "50% OFF",
                image:
                  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=95",
                slug: "footwear",
              },
              {
                title: "22K Gold Plated Temple Choker Set",
                store: "Sri Godavari Gold",
                price: 1499,
                originalPrice: 2999,
                discount: "50% OFF",
                image:
                  "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=95",
                slug: "jewellery-accessories",
              },
              {
                title: "Dry Fruit & Roasted Nuts Combo (500g)",
                store: "Royal Dry Fruits",
                price: 399,
                originalPrice: 699,
                discount: "42% OFF",
                image:
                  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=95",
                slug: "grocery-supermarkets",
                isMobileOnly: true,
              },
            ].map((deal, idx) => (
              <Link
                key={idx}
                to="/category/$slug"
                params={{ slug: deal.slug }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-card p-2 sm:p-3 shadow-2xs hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 ${
                  (deal as any).isMobileOnly ? "block sm:hidden" : ""
                }`}
              >
                <div className="relative aspect-square sm:aspect-4/3 w-full overflow-hidden rounded-lg sm:rounded-xl bg-muted">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-600 text-white font-black text-[8px] sm:text-[9px] uppercase px-1 py-0.2 sm:px-1.5 sm:py-0.5">
                    {deal.discount}
                  </Badge>
                </div>
                <div className="pt-1.5 sm:pt-2.5 space-y-0.5 sm:space-y-1">
                  <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate">
                    {deal.store}
                  </p>
                  <h3 className="text-[10px] sm:text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {deal.title}
                  </h3>
                  <div className="flex items-baseline gap-1 sm:gap-2 pt-0.5 sm:pt-1">
                    <span className="text-xs sm:text-sm font-black text-foreground">₹{deal.price}</span>
                    <span className="text-[9px] sm:text-[11px] text-muted-foreground line-through">₹{deal.originalPrice}</span>
                  </div>
                </div>
                <div className="mt-1.5 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-border/60 flex items-center justify-between text-[9px] sm:text-[11px] font-bold text-primary">
                  <span>Claim</span>
                  <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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

      {/* 5. COMPACT CATEGORY SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-xl font-black text-foreground">
              Shop by Category
            </h2>
            <p className="text-xs text-muted-foreground">
              Explore 29 verified departments across Rajahmundry
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            All (29) <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Compact Normal Category Grid (Starting with Jewellery, Toys, Clothing) */}
        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-3">
          {[
            {
              name: "Jewellery",
              slug: "jewellery-accessories",
              imageUrl:
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Toys & Kids",
              slug: "kids-baby",
              imageUrl:
                "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Clothing",
              slug: "clothing-fashion",
              imageUrl:
                "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Electronics",
              slug: "electronics-home-appliances",
              imageUrl:
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Grocery",
              slug: "grocery-supermarkets",
              imageUrl:
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Beauty",
              slug: "beauty-personal-care",
              imageUrl:
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Mobiles",
              slug: "mobile-telecom",
              imageUrl:
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Home & Furniture",
              slug: "home-furniture",
              imageUrl:
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Footwear",
              slug: "footwear",
              imageUrl:
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Restaurants",
              slug: "restaurants-food",
              imageUrl:
                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
            },
          ].map((cat) => (
            <Link
              key={cat.slug}
              to="/category/$slug"
              params={{ slug: cat.slug }}
              className="group flex flex-col items-center p-1 sm:p-1.5 transition-all"
            >
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-2xl overflow-hidden bg-muted border border-border/80 group-hover:border-amber-500 group-hover:shadow-md transition-all group-hover:scale-105">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="mt-1.5 block text-[10px] sm:text-xs font-bold text-center text-foreground group-hover:text-primary transition-colors line-clamp-1 max-w-[70px] sm:max-w-none">
                {cat.name}
              </span>
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

        {/* Boutique Edit Grid: 3x3 (9 items) on Mobile, 8 items (4x2) on PC */}
        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-5">
          {[
            {
              title: "Bridal & Heritage Silks",
              desc: "Uppada, Gadwal & Kanchipuram weaves",
              img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=95",
              tag: "HANDLOOM",
              slug: "clothing-fashion",
            },
            {
              title: "Smart Tech & Mobiles",
              desc: "5G smartphones, TVs & audio systems",
              img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=95",
              tag: "TECH HUB",
              slug: "electronics-home-appliances",
            },
            {
              title: "Ayurveda & Perfumes",
              desc: "Pure sandalwood & natural beauty care",
              img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=95",
              tag: "ORGANIC",
              slug: "beauty-personal-care",
            },
            {
              title: "Godavari Gourmet Foods",
              desc: "Wood pressed oils, spices & sweets",
              img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=95",
              tag: "GOURMET",
              slug: "grocery-supermarkets",
            },
            {
              title: "Temple & Fine Jewellery",
              desc: "Hallmark gold & certified silver deities",
              img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=95",
              tag: "JEWELLERY",
              slug: "jewellery-accessories",
            },
            {
              title: "Artisanal Brass Craft",
              desc: "Royal peacock diyas & handcrafted idols",
              img: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1000&q=95",
              tag: "HANDMADE",
              slug: "home-furniture",
            },
            {
              title: "Ethnic Footwear & Mojris",
              desc: "Pure leather handcrafted comfort footwear",
              img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=95",
              tag: "FOOTWEAR",
              slug: "footwear",
            },
            {
              title: "Godavari Coastal Treats",
              desc: "Famous cashews, pickles & local snacks",
              img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=95",
              tag: "SNACKS",
              slug: "restaurants-food",
            },
            {
              title: "Designer Men's Ethnic",
              desc: "Silk dhotis, festive kurtas & blazers",
              img: "https://images.unsplash.com/photo-1603252109303-2751441ec157?auto=format&fit=crop&w=1000&q=95",
              tag: "ETHNIC",
              slug: "clothing-fashion",
              isMobileOnly: true,
            },
          ].map((edit, idx) => (
            <Link
              key={idx}
              to="/category/$slug"
              params={{ slug: edit.slug }}
              className={`group relative h-44 sm:h-80 rounded-2xl sm:rounded-3xl overflow-hidden border border-border bg-card shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                (edit as any).isMobileOnly ? "block sm:hidden" : ""
              }`}
            >
              <img
                src={edit.img}
                alt={edit.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5">
                <Badge className="bg-amber-500 text-black font-black text-[7px] sm:text-[9px] uppercase tracking-wider px-1 py-0.2 sm:px-2 sm:py-0.5">
                  {edit.tag}
                </Badge>
              </div>
              <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 text-white space-y-0.5 sm:space-y-1">
                <h3 className="text-[11px] sm:text-base font-extrabold leading-tight line-clamp-1 sm:line-clamp-2">{edit.title}</h3>
                <p className="text-[8px] sm:text-xs text-white/80 line-clamp-1 sm:line-clamp-2">{edit.desc}</p>
                <div className="pt-0.5 sm:pt-2 flex items-center text-[9px] sm:text-xs font-bold text-amber-300 gap-0.5 sm:gap-1">
                  <span>Explore</span>
                  <ChevronRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
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
