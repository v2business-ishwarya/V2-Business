import { Link, useNavigate } from "@tanstack/react-router";
import { Package, Zap } from "lucide-react";
import { finalPrice, discountPercent, formatMoney } from "@/lib/utils-app";
import { useSession } from "@/hooks/use-session";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useState } from "react";
import { toast } from "sonner";

type Product = {
  id: string;
  slug?: string;
  name: string;
  price: number | string;
  discount_price?: number | string | null;
  compareAtPrice?: number | string | null;
  featured_image?: string | null;
  images?: string[];
  stock: number;
  avg_rating?: number;
  vendors?: { name: string; slug?: string } | null;
  vendor?: { name: string; id?: string } | null;
};

export function ProductCard({ product }: { product: Product }) {
  const { user } = useSession();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [buying, setBuying] = useState(false);

  const fp = finalPrice(product.price, product.discount_price ?? product.compareAtPrice);
  const pct = discountPercent(product.price, product.discount_price ?? product.compareAtPrice);
  
  // Resolve image from images array or featured_image property
  const imgUrl =
    (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) ||
    product.featured_image ||
    (product as any).image ||
    null;

  // Resolve target identifier (prefer slug, fallback to product.id)
  const productIdentifier = product.slug && product.slug !== "undefined" ? product.slug : product.id;

  const vendorName = product.vendors?.name || product.vendor?.name;

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (!user) {
      toast.info("Please sign in to complete checkout");
      return nav({ to: "/auth", search: { redirect: `/product/${productIdentifier}` } });
    }

    setBuying(true);
    try {
      await api.addToCart(product.id, 1);
      await qc.invalidateQueries({ queryKey: ["cart-count"] });
      await qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Proceeding to checkout…");
      nav({ to: "/checkout" });
    } catch (err: any) {
      toast.error(err.message || "Failed to proceed to checkout");
    } finally {
      setBuying(false);
    }
  };

  return (
    <Link
      to="/product/$slug"
      params={{ slug: productIdentifier }}
      preload="intent"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-soft transition hover:shadow-card"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <Package className="h-8 w-8" />
          </div>
        )}
        {pct > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
            -{pct}%
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-destructive/90 px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {vendorName && (
          <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
            {vendorName}
          </p>
        )}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">
          {product.name}
        </h3>
        <div className="mt-auto pt-2 flex items-center justify-between gap-1.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-bold text-foreground">{formatMoney(fp)}</span>
            {pct > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {formatMoney(product.price)}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={product.stock === 0 || buying}
            onClick={handleBuyNow}
            className="inline-flex items-center gap-1 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-2.5 py-1 text-xs font-bold shadow-sm transition hover:shadow active:scale-95 shrink-0"
            title="Buy Now"
          >
            <Zap className="h-3 w-3 fill-white" />
            <span>{buying ? "…" : "Buy Now"}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
