import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ShieldCheck, Store, Truck, ArrowRight, HeartHandshake, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About Us — V2 Business Marketplace" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-10 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Empowering Independent Commerce</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            About <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">V2 Business</span>
          </h1>
          <p className="text-base sm:text-lg text-foreground/80 font-medium leading-relaxed">
            Connecting customers with certified independent merchants across 29 retail categories with fair pricing, verified trust, and rapid doorstep delivery.
          </p>
        </div>

        {/* 3 Core Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-card border border-border/80 p-6 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Store className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-foreground">Direct From Sellers</h3>
            <p className="text-sm text-foreground/75 leading-relaxed">
              When you shop on V2 Business, you buy directly from verified physical and digital merchants with authentic products and real local prices.
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-border/80 p-6 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-foreground">100% Buyer Protection</h3>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Every payment is secured via RBI-compliant gateways (Razorpay, Cashfree), accompanied by GST-compliant invoices and easy returns.
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-border/80 p-6 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-foreground">Fast Reliable Logistics</h3>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Integrated with tier-1 courier logistics and hyper-local delivery networks to deliver orders safely right to your doorstep.
            </p>
          </div>
        </div>

        {/* Detailed Story Sections */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
              <HeartHandshake className="h-6 w-6 text-amber-500" />
              Our Mission
            </h2>
            <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
              V2 Business was founded to bridge the gap between traditional trusted merchants and modern digital shoppers. Large marketplace monopolies charge up to 25-35% in hidden fees that inflate customer prices and squeeze small businesses. We built a fair, transparent ecosystem where sellers keep 100% of their product margins and customers get genuine direct pricing.
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
              <Store className="h-6 w-6 text-amber-500" />
              For Merchants & Vendors
            </h2>
            <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
              Whether you sell fine BIS Hallmarked gold, designer silk sarees, fresh groceries, or consumer electronics, V2 Business offers:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <li className="flex items-start gap-2 text-sm text-foreground/85 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>0% Sales Commission</strong> on your product sales.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground/85 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Automated Invoices</strong> generated per vendor.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground/85 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Integrated Couriers</strong> or self-delivery options.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground/85 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Real-time Analytics</strong>, order management & payout tracking.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Footer Card */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <h3 className="text-lg sm:text-xl font-black">Ready to explore our marketplace?</h3>
            <p className="text-xs sm:text-sm text-yellow-100 font-medium mt-1">Discover over 29 retail categories with exclusive discounts.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/categories">
              <Button className="rounded-full bg-black text-white hover:bg-black/80 font-extrabold text-xs sm:text-sm px-5 h-10 gap-1.5 shadow-md">
                <span>Browse Categories</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="rounded-full bg-white/20 hover:bg-white/30 text-white border-white/40 font-bold text-xs sm:text-sm px-5 h-10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

