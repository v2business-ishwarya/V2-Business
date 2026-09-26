import { Link } from "@tanstack/react-router";
import { V2Logo } from "@/components/v2-logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <Link to="/" className="inline-block">
            <V2Logo size="md" />
          </Link>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            <strong className="text-foreground">V2B (V2 Business)</strong> is Rajahmundry's #1 multi-vendor online marketplace. Connecting shoppers directly with verified local merchants across 29 retail categories with doorstep delivery.
          </p>
          <div className="mt-3 text-xs text-muted-foreground space-y-1">
            <p>📍 Main Road, Danavaipeta, Rajahmundry, Andhra Pradesh — 533103</p>
            <p>✉️ support@v2business.in | 🌐 v2business</p>
          </div>
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
        © {new Date().getFullYear()} V2B (V2 Business) Rajahmundry. All rights reserved.
      </div>
    </footer>
  );
}
