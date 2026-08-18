import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/utils-app";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — V2 Business" }, { name: "robots", content: "noindex" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user, loading } = useSession();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("cart_items")
          .select("*, products(*, vendors(id,name,slug))")
          .eq("user_id", user!.id)
      ).data ?? [],
  });

  const addresses = useQuery({
    queryKey: ["addresses", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("addresses").select("*").eq("user_id", user!.id)).data ?? [],
  });

  const [addr, setAddr] = useState({
    full_name: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    phone: "",
  });
  const [selectedAddr, setSelectedAddr] = useState<string | "new">("new");
  const [placing, setPlacing] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [couponStatus, setCouponStatus] = useState("idle"); // idle, loading, success, error

  useEffect(() => {
    const def = addresses.data?.find((a) => a.is_default) ?? addresses.data?.[0];
    if (def) setSelectedAddr(def.id);
  }, [addresses.data]);

  if (!loading && !user)
    return (
      <div className="mx-auto max-w-2xl p-8">
        <EmptyState
          title="Sign in to check out"
          action={
            <Link to="/auth" search={{ redirect: "/checkout" }}>
              <Button>Sign in</Button>
            </Link>
          }
        />
      </div>
    );

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-2xl p-8">
        <EmptyState
          title="Your cart is empty"
          action={
            <Link to="/search">
              <Button>Browse products</Button>
            </Link>
          }
        />
      </div>
    );

  // Group items by vendor
  const grouped = items.reduce(
    (acc: any, it: any) => {
      const vid = it.products.vendor_id;
      if (!acc[vid]) acc[vid] = { vendor: it.products.vendors, items: [] as any[] };
      acc[vid].items.push(it);
      return acc;
    },
    {} as Record<string, { vendor: any; items: any[] }>,
  );

  // Calculate totals
  const totalAll = items.reduce(
    (s: number, i: any) => s + Number(i.products.price) * i.quantity,
    0,
  );

  // Calculate discount from coupon
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === "percent") {
      discountAmount = totalAll * (Number(appliedCoupon.discount_value) / 100);
    } else {
      // FIXED_AMOUNT
      discountAmount = Math.min(Number(appliedCoupon.discount_value), totalAll);
    }
  }

  const discountedTotal = Math.max(0, totalAll - discountAmount);

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponError("Please enter a coupon code");
      return false;
    }

    setCouponStatus("loading");
    setCouponError("");
    try {
      const result = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .single();

      if (result.error) throw result.error;

      const coupon = result.data;

      // Additional validation
      const now = new Date();
      const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

      if (expiresAt && now > expiresAt) {
        throw new Error("Coupon has expired");
      }
      if (!coupon.active) {
        throw new Error("Coupon is not active");
      }

      // Check minimum purchase requirement
      if (coupon.min_order && totalAll < Number(coupon.min_order)) {
        throw new Error(`Minimum purchase of ${formatMoney(Number(coupon.min_order))} required`);
      }

      setAppliedCoupon(coupon);
      setCouponStatus("success");
      return true;
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponError(err.message || "Invalid coupon code");
      setCouponStatus("error");
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponStatus("idle");
  };

  const place = async () => {
    if (!user) return;
    let shippingAddr: any = null;
    if (selectedAddr === "new") {
      if (!addr.full_name || !addr.street || !addr.city || !addr.postal_code || !addr.country)
        return toast.error("Please fill required address fields");
      shippingAddr = addr;
      await supabase.from("addresses").insert({ user_id: user.id, ...addr });
    } else {
      shippingAddr = addresses.data?.find((a) => a.id === selectedAddr);
    }
    setPlacing(true);
    try {
      for (const vid of Object.keys(grouped)) {
        const g = grouped[vid];
        const sub = g.items.reduce(
          (s: number, i: any) => s + Number(i.products.price) * i.quantity,
          0,
        );

        // Calculate discount for this vendor's items (pro-rated based on subtotal)
        const vendorDiscount = totalAll > 0 ? (sub / totalAll) * discountAmount : 0;
        const vendorTotal = sub - vendorDiscount;

        const { data: order, error } = await supabase
          .from("orders")
          .insert({
            customer_id: user.id,
            vendor_id: vid,
            status: "pending",
            subtotal: sub,
            discount: parseFloat(vendorDiscount.toFixed(2)),
            total: parseFloat(vendorTotal.toFixed(2)),
            shipping_address: shippingAddr as any,
          })
          .select()
          .single();

        if (error) throw error;

        const orderItems = g.items.map((i: any) => ({
          order_id: order.id,
          product_id: i.products.id,
          name: i.products.name,
          price: Number(i.products.price),
          quantity: i.quantity,
          image_url: i.products.featured_image,
        }));

        await supabase.from("order_items").insert(orderItems);

        // Decrement stock
        for (const it of g.items) {
          await supabase
            .from("products")
            .update({ stock: Math.max(0, it.products.stock - it.quantity) })
            .eq("id", it.products.id);
        }
      }

      // No usedCount field in coupons schema, so we skip update

      await supabase.from("cart_items").delete().eq("user_id", user.id);
      qc.invalidateQueries();
      toast.success("Order placed!");
      nav({ to: "/account/orders" });
    } catch (e: any) {
      toast.error(e.message ?? "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Shipping address</h2>
          {(addresses.data?.length ?? 0) > 0 && (
            <div className="mt-4 space-y-2">
              {addresses.data!.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${selectedAddr === a.id ? "border-primary bg-primary-soft" : "border-border"}`}
                >
                  <input
                    type="radio"
                    name="addr"
                    checked={selectedAddr === a.id}
                    onChange={() => setSelectedAddr(a.id)}
                  />
                  <div className="text-sm">
                    <p className="font-medium">{a.full_name}</p>
                    <p className="text-muted-foreground">
                      {a.street}, {a.city}
                      {a.state ? `, ${a.state}` : ""} {a.postal_code}, {a.country}
                    </p>
                  </div>
                </label>
              ))}
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${selectedAddr === "new" ? "border-primary bg-primary-soft" : "border-border"}`}
              >
                <input
                  type="radio"
                  name="addr"
                  checked={selectedAddr === "new"}
                  onChange={() => setSelectedAddr("new")}
                />
                <span className="text-sm">Use a new address</span>
              </label>
            </div>
          )}
          {selectedAddr === "new" && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Full name</Label>
                <Input
                  value={addr.full_name}
                  onChange={(e) => setAddr({ ...addr, full_name: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Street address</Label>
                <Input
                  value={addr.street}
                  onChange={(e) => setAddr({ ...addr, street: e.target.value })}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={addr.city}
                  onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                />
              </div>
              <div>
                <Label>State / Region</Label>
                <Input
                  value={addr.state}
                  onChange={(e) => setAddr({ ...addr, state: e.target.value })}
                />
              </div>
              <div>
                <Label>Postal code</Label>
                <Input
                  value={addr.postal_code}
                  onChange={(e) => setAddr({ ...addr, postal_code: e.target.value })}
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={addr.country}
                  onChange={(e) => setAddr({ ...addr, country: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Phone</Label>
                <Input
                  value={addr.phone}
                  onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                />
              </div>
            </div>
          )}
        </Card>

        {Object.entries(grouped).map(([vid, g]: any) => (
          <Card key={vid} className="p-4">
            <p className="text-sm font-medium">From {g.vendor?.name ?? "Vendor"}</p>
            <div className="mt-2 space-y-2">
              {g.items.map((i: any) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span>
                    {i.products.name} × {i.quantity}
                  </span>
                  <span>{formatMoney(Number(i.products.price) * i.quantity)}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="h-fit p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatMoney(totalAll)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-muted-foreground">
              Discount (-
              {appliedCoupon?.discount_type === "percent"
                ? appliedCoupon.discount_value
                : formatMoney(Number(appliedCoupon?.discount_value))}
              %)
            </span>
            <span>-{formatMoney(discountAmount)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>Free</span>
        </div>
        <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold">
          <span>Total</span>
          <span>{formatMoney(discountedTotal)}</span>
        </div>

        {/* Coupon section */}
        <div className="mt-6">
          <div className="flex items-stretch gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={couponStatus === "loading"}
            />
            <Button
              onClick={() => validateCoupon(couponCode)}
              disabled={couponStatus === "loading"}
            >
              {couponStatus === "loading" ? "Applying..." : "Apply Coupon"}
            </Button>
          </div>
          {couponError && <p className="mt-2 text-sm text-destructive">{couponError}</p>}
          {appliedCoupon && (
            <div className="mt-2 p-3 bg-primary text-primary-foreground rounded">
              <div className="flex justify-between">
                <span>Applied: {appliedCoupon.code}</span>
                <Button variant="ghost" size="icon" onClick={removeCoupon}>
                  <span className="text-primary">✕</span>
                </Button>
              </div>
              <div className="mt-1 text-sm">
                {appliedCoupon.discount_type === "percent"
                  ? `${appliedCoupon.discount_value}% off`
                  : `${formatMoney(Number(appliedCoupon.discount_value))} off`}
                {Number(appliedCoupon.min_order) > 0 &&
                  ` (min. ${formatMoney(Number(appliedCoupon.min_order))})`}
              </div>
            </div>
          )}
        </div>

        <Button onClick={place} disabled={placing} className="mt-4 w-full">
          {placing ? "Placing order..." : "Place order"}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Payment is arranged directly with each vendor.
        </p>
      </Card>
    </div>
  );
}
