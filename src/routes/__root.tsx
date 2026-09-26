import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import "../styles.css";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root" });
  }, [error]);
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "V2B | V2 Business — Rajahmundry's #1 Multi-Vendor Marketplace" },
      {
        name: "description",
        content:
          "V2B (V2 Business) is Rajahmundry's official multi-vendor online marketplace. Shop authentic jewellery, electronics, clothing, groceries, toys & more from verified local merchants with fast doorstep delivery and 0% seller commission.",
      },
      {
        name: "keywords",
        content:
          "V2B, v2b, v2business, V2 Business, V2B Rajahmundry, v2business in rajahmundry, v2b marketplace, v2b online shopping, rajahmundry shopping, local vendors rajahmundry, andhra pradesh online marketplace",
      },
      { name: "application-name", content: "V2B" },
      { name: "author", content: "V2B (V2 Business)" },
      { property: "og:site_name", content: "V2B (V2 Business)" },
      { property: "og:title", content: "V2B | V2 Business — Rajahmundry's #1 Multi-Vendor Marketplace" },
      {
        property: "og:description",
        content:
          "Shop from verified stores in Rajahmundry across 29 categories on V2B (V2 Business). Authentic gold jewellery, gadgets, fashion & local goods with instant doorstep delivery.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://v2business.in/" },
      { property: "og:image", content: "https://v2business.in/v2b-gold-logo.png" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "V2B | V2 Business Marketplace Rajahmundry" },
      {
        name: "twitter:description",
        content:
          "Rajahmundry's premier multi-vendor marketplace. Discover top local sellers and brands on V2B.",
      },
      { name: "twitter:image", content: "https://v2business.in/v2b-gold-logo.png" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "geo.region", content: "IN-AP" },
      { name: "geo.placename", content: "Rajahmundry" },
      { name: "geo.position", content: "17.0005;81.8040" },
      { name: "ICBM", content: "17.0005, 81.8040" },
    ],
    links: [
      { rel: "canonical", href: "https://v2business.in/" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/v2b-gold-logo.png", type: "image/png" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/v2b-gold-logo.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "V2B",
    legalName: "V2 Business",
    alternateName: [
      "v2b",
      "V2B",
      "v2business",
      "V2 Business",
      "V2B Rajahmundry",
      "v2business in rajahmundry",
      "V2B Marketplace"
    ],
    url: "https://v2business.in/",
    logo: "https://v2business.in/v2b-gold-logo.png",
    description: "V2B (V2 Business) is Rajahmundry's official multi-vendor online marketplace connecting verified merchants across 29 categories directly with shoppers.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Mangalavaripeta",
      addressLocality: "Rajahmundry",
      addressRegion: "Andhra Pradesh",
      postalCode: "533105",
      addressCountry: "IN"
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-81217-78999",
      contactType: "customer service",
      areaServed: ["IN", "IN-AP", "Rajahmundry"],
      availableLanguage: ["English", "Telugu", "Hindi"]
    }
  };

  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "V2B",
    alternateName: ["v2b", "V2 Business", "v2business", "V2B Rajahmundry"],
    url: "https://v2business.in/",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://v2business.in/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const jsonLdLocalBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "V2B",
    image: "https://v2business.in/v2b-gold-logo.png",
    "@id": "https://v2business.in/#localbusiness",
    url: "https://v2business.in/",
    telephone: "+91-81217-78999",
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Mangalavaripeta",
      addressLocality: "Rajahmundry",
      addressRegion: "Andhra Pradesh",
      postalCode: "533105",
      addressCountry: "IN"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 17.0005,
      longitude: 81.8040
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      opens: "00:00",
      closes: "23:59"
    }
  };

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    // Non-blocking background keep-awake / warm-up ping
    try {
      fetch("https://v2-business.onrender.com/health", { method: "GET", mode: "no-cors" }).catch(() => {});
    } catch {}
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
