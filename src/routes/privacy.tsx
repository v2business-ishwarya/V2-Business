import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, Eye, Server, UserCheck, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — V2 Business Marketplace" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Privacy <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-sm font-semibold text-foreground/70">
            Last Updated: August 2026 • We respect your privacy and protect your personal data
          </p>
        </div>

        {/* Section Cards */}
        <div className="space-y-6">
          {/* 1. Information We Collect */}
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black">1</span>
              Information We Collect
            </h2>
            <p className="text-sm text-foreground/85 leading-relaxed">
              To provide a seamless shopping and selling experience, V2 Business collects essential customer and merchant information:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <p className="font-bold text-foreground">Customer Profile Data</p>
                <p className="text-foreground/75">Full name, email address, phone number, and physical shipping address for delivery.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <p className="font-bold text-foreground">Vendor Business Information</p>
                <p className="text-foreground/75">Store name, trade license, GST/PAN details, and bank account for automated settlements.</p>
              </div>
            </div>
          </div>

          {/* 2. How We Use Information */}
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black">2</span>
              How We Use Your Data
            </h2>
            <p className="text-sm text-foreground/85 leading-relaxed">
              Your personal information is used exclusively to facilitate marketplace operations:
            </p>
            <div className="rounded-xl bg-muted/40 p-4 border border-border/60 space-y-2 text-xs sm:text-sm text-foreground/80 font-medium">
              <p>✦ <strong>Order Fulfillment:</strong> Sharing shipping addresses with vendors and logistics partners (Delhivery, Shiprocket) to deliver your parcel.</p>
              <p>✦ <strong>Invoices & Accounts:</strong> Generating tax-compliant invoices per vendor and maintaining order history.</p>
              <p>✦ <strong>Notifications & Updates:</strong> Sending SMS/email order confirmations, dispatch updates, and OTP authentications.</p>
              <p>✦ <strong>Zero Ads Selling:</strong> We NEVER sell or rent your personal contact information to third-party telemarketers.</p>
            </div>
          </div>

          {/* 3. Payment Processing & Security */}
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black">3</span>
              Payment Security & Gateway Compliance
            </h2>
            <p className="text-sm text-foreground/85 leading-relaxed">
              All payment transactions are handled through RBI-regulated, PCI-DSS Level 1 compliant gateways (Razorpay and Cashfree). 
              <strong> V2 Business never stores your credit card numbers, CVVs, or UPI PINs on our servers.</strong>
            </p>
          </div>

          {/* 4. Data Security & Storage */}
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black">4</span>
              Encryption & Cloud Security
            </h2>
            <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
              All data transmitted between your browser and our platform is encrypted using 256-bit SSL/TLS encryption. Databases are secured with strict access controls, automated security audits, and continuous backup mechanisms.
            </p>
          </div>

          {/* 5. User Rights & Data Deletion */}
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black">5</span>
              Your Rights & Account Deletion
            </h2>
            <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
              You retain full control over your personal data. You may update your profile, modify saved addresses in your account dashboard, or request complete account deletion by reaching out to our support desk.
            </p>
          </div>

          {/* Contact Assistance */}
          <div className="rounded-2xl bg-muted/50 border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-black text-foreground">Questions about our Privacy Policy?</h3>
              <p className="text-xs text-foreground/75">Our data protection officer is available to answer any questions.</p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-extrabold shadow-sm hover:opacity-95 transition-opacity shrink-0"
            >
              Contact Privacy Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

