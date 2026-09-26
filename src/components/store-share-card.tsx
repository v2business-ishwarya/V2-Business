import * as React from "react";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Download,
  Store,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface StoreShareProps {
  storeSlug: string;
  storeName?: string;
  className?: string;
  compact?: boolean;
}

export function StoreShareCard({
  storeSlug,
  storeName = "My Store",
  className = "",
  compact = false,
}: StoreShareProps) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const storePath = `/store/${encodeURIComponent(storeSlug)}`;
  const fullUrl = origin ? `${origin}${storePath}` : storePath;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const input = document.createElement("input");
        input.value = fullUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      toast.success("Store link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link. Please copy it manually.");
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Check out ${storeName} on V2 Business! Browse our catalogue and shop directly: ${fullUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${storeName} — V2 Business`,
          text: `Check out ${storeName} on V2 Business!`,
          url: fullUrl,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          toast.error("Could not open share menu");
        }
      }
    } else {
      handleCopy();
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullUrl)}`;

  const handleDownloadQr = () => {
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = `${storeSlug}-store-qr.png`;
    a.target = "_blank";
    a.click();
  };

  if (compact) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <div className="relative flex-1 min-w-[200px]">
          <Input
            readOnly
            value={fullUrl}
            className="pr-20 text-xs h-9 bg-muted/40 font-mono select-all"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="absolute right-1 top-1 h-7 px-2 text-xs font-medium hover:bg-background"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Check className="h-3.5 w-3.5" /> Copied
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="h-3.5 w-3.5" /> Copy
              </span>
            )}
          </Button>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleWhatsAppShare}
          className="h-9 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-medium text-xs gap-1.5 shadow-xs"
        >
          <WhatsAppIcon className="h-3.5 w-3.5 fill-current" />
          WhatsApp
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setQrOpen(true)}
          className="h-9 px-2.5 text-xs gap-1"
          title="Download QR Code"
        >
          <QrCode className="h-3.5 w-3.5" />
          QR
        </Button>

        {/* QR Modal */}
        <QrDialog
          open={qrOpen}
          onOpenChange={setQrOpen}
          storeName={storeName}
          fullUrl={fullUrl}
          qrImageUrl={qrImageUrl}
          onDownload={handleDownloadQr}
        />
      </div>
    );
  }

  return (
    <>
      <Card
        className={`relative overflow-hidden rounded-2xl border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-yellow-500/5 p-5 shadow-sm transition-all hover:border-amber-500/50 ${className}`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-amber-500/10 blur-2xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Store className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
                Your Public Storefront Link
                <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px] font-semibold gap-1 py-0 px-1.5">
                  <Sparkles className="h-2.5 w-2.5" /> Ready to Share
                </Badge>
              </h3>
            </div>
            <p className="text-xs text-muted-foreground pl-10">
              Share this dedicated link with customers on WhatsApp, Instagram, or social media to let them browse and buy directly from your store.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              to="/store/$slug"
              params={{ slug: storeSlug }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 rounded-xl border-border hover:bg-background">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                Preview Store
              </Button>
            </Link>
          </div>
        </div>

        {/* Link Input & Action Bar */}
        <div className="mt-4 pt-3 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Input
              readOnly
              value={fullUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="pr-24 text-xs h-10 bg-background/80 font-mono rounded-xl border-border/80 select-all"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="absolute right-1 top-1 h-8 px-2.5 text-xs font-semibold hover:bg-muted rounded-lg"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="h-3.5 w-3.5" /> Copied!
                </span>
              ) : (
                <span className="flex items-center gap-1 text-foreground">
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </span>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* WhatsApp Share */}
            <Button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-none h-10 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-medium text-xs gap-1.5 shadow-xs"
            >
              <WhatsAppIcon className="h-4 w-4 fill-current" />
              WhatsApp
            </Button>

            {/* QR Code */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setQrOpen(true)}
              className="h-10 px-3 rounded-xl text-xs gap-1.5 border-border hover:bg-background"
              title="Show Store QR Code"
            >
              <QrCode className="h-4 w-4" />
              Store QR
            </Button>

            {/* Native Mobile Share (if available) */}
            {typeof navigator !== "undefined" && "share" in navigator && (
              <Button
                type="button"
                variant="outline"
                onClick={handleNativeShare}
                className="h-10 px-3 rounded-xl text-xs gap-1.5 border-border hover:bg-background"
                title="Share..."
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* QR Code Dialog */}
      <QrDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        storeName={storeName}
        fullUrl={fullUrl}
        qrImageUrl={qrImageUrl}
        onDownload={handleDownloadQr}
      />
    </>
  );
}

export function StoreShareModal({
  open,
  onOpenChange,
  storeSlug,
  storeName = "Store",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeSlug: string;
  storeName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const storePath = `/store/${encodeURIComponent(storeSlug)}`;
  const fullUrl = origin ? `${origin}${storePath}` : storePath;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      }
      setCopied(true);
      toast.success("Store link copied!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out ${storeName} on V2 Business: ${fullUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${storeName} — V2 Business`,
          text: `Check out ${storeName} on V2 Business!`,
          url: fullUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5 text-primary" /> Share {storeName}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Send this store link to friends and customers across messaging apps and social media.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Link box */}
          <div className="relative">
            <Input
              readOnly
              value={fullUrl}
              className="pr-20 text-xs font-mono h-10 select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="absolute right-1 top-1 h-8 text-xs font-medium"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <Check className="h-3.5 w-3.5" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </span>
              )}
            </Button>
          </div>

          {/* Social share options */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={handleWhatsApp}
              className="h-10 bg-[#25D366] hover:bg-[#20ba5a] text-white font-medium text-xs gap-2"
            >
              <WhatsAppIcon className="h-4 w-4 fill-current" />
              WhatsApp
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleNativeShare}
              className="h-10 text-xs font-medium gap-2"
            >
              <Share2 className="h-4 w-4" />
              More Options
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QrDialog({
  open,
  onOpenChange,
  storeName,
  fullUrl,
  qrImageUrl,
  onDownload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName: string;
  fullUrl: string;
  qrImageUrl: string;
  onDownload: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:rounded-2xl text-center">
        <DialogHeader className="items-center text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 mb-2">
            <QrCode className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold">Storefront QR Code</DialogTitle>
          <DialogDescription className="text-xs">
            Scan to open <strong>{storeName}</strong> on V2 Business. Print this QR code to display at your physical counter or on marketing materials.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-3">
          <div className="rounded-2xl border-2 border-border bg-white p-3 shadow-md">
            <img
              src={qrImageUrl}
              alt={`${storeName} QR Code`}
              className="h-48 w-48 object-contain"
              loading="lazy"
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground font-mono truncate max-w-xs">
            {fullUrl}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            className="flex-1 text-xs gap-1.5"
            onClick={onDownload}
          >
            <Download className="h-3.5 w-3.5" />
            Download QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
