import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useSession } from "@/hooks/use-session";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney, finalPrice } from "@/lib/utils-app";
import { Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — V2 Business" }, { name: "robots", content: "noindex" }] }),
  component: CartPage,
});

function CartPage() {
  const { user, loading } = useSession();
  const nav = useNavigate();
  const qc = useQueryClient();

  const {
    data: items = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const cart = await api.getCart();
      // Expect cart to contain items array with product details populated
      return cart.items ?? [];
    },
  });

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <EmptyState
          icon={<ShoppingCart className="h-6 w-6" />}
          title="Sign in to see your cart"
          action={
            <Link to="/auth" search={{ redirect: "/cart" }}>
              <Button>Sign in</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading cart...</div>;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <EmptyState
          icon={<ShoppingCart className="h-6 w-6" />}
          title="Your cart is empty"
          description="Discover products from independent vendors."
          action={
            <Link to="/search">
              <Button>Browse products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const updateQty = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    await api.updateCartItem(id, { quantity });
    qc.invalidateQueries({ queryKey: ["cart"] });
    qc.invalidateQueries({ queryKey: ["cart-count"] });
  };

  const remove = async (id: string) => {
    await api.removeFromCart(id);
    qc.invalidateQueries({ queryKey: ["cart"] });
    qc.invalidateQueries({ queryKey: ["cart-count"] });
    toast.success("Removed from cart");
  };

  const subtotal = items.reduce((sum: number, item: any) => {
    const price = finalPrice(item.product.price, item.product.discount_price);
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Your cart</h1>
        {items.map((item: any) => {
          const price = finalPrice(item.product.price, item.product.discount_price);
          return (
            <Card key={item.id} className="flex gap-4 p-4">
              <Link
                to="/product/$slug"
                params={{ slug: item.product.slug }}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-muted"
              >
                {item.product.featured_image && (
                  <img
                    src={item.product.featured_image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  to="/product/$slug"
                  params={{ slug: item.product.slug }}
                  className="font-medium hover:text-primary"
                >
                  {item.product.name}
                </Link>
                {item.product.vendor && (
                  <Link
                    to="/store/$slug"
                    params={{ slug: item.product.vendor.slug }}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    {item.product.vendor.name}
                  </Link>
                )}
                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="flex items-center rounded-full border border-border">
                    <button
                      className="px-3 py-1 text-sm"
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      className="px-3 py-1 text-sm"
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatMoney(price * item.quantity)}</span>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Card className="h-fit p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>Calculated at checkout</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold">
          <span>Total</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        <Button onClick={() => nav({ to: "/checkout" })} className="mt-4 w-full">
          Checkout
        </Button>
      </Card>
    </div>
  );
}
