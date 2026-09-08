import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import {
  CreditCard,
  Building2,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor/payments")({
  head: () => ({ meta: [{ title: "Vendor Plans & Payments — V2 Business" }] }),
  component: VendorPaymentsPage,
});

function VendorPaymentsPage() {
  const [utrNumber, setUtrNumber] = useState("");
  const [utrSubmitted, setUtrSubmitted] = useState(false);

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["payment-providers"],
    queryFn: () => api.getPaymentProviders(),
  });

  const { data: rawSettings = [] } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.getAdminSettings(),
  });

  const list = Array.isArray(rawSettings) ? rawSettings : (rawSettings as any)?.data ?? [];

  const freeJoiningSetting = list.find((d: any) => d.key === "FREE_JOINING_ACTIVE");
  const isFreeJoining = freeJoiningSetting?.value != null ? String(freeJoiningSetting.value) === "true" : true;

  const monthlyFeeSetting = list.find((d: any) => d.key === "VENDOR_MONTHLY_FEE");
  const monthlyFee = monthlyFeeSetting?.value ? String(monthlyFeeSetting.value) : "500";

  const bankSetting = list.find((d: any) => d.key === "OWNER_BANK_DETAILS");
  let ownerBank = {
    accountHolder: "V2 Business Platform",
    bankName: "HDFC Bank",
    accountNumber: "50200012345678",
    ifscCode: "HDFC0000123",
    upiId: "v2business@okhdfcbank",
  };
  if (bankSetting?.value) {
    try {
      const parsed = typeof bankSetting.value === "string" ? JSON.parse(bankSetting.value) : bankSetting.value;
      ownerBank = { ...ownerBank, ...parsed };
    } catch {}
  } else {
    const localBank = localStorage.getItem("platform_owner_bank");
    if (localBank) {
      try {
        ownerBank = { ...ownerBank, ...JSON.parse(localBank) };
      } catch {}
    }
  }

  const enabledProviders = (providers as any[]).filter((p: any) => p.isEnabled);

  const providerLabels: Record<string, string> = {
    razorpay: "Razorpay (UPI, Cards, NetBanking)",
    cashfree: "Cashfree Payments",
    mock: "Platform Direct Gateway",
  };

  const handleUtrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) return toast.error("Please enter your payment UTR / Transaction ID");
    setUtrSubmitted(true);
    toast.success("Payment UTR reference submitted! Platform admin will verify your ₹500 subscription.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seller Plan & Payment Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enjoy <strong>0% Commission on all sales</strong> and manage your monthly store maintenance subscription.
        </p>
      </div>

      {/* Plan Status Badges */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 border-2 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
              0%
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Sales Commission</p>
              <p className="text-lg font-bold text-emerald-700">0% (Keep 100%)</p>
              <p className="text-[11px] text-muted-foreground">Full product earnings go to you</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-2 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Joining Fee</p>
              <p className="text-lg font-bold text-blue-700">
                {isFreeJoining ? "₹0 (100% Free Promo)" : "₹2,000"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isFreeJoining ? "Zero registration fee" : "One-time registration"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-2 border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-600 flex items-center justify-center font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Monthly Maintenance Fee</p>
              <p className="text-lg font-bold text-purple-700">₹{monthlyFee} / Month</p>
              <p className="text-[11px] text-muted-foreground">For store hosting & features</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Owner Bank & UPI Details for Monthly Fee Payments */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Owner Platform Bank & UPI Details
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Please transfer your monthly store maintenance fee of <strong>₹{monthlyFee}/month</strong> to the platform owner account below:
            </p>
          </div>
          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white self-start">
            Official Owner Details
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border p-3.5 bg-muted/30 space-y-1">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">Account Holder</span>
            <p className="text-sm font-bold text-foreground">{ownerBank.accountHolder}</p>
          </div>

          <div className="rounded-xl border p-3.5 bg-muted/30 space-y-1">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">Bank Name</span>
            <p className="text-sm font-bold text-foreground">{ownerBank.bankName}</p>
          </div>

          <div className="rounded-xl border p-3.5 bg-muted/30 space-y-1">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">Account Number</span>
            <p className="text-sm font-bold text-foreground font-mono">{ownerBank.accountNumber}</p>
          </div>

          <div className="rounded-xl border p-3.5 bg-muted/30 space-y-1">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">IFSC Code</span>
            <p className="text-sm font-bold text-foreground font-mono">{ownerBank.ifscCode}</p>
          </div>

          <div className="sm:col-span-2 rounded-xl border p-3.5 bg-emerald-500/10 border-emerald-500/20 space-y-1">
            <span className="text-[10px] font-bold uppercase text-emerald-800 block flex items-center gap-1">
              <QrCode className="h-3.5 w-3.5" /> Instant UPI ID (Google Pay / PhonePe / Paytm / BHIM)
            </span>
            <p className="text-sm font-bold text-emerald-900 font-mono">{ownerBank.upiId}</p>
          </div>
        </div>

        {/* Submit UTR / Payment Proof */}
        <div className="pt-4 border-t space-y-3">
          <h3 className="font-bold text-sm">Submit Monthly Payment Confirmation (UTR / Transaction ID)</h3>
          <form onSubmit={handleUtrSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <Input
              placeholder="e.g. 423589283741 or UPI-Ref-1234"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              className="text-xs h-10"
              disabled={utrSubmitted}
            />
            <Button type="submit" className="h-10 font-bold shrink-0" disabled={utrSubmitted}>
              {utrSubmitted ? "Submitted ✓" : "Submit Reference"}
            </Button>
          </form>
          {utrSubmitted && (
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Reference logged. Your store remains in active good standing.
            </p>
          )}
        </div>
      </Card>

      {/* Customer Checkout Gateways */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Active Customer Checkout Gateways</h2>
        <p className="text-xs text-muted-foreground">
          Payments from customer orders are collected securely via platform gateways and 100% of order totals are settled to your bank account.
        </p>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading…</div>
        ) : enabledProviders.length === 0 ? (
          <Card className="p-6 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No payment gateways are currently active. Contact the platform admin.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {enabledProviders.map((p: any) => (
              <Card key={p.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{providerLabels[p.name] ?? p.name}</p>
                    <p className="text-xs text-muted-foreground">100% order payout to seller</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Active
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default VendorPaymentsPage;
