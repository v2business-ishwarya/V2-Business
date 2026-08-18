import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatMoney, finalPrice, discountPercent } from "@/lib/utils-app";
import { Package, Store, Star, Heart, Truck, ShieldCheck } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Product — V2 Business` },
      { name: "description", content: `View this product on V2 Business.` },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { user } = useSession();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [qty, setQty] = useState(1);
  const [main, setMain] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await api.getProduct(slug);
      return res;
    },
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", product?.id],
    enabled: !!product?.id,
    queryFn: async () => {
      const res = await api.getReviews(product?.id ?? "");
      return res;
    },
  });

  if (isLoading)
    return <div className="mx-auto max-w-6xl p-8 text-sm text-muted-foreground">Loading...</div>;
  if (!product)
    return (
      <div className="mx-auto max-w-6xl p-8">
        <EmptyState
          title="Product not found"
          description="This product may have been removed."
          action={
            <Link to="/search">
              <Button>Browse products</Button>
            </Link>
          }
        />
      </div>
    );

  const images = [
    ...(product.images ?? []),
    ...(product.featured_image ? [product.featured_image] : []),
    ...(product.product_images ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((i: any) => i.url),
  ];
  const currentMainImage = main ?? images[0] ?? null;

  const displayPrice = product.compareAtPrice ?? product.price;
  const salePrice = product.compareAtPrice ? product.price : product.discount_price;
  const fp = finalPrice(displayPrice, salePrice);
  const pct = discountPercent(displayPrice, salePrice);

  const addToCart = async () => {
    if (!user) return nav({ to: "/auth", search: { redirect: `/product/${slug}` } });
    try {
      await api.addToCart(product.id, qty);
      qc.invalidateQueries({ queryKey: ["cart-count"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const toggleWishlist = async () => {
    if (!user) return nav({ to: "/auth", search: { redirect: `/product/${slug}` } });
    try {
      // Try to add; if already exists, backend may return error or we can ignore.
      await api.addToWishlist(product.id);
      toast.success("Added to wishlist");
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Already exists, try to remove
        try {
          await api.removeFromWishlist(product.id);
          toast.info("Removed from wishlist");
        } catch (e) {
          toast.error("Failed to toggle wishlist");
        }
      } else {
        toast.error("Failed to update wishlist");
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-surface-muted">
            {currentMainImage ? (
              <img
                src={currentMainImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-muted-foreground">
                <Package className="h-16 w-16" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setMain(src)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${currentMainImage === src ? "border-primary" : "border-border"}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {(product.vendors ?? product.vendor) && (
            <Link
              to="/store/$slug"
              params={{ slug: (product.vendors ?? product.vendor).id ?? (product.vendors ?? product.vendor).slug }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              {(product.vendors ?? product.vendor).logo_url ? (
                <img
                  src={(product.vendors ?? product.vendor).logo_url}
                  className="h-6 w-6 rounded-full object-cover"
                  alt=""
                />
              ) : (
                <Store className="h-4 w-4" />
              )}
              {(product.vendors ?? product.vendor).name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-medium">{Number(product.avg_rating ?? 0).toFixed(1)}</span>
              <span className="text-muted-foreground">({product.ratings_count ?? 0})</span>
            </div>
            {product.categories && (
              <Link to="/category/$slug" params={{ slug: product.categories.slug }}>
                <Badge variant="secondary">{product.categories.name}</Badge>
              </Link>
            )}
            {product.brand && <Badge variant="outline">{product.brand}</Badge>}
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatMoney(fp)}</span>
            {pct > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatMoney(displayPrice)}
                </span>
                <Badge className="bg-primary text-primary-foreground">-{pct}%</Badge>
              </>
            )}
          </div>
          <p
            className={`mt-2 text-sm ${product.stock === 0 ? "text-destructive" : "text-success"}`}
          >
            {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
          </p>

          {product.description && (
            <p className="mt-6 whitespace-pre-wrap text-sm text-foreground/80">
              {product.description}
            </p>
          )}

          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2">
                −
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock ?? 99, qty + 1))}
                className="px-3 py-2"
              >
                +
              </button>
            </div>
            <Button
              size="lg"
              onClick={addToCart}
              disabled={product.stock === 0}
              className="flex-1 rounded-full"
            >
              Add to cart
            </Button>
            <Button size="lg" variant="outline" onClick={toggleWishlist} className="rounded-full">
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 rounded-lg border border-border p-3">
              <Truck className="h-4 w-4" />
              Ships from the vendor
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border p-3">
              <ShieldCheck className="h-4 w-4" />
              Buyer protection
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-10" />
      <div>
        <h2 className="text-xl font-semibold">Reviews</h2>
        {(reviewsQuery.data?.length ?? 0) === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {reviewsQuery.data!.map((r: any) => (
              <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-surface-muted text-sm">
                    {(r.user?.name ?? "A").slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.user?.name ?? "Anonymous"}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>
                </div>
                {r.comment && <p className="mt-2 text-sm text-foreground/80">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
