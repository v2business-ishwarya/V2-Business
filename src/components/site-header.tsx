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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logout, useSession } from "@/hooks/use-session";
import { api } from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

import { V2Logo } from "@/components/v2-logo";

export function SiteHeader() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const { user, loading } = useSession();
  const isAdmin = user?.role === "ADMIN";
  const isVendor = user?.role === "VENDOR";

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
    navigate({ to: "/search", search: term ? { q: term } : {} });
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await logout();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center">
          <V2Logo size="md" />
        </Link>

        <form onSubmit={submit} className="relative ml-2 hidden flex-1 max-w-2xl md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, vendors, categories..."
            className="h-11 rounded-full border-border bg-surface-muted pl-10 pr-4 text-sm"
          />
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Link to="/search" className="hidden md:hidden">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {user && (
            <Link to="/account/wishlist" className="hidden sm:inline-flex">
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {!user ? (
            <Link to="/auth" search={{ redirect: pathname }}>
              <Button size="sm" className="ml-1 rounded-full">
                Sign in
              </Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/account" })}>
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/account/orders" })}>
                  My Orders
                </DropdownMenuItem>
                {isVendor && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/vendor" })}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Vendor Dashboard
                  </DropdownMenuItem>
                )}
                {!isVendor && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/vendor" })}>
                    <Store className="mr-2 h-4 w-4" /> Become a Vendor
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <V2Logo size="sm" />
                </div>

                <form
                  onSubmit={(e) => {
                    submit(e);
                    setOpen(false);
                  }}
                  className="relative"
                >
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search products & stores..."
                    className="h-10 rounded-full pl-9 pr-4 text-sm"
                  />
                </form>

                <nav className="flex flex-col space-y-3 text-sm font-medium">
                  <Link
                    to="/search"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
                  >
                    <Search className="h-4 w-4 text-primary" /> All Products
                  </Link>
                  <Link
                    to="/categories"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
                  >
                    <Store className="h-4 w-4 text-primary" /> Categories
                  </Link>
                  <Link
                    to="/vendors"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
                  >
                    <Store className="h-4 w-4 text-primary" /> Marketplace Vendors
                  </Link>
                  <Link
                    to="/vendor"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-primary font-semibold hover:bg-primary/10"
                  >
                    <Store className="h-4 w-4" /> Open Your Store
                  </Link>
                  <Link
                    to="/account/wishlist"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
                  >
                    <Heart className="h-4 w-4 text-rose-500" /> Wishlist
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
                  >
                    <ShoppingCart className="h-4 w-4 text-primary" /> Shopping Cart ({cartCount})
                  </Link>
                </nav>
              </div>

              <div className="border-t pt-4 space-y-2">
                {!user ? (
                  <Link to="/auth" onClick={() => setOpen(false)} className="block">
                    <Button className="w-full rounded-full">Sign in / Register</Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <div className="px-2 text-xs text-muted-foreground truncate">{user.email}</div>
                    <Link to="/account" onClick={() => setOpen(false)} className="block">
                      <Button variant="outline" className="w-full justify-start rounded-xl text-xs">
                        <UserIcon className="mr-2 h-4 w-4" /> My Account
                      </Button>
                    </Link>
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
    </header>
  );
}
