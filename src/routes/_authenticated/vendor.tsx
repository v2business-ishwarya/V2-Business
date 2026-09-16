import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { LayoutDashboard, Package, ShoppingBag, Store, Tag, BarChart3, Truck, CreditCard, FileText, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { storeSession, useSession } from "@/hooks/use-session";
import { toast } from "sonner";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { slugify } from "@/lib/utils-app";

export const Route = createFileRoute("/_authenticated/vendor")({
  head: () => ({ meta: [{ title: "Vendor — V2 Business" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const rawUser = localStorage.getItem("user");
    if (!localStorage.getItem("accessToken") || !rawUser) throw redirect({ to: "/auth" });
    const user = JSON.parse(rawUser);
    return { isVendor: user.role === "VENDOR" || user.role === "ADMIN" };
  },
  component: VendorLayout,
});

function VendorLayout() {
  const { isVendor } = Route.useRouteContext();
  if (!isVendor) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <VendorOnboardingForm />
      </div>
    );
  }
  return (
    <DashboardShell
      title="Vendor dashboard"
      nav={[
        { to: "/vendor", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: "/vendor/products", label: "Products", icon: <Package className="h-4 w-4" /> },
        { to: "/vendor/orders", label: "Orders & delivery", icon: <ShoppingBag className="h-4 w-4" /> },
        { to: "/vendor/coupons", label: "Discounts", icon: <Tag className="h-4 w-4" /> },
        { to: "/vendor/store", label: "Store profile", icon: <Store className="h-4 w-4" /> },
        { to: "/vendor/analytics", label: "Payments & analytics", icon: <BarChart3 className="h-4 w-4" /> },
        { to: "/vendor/delivery", label: "Delivery", icon: <Truck className="h-4 w-4" /> },
        { to: "/vendor/payments", label: "Payment providers", icon: <CreditCard className="h-4 w-4" /> },
        { to: "/vendor/invoices", label: "Invoices", icon: <FileText className="h-4 w-4" /> },
        { to: "/vendor/ads", label: "Spotlight Ads (₹499)", icon: <Sparkles className="h-4 w-4 text-amber-500" /> },
      ]}
    >
      <Outlet />
    </DashboardShell>
  );
}

function VendorOnboardingForm() {
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    storeName: user?.name || "",
    phone: "",
    city: "Rajahmundry",
    address: "",
    pincode: "533101",
    state: "Andhra Pradesh",
    businessType: "physical_shop" as "physical_shop" | "home_cloud",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/vendor" } });
      return;
    }

    const cleanedPhone = form.phone.replace(/\D/g, "");
    if (!form.storeName.trim()) {
      toast.error("Store or Business name is required.");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Contact phone number is required for vendor registration.");
      return;
    }
    if (cleanedPhone.length < 10) {
      toast.error("Please enter a valid 10-digit phone or mobile number.");
      return;
    }
    if (!form.city.trim()) {
      toast.error("City / Location name is required.");
      return;
    }
    if (!form.address.trim()) {
      toast.error("Store address or local street area is required for buyer verification.");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await api.becomeVendor();
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      storeSession({ accessToken: token, user: updatedUser });

      // Save complete store profile with verified location & phone number
      const storeData = {
        id: user.id,
        name: form.storeName.trim(),
        slug: slugify(form.storeName.trim()),
        phone: form.phone.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        state: form.state.trim() || "Andhra Pradesh",
        pincode: form.pincode.trim() || "533101",
        businessType: form.businessType,
        categories: ["General"],
        rating: 5.0,
        reviewCount: 1,
        joinedYear: 2026,
      };
      localStorage.setItem(`vendor_store_${user.id}`, JSON.stringify(storeData));

      if (user.id && form.storeName.trim() !== user.name) {
        await api.updateUser(user.id, { name: form.storeName.trim() }).catch(() => {});
      }

      toast.success(`🎉 Verified vendor profile registered in ${form.city.trim()}!`);
      navigate({ to: "/vendor", replace: true });
      window.location.reload();
    } catch (error: any) {
      if (!localStorage.getItem("accessToken")) {
        toast.error("Your session has expired. Please sign in again.");
        navigate({ to: "/auth", search: { redirect: "/vendor" } });
      } else {
        toast.error(error.message ?? "Unable to enable seller tools");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8 rounded-3xl border border-border/80 shadow-lg">
      <div className="text-center space-y-2 mb-6">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 shadow-inner">
          <Store className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Register as a Verified Vendor
        </h1>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          To sell on V2 Business, please provide your contact phone number and verified storefront location.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Store Name */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Store / Business Name *</Label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              placeholder="e.g. Royal Silk Handlooms"
              required
              className="pl-9 h-10 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center justify-between">
            <span>Contact Phone Number *</span>
            <span className="text-[10px] text-muted-foreground">Required for orders & buyer trust</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 9876543210 (10-digit mobile number)"
              required
              className="pl-9 h-10 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* City Location */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center justify-between">
            <span>City / Town Location *</span>
            <span className="text-[10px] text-muted-foreground">Used for marketplace search</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500" />
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Rajahmundry"
              required
              className="pl-9 h-10 rounded-xl text-xs"
            />
          </div>
          {/* Quick city suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-muted-foreground">Quick pick:</span>
            {["Rajahmundry", "Danavaipeta", "Kakinada", "Vijayawada", "Visakhapatnam", "Hyderabad"].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, city }))}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  form.city.toLowerCase() === city.toLowerCase()
                    ? "bg-rose-500 text-white border-rose-500 font-semibold"
                    : "bg-muted/60 text-foreground/80 border-border hover:bg-muted"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Store Address / Area */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Storefront Address / Street Area *</Label>
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="e.g. Shop #12, Commercial Street, Main Road"
            required
            className="h-10 rounded-xl text-xs"
          />
        </div>

        {/* Pincode & State */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Pincode</Label>
            <Input
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              placeholder="533101"
              className="h-10 rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">State</Label>
            <Input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="Andhra Pradesh"
              className="h-10 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Business Type */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Store Type</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, businessType: "physical_shop" })}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs transition-all ${
                form.businessType === "physical_shop"
                  ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                  : "border-border bg-card hover:bg-muted text-muted-foreground"
              }`}
            >
              <Building2 className="h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-[11px]">Retail Store</p>
                <p className="text-[9px] text-muted-foreground">Commercial shop</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, businessType: "home_cloud" })}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs transition-all ${
                form.businessType === "home_cloud"
                  ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                  : "border-border bg-card hover:bg-muted text-muted-foreground"
              }`}
            >
              <Store className="h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-[11px]">Home / Cloud Studio</p>
                <p className="text-[9px] text-muted-foreground">Online seller</p>
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
          <span>0% Commission · Instant Seller Tools · Verified Store Badge</span>
        </div>

        <Button
          type="submit"
          className="w-full rounded-2xl h-11 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25"
          disabled={loading || sessionLoading}
        >
          {loading ? "Activating Store…" : "Complete Registration & Activate Vendor"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
