import { Link } from "@tanstack/react-router";
import { Store } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">V2 Business</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            An independent marketplace where every store is run by real people. Discover thousands
            of vendors and products.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/search" className="hover:text-foreground">
                All products
              </Link>
            </li>
            <li>
              <Link to="/vendors" className="hover:text-foreground">
                All vendors
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-foreground">
                Categories
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Sell</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/vendor" className="hover:text-foreground">
                Open a store
              </Link>
            </li>
            <li>
              <Link to="/vendor" className="hover:text-foreground">
                Vendor dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-foreground">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} V2 Business. All rights reserved.
      </div>
    </footer>
  );
}
