import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  Store,
  LayoutDashboard,
  LogOut,
  Menu,
  Heart,
  ChevronDown,
  ChevronRight,
  MapPin,
  Sparkles,
  Package,
  ArrowRight,
  X,
  Phone,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logout, storeSession, useSession } from "@/hooks/use-session";
import { api } from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { formatMoney, slugify } from "@/lib/utils-app";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { V2Logo } from "@/components/v2-logo";
import { MARKETPLACE_CATEGORIES } from "@/data/categories";

export function SiteHeader() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [open, setOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [becomeVendorOpen, setBecomeVendorOpen] = useState(false);
  const [becomingVendor, setBecomingVendor] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    storeName: "",
    phone: "",
    city: "Rajahmundry",
    address: "",
    pincode: "533101",
    state: "Andhra Pradesh",
    businessType: "physical_shop" as "physical_shop" | "home_cloud",
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useSession();
  const isAdmin = user?.role === "ADMIN";
  const isVendor = user?.role === "VENDOR";

  // Prefill vendor form from existing user or localStorage when opening
  useEffect(() => {
    if (becomeVendorOpen && user) {
      const existing = localStorage.getItem(`vendor_store_${user.id}`);
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          setVendorForm({
            storeName: parsed.name || user.name || "",
            phone: parsed.phone || "",
            city: parsed.city || "Rajahmundry",
            address: parsed.address || "",
            pincode: parsed.pincode || "533101",
            state: parsed.state || "Andhra Pradesh",
            businessType: parsed.businessType || "physical_shop",
          });
          return;
        } catch {}
      }
      setVendorForm((prev) => ({
        ...prev,
        storeName: prev.storeName || user.name || "",
      }));
    }
  }, [becomeVendorOpen, user]);

  // Live Instant Search query (covering Categories, Locations, Vendors, and Products)
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["live-search-autocomplete", q.trim().toLowerCase()],
    enabled: q.trim().length >= 2,
    queryFn: async () => {
      const term = q.trim().toLowerCase();

      // 1. Matching Categories
      const matchingCats = MARKETPLACE_CATEGORIES.filter((c) =>
        c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term)
      ).slice(0, 3);

      // 2. Matching Locations / Cities
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
      const matchingLocations = KNOWN_LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(term)
      ).slice(0, 3);

      // 3. Products
      let items: any[] = [];
      try {
        const res = await api.getProducts({ search: q.trim(), limit: 8 });
        items = (res as any)?.data ?? (Array.isArray(res) ? res : []);
      } catch {}

      if (items.length === 0 && matchingCats.length > 0) {
        try {
          const res = await api.getProducts({ category: matchingCats[0].name, limit: 6 });
          items = (res as any)?.data ?? (Array.isArray(res) ? res : []);
        } catch {}
      }

      // 4. Stores / Vendors (matching by vendor name or location)
      const storeMap = new Map();
      items.forEach((p: any) => {
        const v = p.vendor || p.vendors;
        if (v && v.id && !storeMap.has(v.id)) {
          storeMap.set(v.id, {
            id: v.id,
            name: v.name,
            slug: v.slug || v.id,
            city: v.city || "Rajahmundry",
          });
        }
      });

      // Also check locally registered store profiles for matching name or location
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("vendor_store_")) {
              const raw = localStorage.getItem(key);
              if (raw) {
                const s = JSON.parse(raw);
                const sName = (s.name || "").toLowerCase();
                const sCity = (s.city || "").toLowerCase();
                const sAddr = (s.address || "").toLowerCase();
                if (sName.includes(term) || sCity.includes(term) || sAddr.includes(term)) {
                  const sId = s.id || key.replace("vendor_store_", "");
                  if (!storeMap.has(sId)) {
                    storeMap.set(sId, {
                      id: sId,
                      name: s.name || "Verified Store",
                      slug: s.slug || sId,
                      city: s.city || "Rajahmundry",
                    });
                  }
                }
              }
            }
          }
        }
      } catch {}

      return {
        categories: matchingCats,
        locations: matchingLocations,
        stores: Array.from(storeMap.values()).slice(0, 3),
        products: items.slice(0, 4),
      };
    },
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: cartCount = 0 } = useQuery({
    queryKey: ["cart-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const cart = await api.getCart();
      return cart.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) ?? 0;
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    setShowDropdown(false);
    navigate({ to: "/search", search: term ? { q: term } : {} });
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await logout();
    navigate({ to: "/auth", replace: true });
  };

  const handleBecomeVendor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      toast.error("Please sign in to register as a vendor.");
      navigate({ to: "/auth" });
      return;
    }

    const cleanedPhone = vendorForm.phone.replace(/\D/g, "");
    if (!vendorForm.storeName.trim()) {
      toast.error("Store or Business name is required.");
      return;
    }
    if (!vendorForm.phone.trim()) {
      toast.error("Phone number is required. Please provide your contact number.");
      return;
    }
    if (cleanedPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile or phone number.");
      return;
    }
    if (!vendorForm.city.trim()) {
      toast.error("City / Location name is required.");
      return;
    }
    if (!vendorForm.address.trim()) {
      toast.error("Store address or area is required for buyer verification.");
      return;
    }

    setBecomingVendor(true);
    try {
      const updatedUser = await api.becomeVendor();
      const token = localStorage.getItem("accessToken");
      if (token && updatedUser) {
        storeSession({ accessToken: token, user: updatedUser });
      }

      const storeData = {
        id: user.id,
        name: vendorForm.storeName.trim(),
        slug: slugify(vendorForm.storeName.trim()),
        phone: vendorForm.phone.trim(),
        city: vendorForm.city.trim(),
        address: vendorForm.address.trim(),
        state: vendorForm.state.trim() || "Andhra Pradesh",
        pincode: vendorForm.pincode.trim() || "533101",
        businessType: vendorForm.businessType,
        categories: ["General"],
        rating: 5.0,
        reviewCount: 1,
        joinedYear: 2026,
      };
      localStorage.setItem(`vendor_store_${user.id}`, JSON.stringify(storeData));

      if (user.id && vendorForm.storeName.trim() !== user.name) {
        await api.updateUser(user.id, { name: vendorForm.storeName.trim() }).catch(() => {});
      }

      toast.success(`🎉 Verified vendor storefront registered in ${vendorForm.city.trim()}!`);
      setBecomeVendorOpen(false);
      navigate({ to: "/vendor" });
    } catch (err: any) {
      toast.error(err.message || "Failed to activate vendor account. Please try again.");
    } finally {
      setBecomingVendor(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 lg:px-8">
        {/* 1. Brand Logo */}
        <Link to="/" className="flex items-center shrink-0 pr-1 sm:pr-2">
          <V2Logo size="md" />
        </Link>

        {/* 2. Shop by Category Dropdown (Desktop) */}
        <div className="hidden lg:block">
          <DropdownMenu open={categoryMenuOpen} onOpenChange={setCategoryMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-foreground/90 transition-all hover:text-primary focus:outline-hidden"
              >
                <span className="border-b-2 border-primary pb-0.5 text-primary">Shop by Category</span>
                <ChevronDown
                  className={`h-4 w-4 text-primary transition-transform duration-200 ${
                    categoryMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-72 max-h-[480px] overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95"
            >
              <DropdownMenuItem
                onClick={() => {
                  setCategoryMenuOpen(false);
                  navigate({ to: "/categories" });
                }}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>All Categories</span>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold">
                  {MARKETPLACE_CATEGORIES.length} Total
                </Badge>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <div className="space-y-0.5">
                {MARKETPLACE_CATEGORIES.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => {
                      setCategoryMenuOpen(false);
                      navigate({ to: "/category/$slug", params: { slug: cat.slug } });
                    }}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer transition-colors group/item"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="h-6 w-6 rounded-md overflow-hidden bg-muted shrink-0 border border-border/50">
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-0.5 transition-all shrink-0" />
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 3. Vendors Button (Desktop) */}
        <div className="hidden lg:block">
          <Link to="/vendors">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-foreground/85 hover:text-primary hover:bg-primary/5"
            >
              <Store className="h-4 w-4 text-primary" />
              <span>Vendors</span>
            </Button>
          </Link>
        </div>

        {/* 4. Desktop Search Bar (Hidden on Mobile) */}
        <div ref={searchContainerRef} className="relative hidden sm:block flex-1 min-w-0 max-w-2xl mx-2">
          <form
            onSubmit={submit}
            className="flex items-center h-10 w-full rounded-full border border-border/80 bg-background px-3 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
          >
            {/* Search Input Field */}
            <div className="relative flex-1 min-w-0 flex items-center">
              <Search className="h-4 w-4 text-muted-foreground/70 shrink-0 mr-2" />
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (q.trim().length >= 2) setShowDropdown(true);
                }}
                placeholder="Search products, categories, vendors, location..."
                className="h-full w-full border-0 bg-transparent py-2 text-xs sm:text-sm text-foreground outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/70 font-normal"
              />
              {q.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setShowDropdown(false);
                  }}
                  className="p-1 text-muted-foreground/60 hover:text-foreground text-xs rounded-full mr-1 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Search Action Button */}
            <Button
              type="submit"
              size="sm"
              className="h-7.5 rounded-full px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-2xs gap-1 ml-1"
            >
              <span>Search</span>
            </Button>
          </form>

          {/* Live Autocomplete Dropdown (Desktop) */}
          {showDropdown && q.trim().length >= 2 && (
            <div className="absolute top-12 left-0 right-0 z-50 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-xl space-y-3 max-h-[440px] overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Searching products, categories, stores & locations...
                </div>
              ) : (
                <>
                  {/* 1. Matching Categories */}
                  {searchResults?.categories && searchResults.categories.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary" /> Categories
                        </span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.categories.map((cat: any) => (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setShowDropdown(false);
                              navigate({ to: "/category/$slug", params: { slug: cat.slug } });
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-7 w-7 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                                <img src={cat.imageUrl} alt="" className="h-full w-full object-cover" />
                              </div>
                              <span className="text-xs font-semibold text-foreground truncate">{cat.name}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              Category
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Matching Locations */}
                  {searchResults?.locations && searchResults.locations.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-border/50">
                      <div className="px-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-rose-500" /> Locations & Cities
                        </span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.locations.map((loc: string) => (
                          <div
                            key={loc}
                            onClick={() => {
                              setShowDropdown(false);
                              navigate({ to: "/search", search: { q: loc } });
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 text-xs">
                              <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                              <span className="font-semibold text-foreground">{loc}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 border-rose-500/20">
                              Browse Area
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Matching Stores / Vendors */}
                  {searchResults?.stores && searchResults.stores.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-border/50">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Store className="h-3 w-3 text-primary" /> Verified Stores & Vendors
                        </span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.stores.map((store: any) => (
                          <div
                            key={store.id}
                            onClick={() => {
                              setShowDropdown(false);
                              navigate({ to: "/store/$slug", params: { slug: store.slug || store.id } });
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
                                <Store className="h-4 w-4" />
                              </div>
                              <div className="truncate text-xs">
                                <p className="font-bold text-foreground truncate">{store.name}</p>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-2.5 w-2.5 text-primary" /> {store.city || "Rajahmundry"}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 shrink-0">
                              Visit Shop
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Matching Products */}
                  {searchResults?.products && searchResults.products.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-border/50">
                      <div className="px-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Package className="h-3 w-3 text-primary" /> Matching Products
                        </span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.products.map((product: any) => {
                          const img = product.images?.[0] || product.featured_image;
                          return (
                            <div
                              key={product.id}
                              onClick={() => {
                                setShowDropdown(false);
                                navigate({ to: "/product/$slug", params: { slug: product.slug || product.id } });
                              }}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="h-9 w-9 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                                  {img ? (
                                    <img src={img} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full grid place-items-center text-muted-foreground text-xs">
                                      📦
                                    </div>
                                  )}
                                </div>
                                <div className="truncate text-xs">
                                  <p className="font-semibold text-foreground truncate">{product.name}</p>
                                  <p className="text-[11px] text-muted-foreground">
                                    By {product.vendor?.name || product.vendors?.name || "Merchant"}
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold text-xs text-primary shrink-0 pl-2">
                                {formatMoney(product.price)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty state if no results */}
                  {(!searchResults?.categories || searchResults.categories.length === 0) &&
                    (!searchResults?.locations || searchResults.locations.length === 0) &&
                    (!searchResults?.stores || searchResults.stores.length === 0) &&
                    (!searchResults?.products || searchResults.products.length === 0) && (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No direct matches found. Press Enter to view full catalogue search.
                      </div>
                    )}

                  {/* View All Button */}
                  <div className="pt-2 border-t border-border/60">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={submit}
                      className="w-full text-xs font-bold rounded-xl h-8"
                    >
                      View all results for "{q}" in Products, Stores, Categories & Locations →
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 5. Right Actions: Wishlist, Cart, Sign In / Account */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          {user && (
            <Link to="/account/wishlist" className="hidden sm:inline-flex">
              <Button variant="ghost" size="icon" aria-label="Wishlist" className="rounded-full">
                <Heart className="h-5 w-5 text-muted-foreground hover:text-rose-500 transition-colors" />
              </Button>
            </Link>
          )}

          {/* 6. Cart Button */}
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart" className="rounded-full">
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-2xs">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Sign in / Profile button */}
          {!user ? (
            <Link to="/auth" search={{ redirect: pathname }}>
              <Button size="sm" className="rounded-full px-4 text-xs font-semibold shadow-2xs">
                Sign In
              </Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 px-3 text-xs font-semibold" aria-label="Account">
                  <UserIcon className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline truncate max-w-[90px]">
                    {user.name || user.email.split("@")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/account" })}>
                  <UserIcon className="mr-2 h-4 w-4" /> My Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/account/orders" })}>
                  <Package className="mr-2 h-4 w-4" /> My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/account/wishlist" })}>
                  <Heart className="mr-2 h-4 w-4" /> Wishlist
                </DropdownMenuItem>
                {isVendor && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/vendor" })}>
                    <LayoutDashboard className="mr-2 h-4 w-4 text-primary" /> Vendor Dashboard
                  </DropdownMenuItem>
                )}
                {!isVendor && (
                  <DropdownMenuItem
                    onClick={() => setBecomeVendorOpen(true)}
                    className="cursor-pointer font-semibold text-amber-600 dark:text-amber-400 focus:text-amber-600 focus:bg-amber-500/10"
                  >
                    <Store className="mr-2 h-4 w-4 text-amber-500" /> Become a Vendor
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                    <LayoutDashboard className="mr-2 h-4 w-4 text-primary" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Navigation Drawer */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-full" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6 flex flex-col justify-between">
              <div className="space-y-5 overflow-y-auto">
                <div className="flex items-center gap-2">
                  <V2Logo size="sm" />
                </div>

                {/* Marketplace Info Badge */}
                <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 bg-muted/40 text-xs font-bold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Verified Multi-Vendor Marketplace</span>
                </div>

                <nav className="flex flex-col space-y-2 text-sm font-medium">
                  <Link
                    to="/categories"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-muted text-foreground"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Shop by Category</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {MARKETPLACE_CATEGORIES.length}
                    </Badge>
                  </Link>
                  <Link
                    to="/vendors"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-muted text-foreground"
                  >
                    <Store className="h-4 w-4 text-primary" />
                    <span>Browse All Vendors</span>
                  </Link>
                  <Link
                    to="/search"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-muted text-foreground"
                  >
                    <Search className="h-4 w-4 text-primary" />
                    <span>Search Marketplace</span>
                  </Link>
                  <Link
                    to="/account/wishlist"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-muted text-foreground"
                  >
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span>Wishlist</span>
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-muted text-foreground"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <span>Shopping Cart</span>
                    </div>
                    {cartCount > 0 && (
                      <Badge className="text-[10px] font-bold">
                        {cartCount}
                      </Badge>
                    )}
                  </Link>
                </nav>
              </div>

              <div className="border-t pt-4 space-y-2">
                {!user ? (
                  <Link to="/auth" onClick={() => setOpen(false)} className="block">
                    <Button className="w-full rounded-full">Sign In / Register</Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <div className="px-2 text-xs text-muted-foreground truncate">{user.email}</div>
                    <Link to="/account" onClick={() => setOpen(false)} className="block">
                      <Button variant="outline" className="w-full justify-start rounded-xl text-xs">
                        <UserIcon className="mr-2 h-4 w-4" /> My Account
                      </Button>
                    </Link>
                    {isVendor ? (
                      <Link to="/vendor" onClick={() => setOpen(false)} className="block">
                        <Button variant="outline" className="w-full justify-start rounded-xl text-xs font-semibold text-primary">
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Vendor Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setOpen(false);
                          setBecomeVendorOpen(true);
                        }}
                        className="w-full justify-start rounded-xl text-xs font-semibold text-amber-600 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                      >
                        <Store className="mr-2 h-4 w-4 text-amber-500" /> Become a Vendor
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                      className="w-full justify-start text-destructive hover:text-destructive rounded-xl text-xs"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Dedicated Search Bar (Visible only on < sm) */}
      <div className="block sm:hidden px-3 pb-2.5 pt-0">
        <form
          onSubmit={submit}
          className="relative flex items-center h-9 w-full rounded-full border border-border/80 bg-background px-2.5 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
        >
          <div className="relative flex-1 min-w-0 flex items-center">
            <Search className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0 mr-1.5" />
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (q.trim().length >= 2) setShowDropdown(true);
              }}
              placeholder="Search products, categories, vendors, location..."
              className="h-full w-full border-0 bg-transparent py-1.5 text-xs text-foreground outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/70 font-normal"
            />
            {q.trim().length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setShowDropdown(false);
                }}
                className="p-1 text-muted-foreground/60 hover:text-foreground text-xs rounded-full mr-1 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            className="h-6.5 rounded-full px-2.5 text-[11px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-2xs gap-1 ml-1"
          >
            <span>Search</span>
          </Button>
        </form>

        {/* Live Autocomplete Dropdown (Mobile) */}
        {showDropdown && q.trim().length >= 2 && (
          <div className="mt-1.5 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-xl space-y-2.5 max-h-[350px] overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                Searching products, categories, stores & locations...
              </div>
            ) : (
              <>
                {/* 1. Categories */}
                {searchResults?.categories && searchResults.categories.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 px-1">
                      <Sparkles className="h-3 w-3 text-primary" /> Categories
                    </span>
                    {searchResults.categories.map((cat: any) => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setShowDropdown(false);
                          navigate({ to: "/category/$slug", params: { slug: cat.slug } });
                        }}
                        className="flex items-center justify-between p-1.5 rounded-xl hover:bg-muted/70 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate text-xs">
                          <div className="h-6 w-6 rounded-md overflow-hidden bg-muted shrink-0 border border-border">
                            <img src={cat.imageUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                          <span className="font-semibold text-foreground truncate">{cat.name}</span>
                        </div>
                        <Badge variant="outline" className="text-[9px]">
                          Category
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Locations */}
                {searchResults?.locations && searchResults.locations.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 px-1">
                      <MapPin className="h-3 w-3 text-rose-500" /> Locations & Cities
                    </span>
                    {searchResults.locations.map((loc: string) => (
                      <div
                        key={loc}
                        onClick={() => {
                          setShowDropdown(false);
                          navigate({ to: "/search", search: { q: loc } });
                        }}
                        className="flex items-center justify-between p-1.5 rounded-xl hover:bg-muted/70 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          <span className="font-semibold text-foreground">{loc}</span>
                        </div>
                        <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-600 border-rose-500/20">
                          Location
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Stores */}
                {searchResults?.stores && searchResults.stores.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 px-1">
                      <Store className="h-3 w-3 text-primary" /> Verified Stores & Vendors
                    </span>
                    {searchResults.stores.map((store: any) => (
                      <div
                        key={store.id}
                        onClick={() => {
                          setShowDropdown(false);
                          navigate({ to: "/store/$slug", params: { slug: store.slug || store.id } });
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0 text-xs">
                          <Store className="h-3.5 w-3.5 text-primary shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-foreground truncate">{store.name}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5 text-primary" /> {store.city || "Rajahmundry"}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-700 shrink-0">
                          Visit
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Products */}
                {searchResults?.products && searchResults.products.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                      Matching Products
                    </span>
                    {searchResults.products.map((product: any) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setShowDropdown(false);
                          navigate({ to: "/product/$slug", params: { slug: product.slug || product.id } });
                        }}
                        className="flex items-center justify-between p-1.5 rounded-xl hover:bg-muted/70 cursor-pointer"
                      >
                        <span className="truncate text-xs font-semibold text-foreground pr-2">
                          {product.name}
                        </span>
                        <span className="font-bold text-xs text-primary shrink-0">
                          {formatMoney(product.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-1.5 border-t border-border/60">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={submit}
                    className="w-full text-xs font-bold rounded-xl h-7"
                  >
                    View results for "{q}"
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* BECOME A VENDOR DIALOG */}
      <Dialog open={becomeVendorOpen} onOpenChange={setBecomeVendorOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 shadow-inner">
              <Store className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              Register as a Verified Vendor
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground pt-0.5">
              Please provide your contact phone number and storefront location to activate your vendor account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBecomeVendor} className="space-y-4 py-2">
            {/* 1. Store Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Store / Business Name <span className="text-rose-500">*</span></span>
              </Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={vendorForm.storeName}
                  onChange={(e) => setVendorForm((prev) => ({ ...prev, storeName: e.target.value }))}
                  placeholder="e.g. Balaji Silks & Sarees"
                  required
                  className="pl-9 h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* 2. Phone Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Contact Phone Number <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-muted-foreground">For order updates & buyer verification</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. 9876543210 (10-digit mobile number)"
                  required
                  className="pl-9 h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* 3. Location / City */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>City / Town Location <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-muted-foreground">Used for local search & buyers</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500" />
                <Input
                  value={vendorForm.city}
                  onChange={(e) => setVendorForm((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. Rajahmundry"
                  required
                  className="pl-9 h-10 rounded-xl text-xs"
                />
              </div>
              {/* Quick city suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-muted-foreground">Quick pick:</span>
                {["Rajahmundry", "Danavaipeta", "Kakinada", "Vijayawada", "Visakhapatnam", "Hyderabad"].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setVendorForm((prev) => ({ ...prev, city }))}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      vendorForm.city.toLowerCase() === city.toLowerCase()
                        ? "bg-rose-500 text-white border-rose-500 font-semibold"
                        : "bg-muted/60 text-foreground/80 border-border hover:bg-muted"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Store Address / Area */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Storefront Address / Street Area <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={vendorForm.address}
                onChange={(e) => setVendorForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="e.g. Shop #4, Main Road, Danavaipeta"
                required
                className="h-10 rounded-xl text-xs"
              />
            </div>

            {/* 5. Pincode & State */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Pincode</Label>
                <Input
                  value={vendorForm.pincode}
                  onChange={(e) => setVendorForm((prev) => ({ ...prev, pincode: e.target.value }))}
                  placeholder="533101"
                  className="h-10 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">State</Label>
                <Input
                  value={vendorForm.state}
                  onChange={(e) => setVendorForm((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="Andhra Pradesh"
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* 6. Business Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Business Store Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVendorForm((prev) => ({ ...prev, businessType: "physical_shop" }))}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs transition-all ${
                    vendorForm.businessType === "physical_shop"
                      ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Building2 className="h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold text-[11px]">Retail Store</p>
                    <p className="text-[9px] text-muted-foreground">Commercial shop</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setVendorForm((prev) => ({ ...prev, businessType: "home_cloud" }))}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs transition-all ${
                    vendorForm.businessType === "home_cloud"
                      ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Store className="h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold text-[11px]">Home / Cloud Studio</p>
                    <p className="text-[9px] text-muted-foreground">Online seller</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
              <span>0% Commission · Instant Seller Tools · Verified Store Badge</span>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-2xl"
                disabled={becomingVendor}
                onClick={() => setBecomeVendorOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-2xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25"
                disabled={becomingVendor}
              >
                {becomingVendor ? "Activating Store…" : "Complete Registration & Activate"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}

