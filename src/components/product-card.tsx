import { Link } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { finalPrice, discountPercent, formatMoney } from "@/lib/utils-app";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  discount_price: number | string | null;
  featured_image: string | null;
  stock: number;
  avg_rating: number;
  vendors?: { name: string; slug: string } | null;
};

export function ProductCard({ product }: { product: Product }) {
  const fp = finalPrice(product.price, product.discount_price);
  const pct = discountPercent(product.price, product.discount_price);
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-soft transition hover:shadow-card"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
        {product.featured_image ? (
          <img
            src={product.featured_image}
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
        {product.vendors && (
          <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
            {product.vendors.name}
          </p>
        )}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">
          {product.name}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-semibold">{formatMoney(fp)}</span>
          {pct > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {formatMoney(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
