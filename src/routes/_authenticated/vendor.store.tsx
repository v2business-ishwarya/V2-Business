import { createFileRoute } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useSession } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "@/components/image-uploader";
import { SellerTrustCard } from "@/components/seller-trust-card";
import { slugify } from "@/lib/utils-app";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Store,
  Home,
  ShieldCheck,
  FileCheck2,
  MapPin,
  Camera,
  Sparkles,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor/store")({
  component: VendorStore,
});

function VendorStore() {
  const { user } = useSession();
  const { data: vendor, refetch } = useMyVendor();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    email: "",
    phone: "",
    businessType: "physical_shop" as "physical_shop" | "home_cloud",
    gstNumber: "",
    isGstExempt: false,
    address: "",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "",
    shopPhotos: [] as string[],
    bankAccount: "",
    ifscCode: "",
  });

  useEffect(() => {
    if (vendor || user) {
      const savedStore = localStorage.getItem(`vendor_store_${user?.id}`);
      if (savedStore) {
        try {
          const parsed = JSON.parse(savedStore);
          setForm((prev) => ({ ...prev, ...parsed }));
          return;
        } catch {}
      }
      setForm((prev) => ({
        ...prev,
        name: vendor?.name || user?.name || "",
        slug: slugify(vendor?.name || user?.name || "my-store"),
        email: user?.email || "",
      }));
    }
  }, [vendor, user]);

  const save = async () => {
    if (!user) return;
    if (!form.name.trim()) return toast.error("Store name is required");
    if (!form.city.trim() || !form.state.trim())
      return toast.error("City and State location are required for buyer verification");

    setLoading(true);
    try {
      if (user.id && form.name !== user.name) {
        await api.updateUser(user.id, { name: form.name });
      }
      localStorage.setItem(`vendor_store_${user.id}`, JSON.stringify(form));
      toast.success("Store credentials & verification details updated successfully!");
      qc.invalidateQueries();
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save store profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seller Profile & Verification</h1>
        <p className="text-sm text-muted-foreground">
          Manage your business credentials, GST details, location, and shop photos to earn the <strong>Verified Seller</strong> badge.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Form (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Business Operational Model */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> 1. Business Operational Type
            </h2>
            <p className="text-xs text-muted-foreground">
              Select where you operate your business from. This builds buyer confidence and transparency.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div
                onClick={() => setForm({ ...form, businessType: "physical_shop" })}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col justify-between ${
                  form.businessType === "physical_shop"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Physical Retail Shop</h3>
                    <p className="text-xs text-muted-foreground">Commercial storefront / showroom</p>
                  </div>
                </div>
                <Badge variant={form.businessType === "physical_shop" ? "default" : "outline"} className="mt-4 self-start text-[11px]">
                  {form.businessType === "physical_shop" ? "Selected" : "Select Physical Store"}
                </Badge>
              </div>

              <div
                onClick={() => setForm({ ...form, businessType: "home_cloud" })}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col justify-between ${
                  form.businessType === "home_cloud"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Home Studio / Cloud Maker</h3>
                    <p className="text-xs text-muted-foreground">Home workshop or direct craft studio</p>
                  </div>
                </div>
                <Badge variant={form.businessType === "home_cloud" ? "default" : "outline"} className="mt-4 self-start text-[11px]">
                  {form.businessType === "home_cloud" ? "Selected" : "Select Home/Cloud"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* 2. Store Branding & Identity */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> 2. Store Branding & Identity
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Store / Business Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })
                  }
                  placeholder="e.g. Royal Silk Handlooms"
                />
              </div>
              <div>
                <Label>Store URL Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  placeholder="royal-silk-handlooms"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Store Tagline</Label>
                <Input
                  placeholder="e.g. Authentic handwoven Banarasi sarees straight from master weavers"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Store Description</Label>
                <Textarea
                  rows={3}
                  placeholder="Tell buyers about your heritage, craftsmanship, and why they can trust your products."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* 3. GST & Tax Compliance */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-primary" /> 3. GST & Legal Tax Details
            </h2>
            <p className="text-xs text-muted-foreground">
              Entering a valid 15-digit Indian GSTIN grants your store the <strong>GST Verified</strong> trust seal.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>GSTIN Number (Optional for small sellers)</Label>
                <Input
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  maxLength={15}
                  value={form.gstNumber}
                  onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase().trim() })}
                  disabled={form.isGstExempt}
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isGstExempt}
                    onChange={(e) => setForm({ ...form, isGstExempt: e.target.checked, gstNumber: e.target.checked ? "" : form.gstNumber })}
                    className="rounded text-primary"
                  />
                  I am a small artisan / GST Exempt seller
                </label>
              </div>
            </div>
          </Card>

          {/* 4. Location & Address Verification */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> 4. Storefront / Workshop Address
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <Label>Street / Building Address *</Label>
                <Input
                  placeholder="Shop #12, Commercial Street / 4th Cross Home Studio"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div>
                <Label>City *</Label>
                <Input
                  placeholder="e.g. Bangalore"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <Label>State *</Label>
                <Input
                  placeholder="e.g. Karnataka"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
              <div>
                <Label>Pincode *</Label>
                <Input
                  placeholder="e.g. 560001"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* 5. Real Shop / Studio Photo Upload */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" /> 5. Real {form.businessType === "physical_shop" ? "Shop & Signboard" : "Studio / Workspace"} Photos
            </h2>
            <p className="text-xs text-muted-foreground">
              Upload real photos of your {form.businessType === "physical_shop" ? "storefront, counter, or showroom" : "craft workspace, equipment, or packing table"}. Customers can view this photo before buying to verify your authenticity.
            </p>

            <ImageUploader
              value={form.shopPhotos}
              onChange={(photos) => setForm({ ...form, shopPhotos: photos })}
              maxImages={4}
              folderPrefix={`vendors/${user?.id || "store"}/verification`}
            />
          </Card>

          {/* 6. Settlement Bank Details */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> 6. Payout Bank Account (100% Direct Net Settlements)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Bank Account Number</Label>
                <Input
                  placeholder="e.g. 9876543210123"
                  value={form.bankAccount}
                  onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                />
              </div>
              <div>
                <Label>Bank IFSC Code</Label>
                <Input
                  placeholder="e.g. HDFC0001234"
                  value={form.ifscCode}
                  onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
          </Card>

          <Button size="lg" className="w-full sm:w-auto font-bold px-8 shadow-lg" onClick={save} disabled={loading}>
            {loading ? "Saving Credentials..." : "Save Store & Verification Profile"}
          </Button>
        </div>

        {/* Live Buyer Trust Preview (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Live Customer Trust Preview
              </span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700">
                Buyer View
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              This is the official <strong>Seller Verification Card</strong> that will be displayed to every customer on your product pages before they add items to cart:
            </p>

            <SellerTrustCard
              vendor={{
                id: user?.id || "demo",
                name: form.name || "Your Store Name",
                slug: form.slug || "your-store",
                businessType: form.businessType,
                gstNumber: form.gstNumber,
                isGstExempt: form.isGstExempt,
                address: form.address,
                city: form.city,
                state: form.state,
                pincode: form.pincode,
                shopPhotos: form.shopPhotos,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorStore;
