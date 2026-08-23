import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useSession } from "@/hooks/use-session";
import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/wishlist")({
  component: Wishlist,
});

function Wishlist() {
  const { user } = useSession();
  const qc = useQueryClient();

  const { data: rawWishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: () => api.getWishlist(),
  });

  const list: any[] = (rawWishlist as any)?.items ?? (Array.isArray(rawWishlist) ? rawWishlist : []);

  const removeMutation = useMutation({
    mutationFn: (productId: string) => api.removeFromWishlist(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Item removed from wishlist");
    },
    onError: (err: any) => toast.error(err.message || "Failed to remove item"),
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading wishlist…</div>;

  if (list.length === 0)
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save products you love to purchase later."
        action={
          <Link to="/search">
            <Button>Browse products</Button>
          </Link>
        }
      />
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Wishlist</h1>
        <p className="text-sm text-muted-foreground">Items you have saved for later</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {list.map((w: any) => {
          const product = w.product || w;
          return (
            <div key={w.productId || product.id} className="relative group">
              <ProductCard product={product} />
              <button
                onClick={() => removeMutation.mutate(w.productId || product.id)}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 shadow hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
