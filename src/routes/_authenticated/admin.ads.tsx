import { createFileRoute } from "@tanstack/react-router";
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
  Search,
  Check,
  X,
  Copy,
  DollarSign,
  TrendingUp,
  Store,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";

export const Route = createFileRoute("/_authenticated/admin/ads")({
  component: AdminAdsPage,
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

function AdminAdsPage() {
  const [ads, setAds] = useState<SpotlightAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [search, setSearch] = useState("");
  const [previewAd, setPreviewAd] = useState<SpotlightAd | null>(null);

  // Reject dialog state
  const [rejectingAd, setRejectingAd] = useState<SpotlightAd | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadAds = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminSpotlightAds();
      setAds(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load ad requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleApprove = async (ad: SpotlightAd) => {
    setActionLoading(true);
    try {
      await api.updateAdminSpotlightAdStatus(ad.id, "APPROVED", "Payment & poster verified by admin.");
      toast.success(`Spotlight Ad for "${ad.storeName}" approved & scheduled for ${ad.targetDate}!`);
      loadAds();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve ad");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAd) return;
    if (!rejectReason.trim()) return toast.error("Please enter a rejection reason.");

    setActionLoading(true);
    try {
      await api.updateAdminSpotlightAdStatus(rejectingAd.id, "REJECTED", rejectReason.trim());
      toast.success(`Ad for "${rejectingAd.storeName}" rejected with feedback.`);
      setRejectingAd(null);
      setRejectReason("");
      loadAds();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject ad");
    } finally {
      setActionLoading(false);
    }
  };

  const copyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    toast.success(`UTR ${utr} copied!`);
  };

  const today = new Date().toISOString().split("T")[0];

  // Stats calculation
  const totalRequests = ads.length;
  const pendingCount = ads.filter((a) => a.status === "PENDING").length;
  const approvedCount = ads.filter((a) => a.status === "APPROVED").length;
  const totalRevenue = ads
    .filter((a) => a.status === "APPROVED")
    .reduce((sum, a) => sum + (a.paymentAmount || 499), 0);

  const filteredAds = ads.filter((ad) => {
    if (filter !== "ALL" && ad.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ad.storeName?.toLowerCase().includes(q) ||
        ad.title?.toLowerCase().includes(q) ||
        ad.paymentUtr?.toLowerCase().includes(q) ||
        ad.vendorEmail?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            Homepage Spotlight Ads (1 Vendor / Day)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review merchant ad requests, verify UPI payments & posters, and manage live landing page popups.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={loadAds}
          className="rounded-full font-bold gap-1.5 self-start"
        >
          <span>Refresh Requests</span>
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border-border bg-card shadow-xs">
          <span className="text-xs text-muted-foreground font-semibold">Total Ad Requests</span>
          <div className="text-2xl font-black text-foreground mt-1">{totalRequests}</div>
        </Card>
        <Card className="p-4 rounded-2xl border-amber-500/30 bg-amber-500/5 shadow-xs">
          <span className="text-xs text-amber-800 dark:text-amber-200 font-bold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-amber-600" /> Pending Review
          </span>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{pendingCount}</div>
        </Card>
        <Card className="p-4 rounded-2xl border-emerald-500/30 bg-emerald-500/5 shadow-xs">
          <span className="text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Scheduled / Approved
          </span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{approvedCount}</div>
        </Card>
        <Card className="p-4 rounded-2xl border-border bg-card shadow-xs">
          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-primary" /> Ad Revenue Collected
          </span>
          <div className="text-2xl font-black text-foreground mt-1">₹{totalRevenue.toLocaleString("en-IN")}</div>
        </Card>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex rounded-full bg-muted p-1 border border-border w-full sm:w-auto">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === tab
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ALL" && "All Ads"}
              {tab === "PENDING" && `Pending (${pendingCount})`}
              {tab === "APPROVED" && "Approved"}
              {tab === "REJECTED" && "Rejected"}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search store, title, UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-full text-xs"
          />
        </div>
      </div>

      {/* Ads List Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Loading ad requests...</div>
      ) : filteredAds.length === 0 ? (
        <Card className="p-10 rounded-2xl border-dashed border-2 text-center space-y-2">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-foreground">No Ad Requests Found</h3>
          <p className="text-xs text-muted-foreground">
            {filter === "PENDING"
              ? "No pending ad requests requiring verification right now."
              : "No ads match your selected filters."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAds.map((ad) => {
            const isToday = ad.targetDate === today;
            return (
              <Card key={ad.id} className="overflow-hidden rounded-2xl border border-border shadow-xs flex flex-col justify-between">
                {/* Poster image preview */}
                <div className="relative h-44 w-full bg-stone-900 overflow-hidden group">
                  <img
                    src={ad.bannerUrl}
                    alt={ad.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Top Status Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {isToday && ad.status === "APPROVED" && (
                      <Badge className="bg-amber-400 text-black font-black animate-pulse shadow-md">
                        🔥 LIVE TODAY
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    {ad.status === "APPROVED" && (
                      <Badge className="bg-emerald-600 text-white font-bold gap-1 shadow-sm">
                        <CheckCircle2 className="h-3 w-3" /> Approved
                      </Badge>
                    )}
                    {ad.status === "PENDING" && (
                      <Badge className="bg-amber-500 text-black font-bold gap-1 shadow-sm">
                        <Clock className="h-3 w-3" /> Pending Review
                      </Badge>
                    )}
                    {ad.status === "REJECTED" && (
                      <Badge variant="destructive" className="font-bold gap-1 shadow-sm">
                        <XCircle className="h-3 w-3" /> Rejected
                      </Badge>
                    )}
                  </div>

                  {/* Bottom Image Overlay text */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                      {ad.storeName}
                    </span>
                    <h4 className="text-sm font-bold truncate drop-shadow-sm">{ad.title}</h4>
                  </div>
                </div>

                {/* Card Content & Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" /> Booked Date:
                      </span>
                      <span className="font-bold text-foreground">{ad.targetDate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5 text-primary" /> Payment UTR:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-foreground">{ad.paymentUtr}</span>
                        <button
                          type="button"
                          onClick={() => copyUtr(ad.paymentUtr)}
                          className="text-muted-foreground hover:text-foreground p-0.5"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-emerald-600">₹{ad.paymentAmount || 499}</span>
                    </div>

                    {ad.subtitle && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded-lg">
                        {ad.subtitle}
                      </p>
                    )}

                    {ad.adminNotes && (
                      <div className="p-2 rounded-lg bg-muted text-[11px] text-muted-foreground">
                        <strong>Admin Notes:</strong> {ad.adminNotes}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewAd(ad)}
                      className="w-full rounded-xl text-xs font-bold gap-1"
                    >
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      <span>Preview Popup Modal</span>
                    </Button>

                    {ad.status === "PENDING" && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleApprove(ad)}
                          className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve Ad</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionLoading}
                          onClick={() => {
                            setRejectingAd(ad);
                            setRejectReason("");
                          }}
                          className="rounded-xl font-bold text-xs gap-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* REJECT MODAL */}
      <Dialog open={Boolean(rejectingAd)} onOpenChange={(open) => !open && setRejectingAd(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-1.5">
              <XCircle className="h-5 w-5" />
              Reject Spotlight Ad Request
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide feedback for {rejectingAd?.storeName} explaining why this ad cannot be approved.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReject} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="reason" className="text-xs font-bold">
                Rejection Reason / Feedback *
              </Label>
              <Input
                id="reason"
                placeholder="e.g. UTR payment not received, or image is blurry."
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1 h-10 rounded-xl text-sm"
              />
            </div>

            <DialogFooter className="gap-2 sm:justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl"
                onClick={() => setRejectingAd(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={actionLoading}
                className="rounded-xl font-bold"
              >
                {actionLoading ? "Rejecting…" : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* POPUP SIMULATOR MODAL (Exact Landing Page Preview) */}
      <Dialog open={Boolean(previewAd)} onOpenChange={(open) => !open && setPreviewAd(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-card">
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
                    ⭐ Today's Brand Spotlight
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
                    Target Date: <strong className="text-foreground">{previewAd.targetDate}</strong>
                  </div>
                  <Button
                    onClick={() => {
                      toast.info(`Will navigate to ${previewAd.targetUrl} on click.`);
                      setPreviewAd(null);
                    }}
                    className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold text-xs px-5 shadow-lg gap-1.5"
                  >
                    <span>{previewAd.buttonText || "Shop Deals Now"}</span>
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
