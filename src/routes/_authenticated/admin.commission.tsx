import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  IndianRupee,
  ShieldCheck,
  Building2,
  QrCode,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { formatMoney } from "@/lib/utils-app";

export const Route = createFileRoute("/_authenticated/admin/commission")({
  head: () => ({ meta: [{ title: "Vendor Plans & Owner Bank — Admin" }] }),
  component: AdminVendorPlansPage,
});

function AdminVendorPlansPage() {
  const qc = useQueryClient();

  // Pricing & Model State
  const [freeJoining, setFreeJoining] = useState(true);
  const [joiningFee, setJoiningFee] = useState("2000");
  const [monthlyFee, setMonthlyFee] = useState("500");

  // Owner Bank Details for Vendor Subscription Deposits
  const [ownerBank, setOwnerBank] = useState({
    accountHolder: "V2 Business Platform",
    bankName: "HDFC Bank",
    accountNumber: "50200012345678",
    ifscCode: "HDFC0000123",
    upiId: "v2business@okhdfcbank",
  });

  const { data: rawSettings = [] } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.getAdminSettings(),
  });

  // Load settings from backend / local storage
  useEffect(() => {
    const list = Array.isArray(rawSettings) ? rawSettings : (rawSettings as any)?.data ?? [];

    const freeJoiningSetting = list.find((d: any) => d.key === "FREE_JOINING_ACTIVE");
    if (freeJoiningSetting?.value != null) {
      setFreeJoining(
        typeof freeJoiningSetting.value === "boolean"
          ? freeJoiningSetting.value
          : String(freeJoiningSetting.value) === "true"
      );
    }

    const joiningFeeSetting = list.find((d: any) => d.key === "VENDOR_JOINING_FEE");
    if (joiningFeeSetting?.value != null) {
      setJoiningFee(String(joiningFeeSetting.value));
    }

    const monthlyFeeSetting = list.find((d: any) => d.key === "VENDOR_MONTHLY_FEE");
    if (monthlyFeeSetting?.value != null) {
      setMonthlyFee(String(monthlyFeeSetting.value));
    }

    const bankSetting = list.find((d: any) => d.key === "OWNER_BANK_DETAILS");
    if (bankSetting?.value) {
      try {
        const parsed = typeof bankSetting.value === "string" ? JSON.parse(bankSetting.value) : bankSetting.value;
        setOwnerBank((prev) => ({ ...prev, ...parsed }));
      } catch {}
    } else {
      const localBank = localStorage.getItem("platform_owner_bank");
      if (localBank) {
        try {
          setOwnerBank(JSON.parse(localBank));
        } catch {}
      }
    }
  }, [rawSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      // 1. Save Free Joining Toggle
      await api.updateAdminSetting(
        "FREE_JOINING_ACTIVE",
        freeJoining,
        "Whether vendor registration is currently ₹0 / Free"
      );
      // 2. Save Standard Joining Fee (₹2000)
      await api.updateAdminSetting(
        "VENDOR_JOINING_FEE",
        Number(joiningFee) || 2000,
        "Standard vendor registration fee when free joining promo is off"
      );
      // 3. Save Monthly Maintenance Fee (₹500/mo)
      await api.updateAdminSetting(
        "VENDOR_MONTHLY_FEE",
        Number(monthlyFee) || 500,
        "Monthly store maintenance fee payable by vendors"
      );
      // 4. Save Owner Bank Details
      await api.updateAdminSetting(
        "OWNER_BANK_DETAILS",
        ownerBank,
        "Owner platform bank and UPI account details for receiving vendor fees"
      );
      // 5. Ensure sales commission is 0%
      await api.updateAdminSetting(
        "PLATFORM_COMMISSION_RATE",
        { rate: 0.0 },
        "Platform sales commission (0% - vendors keep 100% of sales)"
      );

      localStorage.setItem("platform_owner_bank", JSON.stringify(ownerBank));
      localStorage.setItem("platform_free_joining", String(freeJoining));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Vendor pricing model & Owner bank details saved successfully!");
    },
    onError: (e: any) => toast.error(e.message || "Failed to save settings"),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendor Plans & Owner Bank Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure the <strong>0% Sales Commission</strong> subscription model, toggle free vendor joining promo, and manage Owner bank/UPI details for collecting monthly fees.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 border-2 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
              0%
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Sales Commission</p>
              <p className="text-lg font-bold text-emerald-700">0% on Orders</p>
              <p className="text-[11px] text-muted-foreground">Vendors keep 100% of sales</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-2 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Monthly Maintenance Fee</p>
              <p className="text-lg font-bold text-blue-700">₹{monthlyFee} / Month</p>
              <p className="text-[11px] text-muted-foreground">Paid to Owner Bank</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-2 border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-600 flex items-center justify-center font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Vendor Joining Status</p>
              <p className="text-lg font-bold text-purple-700">
                {freeJoining ? "₹0 (Free Joining Active)" : `₹${joiningFee} (Joining Fee Active)`}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {freeJoining ? "First 3 months promo" : "Standard one-time fee"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 1. Free Joining & Pricing Controls */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Vendor Onboarding & Joining Fee Controls
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Toggle whether new sellers join for free now or require the ₹2,000 joining fee later.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/60 p-2.5 rounded-2xl border">
            <Switch
              id="free-joining-toggle"
              checked={freeJoining}
              onCheckedChange={setFreeJoining}
            />
            <Label htmlFor="free-joining-toggle" className="cursor-pointer font-bold text-xs">
              {freeJoining ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  🟢 Free Joining Active (₹0 Fee)
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1">
                  🟠 Joining Fee Enabled (₹{joiningFee})
                </span>
              )}
            </Label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="monthly-fee" className="font-semibold">
              Monthly Store Maintenance Fee (₹)
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Flat recurring fee every vendor pays monthly to your bank account
            </p>
            <Input
              id="monthly-fee"
              type="number"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              placeholder="500"
              className="font-bold text-base"
            />
          </div>

          <div>
            <Label htmlFor="joining-fee" className="font-semibold">
              One-Time Joining Fee (₹) (Applies when Free Joining is OFF)
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Standard registration fee (e.g. ₹2,000 after 3 months promo ends)
            </p>
            <Input
              id="joining-fee"
              type="number"
              value={joiningFee}
              onChange={(e) => setJoiningFee(e.target.value)}
              placeholder="2000"
              className="font-bold text-base"
            />
          </div>
        </div>
      </Card>

      {/* 2. Owner Platform Bank & UPI Details */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Owner Platform Bank & UPI Details
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            These bank & UPI details are displayed to vendors so they can pay their ₹500 monthly fee and joining fee directly to you.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Account Holder Name</Label>
            <Input
              value={ownerBank.accountHolder}
              onChange={(e) => setOwnerBank({ ...ownerBank, accountHolder: e.target.value })}
              placeholder="e.g. V2 Business / Your Name"
            />
          </div>

          <div>
            <Label>Bank Name</Label>
            <Input
              value={ownerBank.bankName}
              onChange={(e) => setOwnerBank({ ...ownerBank, bankName: e.target.value })}
              placeholder="e.g. HDFC Bank / State Bank of India"
            />
          </div>

          <div>
            <Label>Account Number</Label>
            <Input
              value={ownerBank.accountNumber}
              onChange={(e) => setOwnerBank({ ...ownerBank, accountNumber: e.target.value })}
              placeholder="e.g. 50200012345678"
            />
          </div>

          <div>
            <Label>Bank IFSC Code</Label>
            <Input
              value={ownerBank.ifscCode}
              onChange={(e) => setOwnerBank({ ...ownerBank, ifscCode: e.target.value.toUpperCase() })}
              placeholder="e.g. HDFC0000123"
            />
          </div>

          <div className="sm:col-span-2">
            <Label>UPI ID (Google Pay / PhonePe / Paytm / BHIM)</Label>
            <Input
              value={ownerBank.upiId}
              onChange={(e) => setOwnerBank({ ...ownerBank, upiId: e.target.value.toLowerCase() })}
              placeholder="e.g. v2business@okhdfcbank"
            />
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => saveSettingsMutation.mutate()}
          disabled={saveSettingsMutation.isPending}
          className="font-bold px-8 shadow-lg"
        >
          {saveSettingsMutation.isPending ? "Saving..." : "Save Pricing & Bank Details"}
        </Button>
      </Card>
    </div>
  );
}

export default AdminVendorPlansPage;
