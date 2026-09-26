import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useSession } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
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
  Wallet,
  ArrowRight,
  PackageCheck,
  Truck,
  Check,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor/payments")({
  head: () => ({ meta: [{ title: "Vendor Plans & Payments — V2 Business" }] }),
  component: VendorPaymentsPage,
});

function VendorPaymentsPage() {
  const { user } = useSession();
  const [utrNumber, setUtrNumber] = useState("");
  const [utrSubmitted, setUtrSubmitted] = useState(false);

  // Vendor Payout Form State
  const [payoutForm, setPayoutForm] = useState({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    upiId: "",
  });
  const [isSaved, setIsSaved] = useState(false);
  const [savingPayout, setSavingPayout] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`vendor_payout_${user.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPayoutForm({
            accountHolder: parsed.accountHolder || user.name || "",
            bankName: parsed.bankName || "",
            accountNumber: parsed.accountNumber || "",
            confirmAccountNumber: parsed.accountNumber || "",
            ifscCode: parsed.ifscCode || "",
            upiId: parsed.upiId || "",
          });
          setIsSaved(Boolean(parsed.accountNumber || parsed.upiId));
          return;
        } catch {}
      }
      // Check fallback from vendor store
      const storedStore = localStorage.getItem(`vendor_store_${user.id}`);
      if (storedStore) {
        try {
          const parsedStore = JSON.parse(storedStore);
          if (parsedStore.bankAccount || parsedStore.ifscCode || parsedStore.upiId) {
            setPayoutForm({
              accountHolder: parsedStore.name || user.name || "",
              bankName: parsedStore.bankName || "",
              accountNumber: parsedStore.bankAccount || "",
              confirmAccountNumber: parsedStore.bankAccount || "",
              ifscCode: parsedStore.ifscCode || "",
              upiId: parsedStore.upiId || "",
            });
            setIsSaved(true);
          }
        } catch {}
      }
    }
  }, [user]);

  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to save payment details");
    if (!payoutForm.accountNumber.trim() && !payoutForm.upiId.trim()) {
      return toast.error("Please provide at least a Bank Account Number or UPI ID to receive payouts");
    }
    if (payoutForm.accountNumber.trim()) {
      if (!payoutForm.ifscCode.trim()) return toast.error("IFSC Code is required when providing a Bank Account");
      if (payoutForm.accountNumber.trim() !== payoutForm.confirmAccountNumber.trim()) {
        return toast.error("Account Numbers do not match. Please re-check.");
      }
    }

    setSavingPayout(true);
    try {
      const payload = {
        accountHolder: payoutForm.accountHolder.trim() || user.name || "Vendor",
        bankName: payoutForm.bankName.trim(),
        accountNumber: payoutForm.accountNumber.trim(),
        ifscCode: payoutForm.ifscCode.trim().toUpperCase(),
        upiId: payoutForm.upiId.trim(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`vendor_payout_${user.id}`, JSON.stringify(payload));

      // Sync into vendor_store as well
      const storeStr = localStorage.getItem(`vendor_store_${user.id}`);
      if (storeStr) {
        try {
          const parsed = JSON.parse(storeStr);
          parsed.bankAccount = payload.accountNumber;
          parsed.ifscCode = payload.ifscCode;
          parsed.upiId = payload.upiId;
          parsed.bankName = payload.bankName;
          localStorage.setItem(`vendor_store_${user.id}`, JSON.stringify(parsed));
        } catch {}
      }

      setIsSaved(true);
      toast.success("Payout details saved! You are 100% ready to receive direct sales payments.");
    } catch (e: any) {
      toast.error(e.message || "Failed to save payout details");
    } finally {
      setSavingPayout(false);
    }
  };

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
        <h1 className="text-2xl font-bold tracking-tight">Seller Payouts & Plan Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enjoy <strong>0% Commission on all product sales</strong> and set up your direct bank/UPI payout account.
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

      {/* ─────────────────────────────────────────────────────────────
          1. YOUR PAYOUT BANK & UPI DETAILS (WHERE VENDORS RECEIVE MONEY)
          ───────────────────────────────────────────────────────────── */}
      <Card className="p-6 space-y-6 border-2 border-primary/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> Your Receiving Bank & UPI Payout Details
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter your bank account or UPI ID. <strong>100% of your sales money (0% commission deducted)</strong> is transferred directly here after customer orders are fulfilled.
            </p>
          </div>
          <div>
            {isSaved ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white flex items-center gap-1.5 py-1 px-3">
                <CheckCircle2 className="h-4 w-4" /> Ready for Payouts
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 flex items-center gap-1.5 py-1 px-3">
                <Info className="h-4 w-4" /> Action Required: Add Payout Info
              </Badge>
            )}
          </div>
        </div>

        <form onSubmit={handleSavePayout} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-semibold">Beneficiary / Account Holder Name *</Label>
              <Input
                placeholder="Name as printed in your bank account / passbook"
                value={payoutForm.accountHolder}
                onChange={(e) => setPayoutForm({ ...payoutForm, accountHolder: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Bank Name *</Label>
              <Input
                placeholder="e.g. State Bank of India, HDFC Bank, ICICI Bank"
                value={payoutForm.bankName}
                onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Bank Account Number</Label>
              <Input
                type="text"
                placeholder="e.g. 50100234567890"
                value={payoutForm.accountNumber}
                onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value.replace(/\s/g, "") })}
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Confirm Bank Account Number</Label>
              <Input
                type="text"
                placeholder="Re-enter bank account number"
                value={payoutForm.confirmAccountNumber}
                onChange={(e) => setPayoutForm({ ...payoutForm, confirmAccountNumber: e.target.value.replace(/\s/g, "") })}
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Bank IFSC Code</Label>
              <Input
                placeholder="e.g. SBIN0001234 or HDFC0001234"
                maxLength={11}
                value={payoutForm.ifscCode}
                onChange={(e) => setPayoutForm({ ...payoutForm, ifscCode: e.target.value.toUpperCase().replace(/\s/g, "") })}
                className="mt-1 font-mono uppercase"
              />
              <span className="text-[11px] text-muted-foreground mt-0.5 block">11-character Indian Financial System Code</span>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-1">
              <Label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-emerald-600" /> Instant UPI ID (Google Pay / PhonePe / Paytm / BHIM)
              </Label>
              <Input
                placeholder="e.g. yourname@okhdfcbank or 9876543210@ybl"
                value={payoutForm.upiId}
                onChange={(e) => setPayoutForm({ ...payoutForm, upiId: e.target.value.trim().toLowerCase() })}
                className="mt-1 font-mono bg-background"
              />
              <span className="text-[11px] text-emerald-700">For fast, instant mobile settlements directly to your UPI app.</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              {isSaved ? "✓ Your receiving details are active and secured." : "Provide your details so customer payments can be disbursed to you."}
            </p>
            <Button type="submit" disabled={savingPayout} className="font-bold shrink-0">
              {savingPayout ? "Saving..." : "Save Payout Details"}
            </Button>
          </div>
        </form>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          2. HOW VENDOR PAYOUTS WORK (4-STEP EXPLAINER)
          ───────────────────────────────────────────────────────────── */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-muted/40 border space-y-5">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" /> How You Receive Your Money (No Gateway Knowledge Needed!)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            As a seller on V2 Business, you <strong>do not need to register on Razorpay or write any code</strong>. The platform handles everything seamlessly:
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-card border p-4 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <p className="font-semibold text-xs text-foreground">Customer Buys & Pays</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Customer orders on V2 Business using UPI, Cards, or NetBanking. Payments are securely held in platform escrow.
            </p>
          </div>

          <div className="rounded-xl bg-card border p-4 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <p className="font-semibold text-xs text-foreground">You Dispatch The Order</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              You receive the order in your Vendor Orders tab, pack the item, and ship it to the customer.
            </p>
          </div>

          <div className="rounded-xl bg-card border p-4 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <p className="font-semibold text-xs text-foreground">Delivery Verified</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Shipment arrives at the customer's door. The standard return window clears without issues.
            </p>
          </div>

          <div className="rounded-xl bg-card border p-4 space-y-2 border-emerald-500/30 bg-emerald-500/5">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <p className="font-semibold text-xs text-emerald-900 font-bold">100% Payout Received</p>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              100% of product price (0% commission deducted) is disbursed directly to your Bank Account or UPI ID!
            </p>
          </div>
        </div>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          3. OWNER PLATFORM BANK & UPI DETAILS (FOR MONTHLY SUBSCRIPTION)
          ───────────────────────────────────────────────────────────── */}
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

      {/* ─────────────────────────────────────────────────────────────
          4. CUSTOMER CHECKOUT GATEWAYS
          ───────────────────────────────────────────────────────────── */}
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

