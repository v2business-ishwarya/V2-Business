import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ShieldCheck, ShoppingBag, Store, CreditCard, AlertTriangle, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms and Conditions — V2 Business Marketplace" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <FileText className="h-3.5 w-3.5" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Terms & <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Conditions</span>
          </h1>
          <p className="text-sm font-semibold text-foreground/70">
            Last Updated: August 2026 • Effective for all users and registered merchants
          </p>
        </div>

        {/* Section Cards */}
        <div className="space-y-6">
          {/* 1. Introduction */}
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black">1</span>
              Platform Overview & Acceptance
            </h2>
            <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
              Welcome to <strong>V2 Business ("Marketplace Hub")</strong>. By accessing our platform, browsing products, or registering as a merchant, you agree to comply with and be bound by these Terms and Conditions. Please review them carefully before placing orders or listing products.
            </p>
          </div>

          {/* 2. Customer Terms */}
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black">2</span>
              Terms for Shoppers & Customers
            </h2>
            <p className="text-sm text-foreground/85 leading-relaxed">
              V2 Business is a direct multi-vendor retail platform. When you buy goods, your contract of sale is formed directly with the individual verified merchant selling that item.
            </p>
            <div className="rounded-xl bg-muted/40 p-4 border border-border/60 space-y-2 text-xs sm:text-sm text-foreground/80 font-medium">
              <p>✦ <strong>Transparent Pricing:</strong> All listed prices include applicable GST/taxes unless explicitly noted otherwise.</p>
              <p>✦ <strong>Separate Invoices:</strong> When purchasing items from multiple vendors in a single checkout, separate GST-compliant tax invoices are issued for each store.</p>
              <p>✦ <strong>Order Tracking:</strong> Tracking numbers and live delivery status are accessible directly within your Account Orders dashboard.</p>
            </div>
          </div>

          {/* 3. Vendor Terms */}
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black">3</span>
              Merchant & Vendor Obligations
            </h2>
            <p className="text-sm text-foreground/85 leading-relaxed">
              Vendors registering on V2 Business must ensure accurate catalog descriptions, honest stock quantities, and prompt fulfillment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                <p className="font-bold text-foreground">0% Sales Commission</p>
                <p className="text-foreground/75 mt-1">Vendors retain 100% of product sales margins with a flat ₹500/month platform fee.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                <p className="font-bold text-foreground">Settlements & Payouts</p>
                <p className="text-foreground/75 mt-1">Earnings are credited directly to the vendor's verified bank account upon delivery confirmation.</p>
              </div>
            </div>
          </div>

          {/* 4. Payments & Refunds */}
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black">4</span>
              Payments, Cancellations & Refunds
            </h2>
            <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
              All transactions are encrypted and processed through RBI-authorized payment gateways (Razorpay, Cashfree, UPI). If an order is cancelled or a valid return is approved, refunds are credited to the original payment method within 5 to 7 business days.
            </p>
          </div>

          {/* 5. Prohibited Items */}
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black">5</span>
              Prohibited Items & Compliance
            </h2>
            <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
              Listing counterfeit, illegal, expired, dangerous, or unauthorized goods is strictly prohibited. Any violation results in instant merchant deactivation, forfeiture of pending balances, and referral to regulatory authorities.
            </p>
          </div>

          {/* Contact Assistance */}
          <div className="rounded-2xl bg-muted/50 border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-black text-foreground">Have questions about our Terms?</h3>
              <p className="text-xs text-foreground/75">Our legal and customer support team is happy to clarify any doubts.</p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-extrabold shadow-sm hover:opacity-95 transition-opacity shrink-0"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

