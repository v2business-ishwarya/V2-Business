import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  const { data = [] } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("wishlist")
          .select("product_id, products(*, vendors(name,slug,status))")
          .eq("user_id", user!.id)
      ).data ?? [],
  });

  const remove = async (pid: string) => {
    await supabase.from("wishlist").delete().eq("user_id", user!.id).eq("product_id", pid);
    qc.invalidateQueries({ queryKey: ["wishlist"] });
    toast.success("Removed");
  };

  if (data.length === 0)
    return (
      <EmptyState
        title="Your wishlist is empty."
        description="Save products you love to find them later."
        action={
          <Link to="/search">
            <Button>Browse products</Button>
          </Link>
        }
      />
    );
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {data.map((w: any) => (
        <div key={w.product_id} className="relative">
          <ProductCard product={w.products} />
          <button
            onClick={() => remove(w.product_id)}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-surface/90 shadow-soft hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
