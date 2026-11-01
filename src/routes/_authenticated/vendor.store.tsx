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
import { StoreShareCard } from "@/components/store-share-card";
import { slugify } from "@/lib/utils-app";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MARKETPLACE_CATEGORIES } from "@/data/categories";
import {
  Store,
  Home,
  ShieldCheck,
  FileCheck2,
  MapPin,
  Camera,
  Sparkles,
  Building2,
  Tag,
  Check,
  X,
  Search,
  Layers,
  QrCode,
  Copy,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor/store")({
  component: VendorStore,
});

function VendorStore() {
  const { user } = useSession();
  const { data: vendor, refetch } = useMyVendor();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    category: "Clothing & Fashion",
    categories: ["Clothing & Fashion"] as string[],
    email: "",
    phone: "",
    businessType: "physical_shop" as "physical_shop" | "home_cloud",
    gstNumber: "",
    isGstExempt: false,
    address: "",
    city: "Rajahmundry",
    state: "Andhra Pradesh",
    pincode: "533101",
    shopPhotos: [] as string[],
    bankAccount: "",
    ifscCode: "",
    upiId: "",
    customQrUrl: "",
  });

  useEffect(() => {
    if (vendor || user) {
      let existingUpi = "";
      let existingQr = "";
      try {
        const payout = localStorage.getItem(`vendor_payout_${user?.id}`);
        if (payout) {
          const p = JSON.parse(payout);
          if (p.upiId) existingUpi = p.upiId;
          if (p.customQrUrl) existingQr = p.customQrUrl;
        }
      } catch {}

      const savedStore = localStorage.getItem(`vendor_store_${user?.id}`);
      if (savedStore) {
        try {
          const parsed = JSON.parse(savedStore);
          const initialCats = Array.isArray(parsed.categories) && parsed.categories.length > 0
            ? parsed.categories
            : parsed.category
            ? [parsed.category]
            : ["Clothing & Fashion"];
          setForm((prev) => ({
            ...prev,
            ...parsed,
            categories: initialCats,
            category: initialCats[0] || "Clothing & Fashion",
            upiId: parsed.upiId || existingUpi || "",
            customQrUrl: parsed.customQrUrl || existingQr || "",
          }));
          return;
        } catch {}
      }
      setForm((prev) => ({
        ...prev,
        name: vendor?.name || user?.name || "",
        slug: slugify(vendor?.name || user?.name || "my-store"),
        email: user?.email || "",
        upiId: existingUpi || "",
        customQrUrl: existingQr || "",
      }));
    }
  }, [vendor, user]);

  const toggleCategory = (catName: string) => {
    setForm((prev) => {
      const exists = prev.categories.includes(catName);
      let nextCats: string[];
      if (exists) {
        nextCats = prev.categories.filter((c) => c !== catName);
        if (nextCats.length === 0) {
          toast.warning("Store must belong to at least 1 category");
          return prev;
        }
      } else {
        nextCats = [...prev.categories, catName];
      }
      return {
        ...prev,
        categories: nextCats,
        category: nextCats[0] || "",
      };
    });
  };

  const save = async () => {
    if (!user) return;
    if (!form.name.trim()) return toast.error("Store name is required");
    const cleanedPhone = form.phone.replace(/\D/g, "");
    if (!form.phone.trim()) return toast.error("Contact phone number is required for store orders and buyer verification");
    if (cleanedPhone.length < 10) return toast.error("Please enter a valid 10-digit contact phone number");
    if (!form.city.trim() || !form.state.trim())
      return toast.error("City and State location are required for buyer verification");
    if (!form.address.trim())
      return toast.error("Street or store address is required for store location verification");

    const cleanUpi = form.upiId.trim();
    if (cleanUpi) {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(cleanUpi)) {
        return toast.error("Please enter a valid UPI ID (e.g. 9876543210@ybl, name@okhdfcbank, store@paytm)");
      }
    }

    setLoading(true);
    try {
      if (user.id && form.name !== user.name) {
        await api.updateUser(user.id, { name: form.name });
      }

      const updatedForm = {
        ...form,
        upiId: cleanUpi,
        customQrUrl: form.customQrUrl.trim(),
      };

      localStorage.setItem(`vendor_store_${user.id}`, JSON.stringify(updatedForm));
      if (updatedForm.slug) {
        localStorage.setItem(`vendor_store_${updatedForm.slug}`, JSON.stringify(updatedForm));
      }

      // Persist payout info for checkout resolution
      const payoutPayload = {
        accountHolder: updatedForm.name,
        upiId: cleanUpi,
        customQrUrl: form.customQrUrl.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`vendor_payout_${user.id}`, JSON.stringify(payoutPayload));

      // Sync active UPI ID into existing vendor products so all buyers on all devices get it immediately
      if (cleanUpi) {
        try {
          const rawProds: any = await api.getProducts({ vendorId: user.id });
          const prodsList: any[] = rawProds?.data ?? (Array.isArray(rawProds) ? rawProds : []);
          for (const p of prodsList) {
            const rawTags: string[] = Array.isArray(p.tags) ? p.tags.filter((t: string) => !t.startsWith("upi:") && !t.startsWith("qr:")) : [];
            rawTags.push(`upi:${cleanUpi}`);
            if (form.customQrUrl.trim()) rawTags.push(`qr:${form.customQrUrl.trim()}`);
            const nextDimensions = {
              ...(typeof p.dimensions === "object" && p.dimensions !== null ? p.dimensions : {}),
              upiId: cleanUpi,
              vendorUpi: cleanUpi,
              customQrUrl: form.customQrUrl.trim() || undefined,
            };
            await api.updateProduct(p.id, {
              tags: rawTags,
              dimensions: nextDimensions,
            }).catch(() => {});
          }
        } catch (syncErr) {
          console.warn("Could not sync UPI to products:", syncErr);
        }
      }

      toast.success("Store credentials, UPI payment details & verification updated successfully!");
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
        <h1 className="text-2xl font-bold tracking-tight">Seller Profile & Store Setup</h1>
        <p className="text-sm text-muted-foreground">
          Manage your business credentials, GST details, location, and storefront presentation.
        </p>
      </div>

      {/* Public Storefront Share Banner */}
      <StoreShareCard
        storeSlug={form.slug || slugify(form.name) || vendor?.id || user?.id || "my-store"}
        storeName={form.name || vendor?.name || "My Store"}
      />

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
              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-bold flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-primary" /> Store Industry Categories (Multi-Select Allowed) *
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Select one or multiple categories your store operates in. Your store and products will be listed in every category you select!
                    </p>
                  </div>
                  <Badge variant="outline" className="font-bold text-xs bg-primary/10 text-primary border-primary/30">
                    {form.categories.length} Selected
                  </Badge>
                </div>

                {/* Selected categories pills */}
                <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2.5 rounded-xl border border-border bg-muted/30">
                  {form.categories.map((cName) => (
                    <span
                      key={cName}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 shadow-xs animate-in fade-in"
                    >
                      <Check className="h-3 w-3" /> {cName}
                      <button
                        type="button"
                        onClick={() => toggleCategory(cName)}
                        className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Category quick search & selector grid */}
                <div className="space-y-2 pt-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search across all 30 marketplace categories to add/remove..."
                      value={catSearch}
                      onChange={(e) => setCatSearch(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto p-1.5 border rounded-xl bg-card">
                    {MARKETPLACE_CATEGORIES.filter((c) =>
                      c.name.toLowerCase().includes(catSearch.toLowerCase())
                    ).map((cat) => {
                      const isSelected = form.categories.includes(cat.name);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.name)}
                          className={`flex items-center justify-between p-2 rounded-lg text-left text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-primary/15 border-2 border-primary text-primary font-bold shadow-xs"
                              : "bg-muted/40 hover:bg-muted border border-border/60 text-foreground"
                          }`}
                        >
                          <span className="truncate pr-1">{cat.name}</span>
                          {isSelected ? (
                            <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                          ) : (
                            <span className="h-4 w-4 rounded-full border border-muted-foreground/40 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
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
                <Label>Contact Phone *</Label>
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
              Entering a valid 15-digit Indian GSTIN displays your official business tax registration.
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

          {/* 6. Direct UPI Payments & Shop QR Standee */}
          <Card className="p-6 space-y-5 border-2 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
                  <QrCode className="h-5 w-5 text-emerald-600" /> 6. Direct Customer UPI Payments & Shop QR Standee
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customers scan your QR code at checkout to pay directly into your account with 0% platform fee.
                </p>
              </div>
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs font-bold py-1 px-2.5">
                0% Fee • Instant Direct Settlement
              </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold text-foreground">
                    Seller UPI ID / VPA (Google Pay / PhonePe / Paytm / BHIM) *
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      placeholder="e.g. 9876543210@ybl or yourstore@okhdfcbank"
                      value={form.upiId}
                      onChange={(e) => setForm({ ...form, upiId: e.target.value.trim() })}
                      className="font-mono text-sm font-bold bg-background border-emerald-500/40 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">Examples:</span>
                    <span>9876543210@ybl</span>
                    <span>• name@okhdfcbank</span>
                    <span>• 9876543210@paytm</span>
                    <span>• store@okaxis</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-foreground">
                    Optional: Upload Official Shop QR Standee Photo
                  </Label>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    Already have a physical shop QR standee (PhonePe / Google Pay / Paytm)? Upload a clear photo here to display your actual merchant standee at checkout!
                  </p>
                  <ImageUploader
                    value={form.customQrUrl ? [form.customQrUrl] : []}
                    onChange={(imgs) => setForm({ ...form, customQrUrl: imgs[0] || "" })}
                    maxImages={1}
                    folderPrefix={`vendors/${user?.id || "store"}/qr`}
                  />
                </div>
              </div>

              {/* Live Test Preview */}
              <div className="rounded-xl border border-emerald-500/30 bg-background/80 p-4 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Live Test UPI QR Preview
                </span>
                {form.upiId && /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(form.upiId) ? (
                  <>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-300 shadow-sm">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                          `upi://pay?pa=${form.upiId}&pn=${encodeURIComponent(form.name || "Seller")}&cu=INR&tn=${encodeURIComponent(`Test - ${form.name || "Seller"}`)}`
                        )}`}
                        alt="Test UPI QR"
                        className="h-36 w-36 object-contain rounded-lg"
                      />
                    </div>
                    <code className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-muted">
                      {form.upiId}
                    </code>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      ✓ Valid UPI ID! Scan with PhonePe / GPay on your phone to test before publishing.
                    </p>
                  </>
                ) : (
                  <div className="py-8 px-4 text-center space-y-2">
                    <QrCode className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      Enter your valid UPI ID on the left to see your live test QR code.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* 7. Settlement Bank Details */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> 7. Backup Bank Account (Direct Net Settlements)
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
                categories: form.categories,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorStore;
