import { createFileRoute } from "@tanstack/react-router";
import { useMyVendor } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ArrowRight,
  Plus,
  Copy,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";

export const Route = createFileRoute("/_authenticated/vendor/ads")({
  component: VendorAdsPage,
});

interface SpotlightAd {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  storeName: string;
  title: string;
  subtitle?: string;
  bannerUrl: string;
  targetUrl: string;
  buttonText: string;
  targetDate: string;
  paymentAmount: number;
  paymentUtr: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  adminNotes?: string;
  createdAt: string;
}

function VendorAdsPage() {
  const { data: vendor } = useMyVendor();
  const [ads, setAds] = useState<SpotlightAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewAd, setPreviewAd] = useState<SpotlightAd | null>(null);

  // Form state
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    bannerUrl: "",
    targetUrl: "",
    buttonText: "Shop Deals Now",
    targetDate: tomorrow,
    paymentAmount: 499,
    paymentUtr: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadAds = async () => {
    try {
      setLoading(true);
      const data = await api.getVendorSpotlightAds();
      setAds(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load ads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, [vendor?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Please enter an ad title / headline.");
    if (!form.bannerUrl.trim()) return toast.error("Please provide a poster image URL.");
    if (!form.paymentUtr.trim()) return toast.error("Please enter your payment UTR / Transaction ID.");
    if (!form.targetDate) return toast.error("Please choose a date for your ad.");

    setSubmitting(true);
    try {
      await api.createVendorSpotlightAd({
        ...form,
        storeName: vendor?.business_name || vendor?.name || "Verified Merchant",
        targetUrl: form.targetUrl || (vendor?.slug ? `/store/${vendor.slug}` : "/search"),
      });
      toast.success("Ad submitted successfully! Admin will verify your payment and activate it.");
      setIsCreateOpen(false);
      setForm({
        title: "",
        subtitle: "",
        bannerUrl: "",
        targetUrl: "",
        buttonText: "Shop Deals Now",
        targetDate: tomorrow,
        paymentAmount: 499,
        paymentUtr: "",
      });
      loadAds();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit ad");
    } finally {
      setSubmitting(false);
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText("v2business@upi");
    toast.success("UPI ID 'v2business@upi' copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with High-Value Proposition */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-200 border border-amber-300/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Exclusive 1 Vendor Per Day Promotion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Homepage Popup Ad Spotlight
          </h1>
          <p className="text-sm text-amber-100/90 leading-relaxed font-medium">
            Get 100% of visitor attention. On your booked day, your custom branded popup greets every buyer arriving on V2 Business with a direct button to your store.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-full bg-white text-stone-900 font-extrabold hover:bg-amber-100 shadow-md gap-2 h-10 px-5 text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4 text-amber-600" />
              <span>Book a Spotlight Day (₹499)</span>
            </Button>

            <div className="flex items-center gap-2 text-xs text-amber-100 font-medium">
              <ShieldCheck className="h-4 w-4 text-amber-300" />
              <span>Admin Verified & Instant Activation</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-5 opacity-10 hidden sm:block">
          <Store className="h-48 w-48 text-white" />
        </div>
      </div>

      {/* How It Works Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl border-border bg-card shadow-xs space-y-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 font-black text-sm">
            1
          </div>
          <h3 className="font-bold text-sm text-foreground">1. Pay ₹499 to Owner UPI</h3>
          <p className="text-xs text-muted-foreground">
            Pay the daily promotion fee to <span className="font-bold text-foreground">v2business@upi</span> and copy your UTR transaction ID.
          </p>
        </Card>

        <Card className="p-5 rounded-2xl border-border bg-card shadow-xs space-y-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 font-black text-sm">
            2
          </div>
          <h3 className="font-bold text-sm text-foreground">2. Upload Poster & Pick Date</h3>
          <p className="text-xs text-muted-foreground">
            Choose your preferred date, headline, poster image, and store link for maximum clicks and sales.
          </p>
        </Card>

        <Card className="p-5 rounded-2xl border-border bg-card shadow-xs space-y-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 font-black text-sm">
            3
          </div>
          <h3 className="font-bold text-sm text-foreground">3. Admin Approves & Popup Goes Live</h3>
          <p className="text-xs text-muted-foreground">
            Admin verifies payment and poster. On your booked date, your popup automatically appears to all buyers!
          </p>
        </Card>
      </div>

      {/* My Booked Spotlight Ads */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">My Spotlight Ad Bookings</h2>
            <p className="text-xs text-muted-foreground">Track review status, scheduled dates, and preview your ads</p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-full font-bold gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Ad Request</span>
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading your booked ads...</div>
        ) : ads.length === 0 ? (
          <Card className="p-10 rounded-2xl border-dashed border-2 text-center space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-foreground">No Spotlight Ads Booked Yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Book your first 24-hour exclusive homepage popup ad and put your store directly in front of thousands of daily shoppers.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-full font-bold text-xs"
            >
              Book Spotlight Ad for ₹499
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => (
              <Card key={ad.id} className="overflow-hidden rounded-2xl border border-border shadow-xs hover:shadow-md transition-shadow flex flex-col">
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  <img
                    src={ad.bannerUrl}
                    alt={ad.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5">
                    {ad.status === "APPROVED" && (
                      <Badge className="bg-emerald-600 text-white font-bold gap-1 shadow-sm">
                        <CheckCircle2 className="h-3 w-3" /> Approved & Scheduled
                      </Badge>
                    )}
                    {ad.status === "PENDING" && (
                      <Badge className="bg-amber-500 text-black font-bold gap-1 shadow-sm">
                        <Clock className="h-3 w-3" /> Pending Admin Review
                      </Badge>
                    )}
                    {ad.status === "REJECTED" && (
                      <Badge variant="destructive" className="font-bold gap-1 shadow-sm">
                        <XCircle className="h-3 w-3" /> Rejected
                      </Badge>
                    )}
                    {ad.status === "EXPIRED" && (
                      <Badge variant="secondary" className="font-bold">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mb-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>Booked Date: <strong className="text-foreground">{ad.targetDate}</strong></span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground line-clamp-1">{ad.title}</h3>
                    {ad.subtitle && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{ad.subtitle}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>UTR Reference:</span>
                      <span className="font-mono font-bold text-foreground">{ad.paymentUtr}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Amount Paid:</span>
                      <span className="font-bold text-emerald-600">₹{ad.paymentAmount}</span>
                    </div>

                    {ad.adminNotes && (
                      <div className="p-2 rounded-lg bg-muted text-[11px] text-muted-foreground mt-2">
                        <strong>Admin Feedback:</strong> {ad.adminNotes}
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewAd(ad)}
                        className="w-full rounded-xl text-xs font-bold gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview Popup</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CREATE SPOTLIGHT AD DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Book Homepage Popup Spotlight
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Fill in your campaign details and verify payment to book your exclusive 24-hour brand popup.
            </DialogDescription>
          </DialogHeader>

          {/* Payment Box */}
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-amber-600" />
                Step 1: Pay Daily Ad Fee (₹499)
              </span>
              <Badge className="bg-amber-500 text-black font-extrabold text-[10px]">
                ₹499 FLAT / 24 HRS
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Send ₹499 via Google Pay / PhonePe / Paytm to:
            </p>
            <div className="flex items-center justify-between bg-card p-2 rounded-xl border border-border">
              <span className="font-mono font-bold text-sm text-foreground">v2business@upi</span>
              <Button size="sm" variant="ghost" onClick={copyUpi} className="h-7 text-xs gap-1 font-bold">
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="targetDate" className="text-xs font-bold">
                  Spotlight Date *
                </Label>
                <Input
                  id="targetDate"
                  type="date"
                  min={tomorrow}
                  required
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                  className="mt-1 h-10 rounded-xl text-sm"
                />
              </div>
              <div>
                <Label htmlFor="paymentUtr" className="text-xs font-bold">
                  Payment UTR / Transaction ID *
                </Label>
                <Input
                  id="paymentUtr"
                  placeholder="e.g. 423985123984"
                  required
                  value={form.paymentUtr}
                  onChange={(e) => setForm({ ...form, paymentUtr: e.target.value })}
                  className="mt-1 h-10 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title" className="text-xs font-bold">
                Offer Title / Headline *
              </Label>
              <Input
                id="title"
                placeholder="e.g. 50% Off Mega Diwali Sale on Silk Sarees!"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 h-10 rounded-xl text-sm"
              />
            </div>

            <div>
              <Label htmlFor="subtitle" className="text-xs font-bold">
                Short Highlight / Description
              </Label>
              <Input
                id="subtitle"
                placeholder="e.g. Handcrafted gold jewellery & bridal sets with insured home delivery."
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="mt-1 h-10 rounded-xl text-sm"
              />
            </div>

            <div>
              <Label htmlFor="bannerUrl" className="text-xs font-bold">
                Ad Poster Image URL *
              </Label>
              <Input
                id="bannerUrl"
                placeholder="https://images.unsplash.com/... or uploaded poster link"
                required
                value={form.bannerUrl}
                onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                className="mt-1 h-10 rounded-xl text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Recommended aspect ratio 16:9 or 4:3 (High resolution banner)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="targetUrl" className="text-xs font-bold">
                  Destination Link
                </Label>
                <Input
                  id="targetUrl"
                  placeholder={`/store/${vendor?.slug || "my-store"}`}
                  value={form.targetUrl}
                  onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                  className="mt-1 h-10 rounded-xl text-sm"
                />
              </div>
              <div>
                <Label htmlFor="buttonText" className="text-xs font-bold">
                  Button CTA Text
                </Label>
                <Input
                  id="buttonText"
                  placeholder="Shop Deals Now"
                  value={form.buttonText}
                  onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                  className="mt-1 h-10 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Poster Preview if entered */}
            {form.bannerUrl && (
              <div className="rounded-xl border border-border p-2 bg-muted/40">
                <span className="text-[11px] font-bold text-muted-foreground block mb-1">Poster Preview:</span>
                <img
                  src={form.bannerUrl}
                  alt="Preview"
                  className="h-32 w-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80";
                  }}
                />
              </div>
            )}

            <DialogFooter className="gap-2 sm:justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {submitting ? "Submitting Request…" : "Submit Ad for Admin Approval"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* POPUP PREVIEW MODAL */}
      <Dialog open={Boolean(previewAd)} onOpenChange={(open) => !open && setPreviewAd(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border border-amber-500/40 shadow-2xl bg-card">
          {previewAd && (
            <div className="relative">
              {/* Ad Image Header */}
              <div className="relative h-64 w-full bg-stone-900 overflow-hidden">
                <img
                  src={previewAd.bannerUrl}
                  alt={previewAd.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                <div className="absolute top-3 left-3">
                  <Badge className="bg-amber-400 text-black font-black text-[11px] tracking-wider uppercase px-2.5 py-1 shadow-lg gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    ⭐ Merchant of the Day
                  </Badge>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewAd(null)}
                  className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Bottom Overlay Text */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                    {previewAd.storeName}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black leading-tight drop-shadow-md">
                    {previewAd.title}
                  </h3>
                </div>
              </div>

              {/* Popup Body */}
              <div className="p-5 space-y-4 bg-card">
                {previewAd.subtitle && (
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                    {previewAd.subtitle}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-muted-foreground">
                    Scheduled for: <strong className="text-foreground">{previewAd.targetDate}</strong>
                  </div>
                  <Button
                    onClick={() => {
                      toast.info(`Will navigate to ${previewAd.targetUrl} when live.`);
                      setPreviewAd(null);
                    }}
                    className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold text-xs px-5 shadow-lg gap-1.5"
                  >
                    <span>{previewAd.buttonText || "Explore Store"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
