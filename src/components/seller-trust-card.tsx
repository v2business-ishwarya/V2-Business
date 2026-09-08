import * as React from "react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Store,
  Home,
  ShieldCheck,
  MapPin,
  FileCheck2,
  ExternalLink,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export interface VendorTrustData {
  id?: string;
  name?: string;
  slug?: string;
  businessType?: "physical_shop" | "home_cloud";
  gstNumber?: string;
  isGstExempt?: boolean;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  shopPhotos?: string[];
  avatarUrl?: string;
  joinedYear?: string | number;
  rating?: number;
  totalOrders?: number;
}

interface SellerTrustCardProps {
  vendor: VendorTrustData;
  className?: string;
  compact?: boolean;
}

export function SellerTrustCard({ vendor, className = "", compact = false }: SellerTrustCardProps) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const isPhysical = vendor.businessType !== "home_cloud";
  const hasGst = Boolean(vendor.gstNumber && vendor.gstNumber.trim().length >= 10);
  const locationText = [vendor.city, vendor.state].filter(Boolean).join(", ") || vendor.address || "Verified Indian Seller";
  const photos = vendor.shopPhotos && vendor.shopPhotos.length > 0 ? vendor.shopPhotos : [];
  const primaryPhoto = photos[0] || null;

  const openPhotoModal = (url?: string) => {
    setSelectedPhoto(url || primaryPhoto);
    setPhotoOpen(true);
  };

  return (
    <>
      <div
        className={`rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background to-teal-500/5 p-4 sm:p-5 shadow-sm transition-all hover:border-emerald-500/40 ${className}`}
      >
        {/* Header with Badges */}
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
              {isPhysical ? <Store className="h-5 w-5" /> : <Home className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-foreground">
                  {vendor.name || "Verified Marketplace Vendor"}
                </span>
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1 text-[10px] px-2 py-0.2 shadow-sm font-semibold">
                  <ShieldCheck className="h-3 w-3" /> 100% Genuine
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPhysical ? "🏪 Physical Retail Store" : "🏡 Home-based Studio / Direct Maker"}
              </p>
            </div>
          </div>

          {vendor.id && (
            <Link
              to="/store/$slug"
              params={{ slug: vendor.slug || vendor.id }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Visit Store <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>

        {/* Verification Checkpoints Grid */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Location Verification */}
          <div className="flex items-center gap-2 rounded-lg bg-card/80 p-2 border border-border/50">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Store Location
              </span>
              <span className="font-semibold text-foreground truncate block">
                {locationText} {vendor.pincode ? `(${vendor.pincode})` : ""}
              </span>
            </div>
          </div>

          {/* GST Verification */}
          <div className="flex items-center gap-2 rounded-lg bg-card/80 p-2 border border-border/50">
            <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                GST Tax Compliance
              </span>
              <span className="font-semibold text-foreground truncate block">
                {hasGst ? (
                  <span className="text-emerald-700 font-bold">
                    GSTIN: {vendor.gstNumber} (Verified)
                  </span>
                ) : (
                  <span className="text-muted-foreground">GST Exempt / Micro-Seller</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Shop / Workspace Photo Verification Showcase */}
        {primaryPhoto && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                onClick={() => openPhotoModal(primaryPhoto)}
                className="relative h-12 w-12 rounded-xl overflow-hidden border-2 border-emerald-500/30 cursor-pointer hover:opacity-90 shrink-0 shadow-sm"
              >
                <img src={primaryPhoto} alt="Shop verification photo" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white drop-shadow" />
                </div>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground">
                  {isPhysical ? "Verified Storefront Photo" : "Verified Studio Workspace"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Inspected & authenticated by V2 Platform
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openPhotoModal(primaryPhoto)}
              className="h-8 text-xs font-semibold rounded-lg shrink-0"
            >
              View Photo
            </Button>
          </div>
        )}

        {/* Anti-Fraud Trust Seal Footer */}
        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Buyer Escrow Protection Active
          </span>
          <span>7-Day Easy Returns</span>
        </div>
      </div>

      {/* Photo Modal */}
      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              {isPhysical ? "Storefront & Signboard Verification" : "Workshop & Workspace Verification"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="aspect-video w-full rounded-2xl overflow-hidden border bg-muted shadow-inner">
              {selectedPhoto && (
                <img
                  src={selectedPhoto}
                  alt="Verified store"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="rounded-xl bg-muted/60 p-3 text-xs space-y-1">
              <p className="font-bold text-foreground">{vendor.name}</p>
              <p className="text-muted-foreground">{vendor.address || locationText}</p>
              {hasGst && <p className="text-emerald-700 font-semibold">GSTIN: {vendor.gstNumber}</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SellerTrustCard;
