import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useSession } from "@/hooks/use-session";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatMoney } from "@/lib/utils-app";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Truck, CreditCard } from "lucide-react";

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

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: () => api.getCart(),
  });

  const { data: paymentProviders = [] } = useQuery({
    queryKey: ["checkout-payment-providers"],
    queryFn: () => api.getPaymentProviders(),
  });

  const cartItems: any[] = (cartData as any)?.items ?? (Array.isArray(cartData) ? cartData : []);
  const activeProviders: any[] = (paymentProviders as any)?.filter((p: any) => p.isEnabled) ?? [];

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const [selectedProvider, setSelectedProvider] = useState<string>("razorpay");
  const [placing, setPlacing] = useState(false);

  if (!loading && !user)
    return (
      <div className="mx-auto max-w-2xl p-8">
        <EmptyState
          title="Sign in to checkout"
          description="Please login to complete your order."
          action={
            <Link to="/auth" search={{ redirect: "/checkout" }}>
              <Button>Sign in</Button>
            </Link>
          }
        />
      </div>
    );

  if (cartLoading) {
    return <div className="p-12 text-center text-muted-foreground">Loading checkout…</div>;
  }

  if (cartItems.length === 0)
    return (
      <div className="mx-auto max-w-2xl p-8">
        <EmptyState
          title="Your cart is empty"
          description="Add items from our marketplace before checking out."
          action={
            <Link to="/search">
              <Button>Browse products</Button>
            </Link>
          }
        />
      </div>
    );

  const totalAmount = cartItems.reduce(
    (sum: number, item: any) => sum + Number(item.product?.price ?? item.price ?? 0) * (item.quantity || 1),
    0,
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      return toast.error("Please enter your complete delivery address");
    }

    setPlacing(true);
    try {
      const payload = {
        shippingAddress,
        providerType: selectedProvider || "razorpay",
      };

      const result: any = await api.createOrder(payload);

      toast.success("Order placed successfully!");
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });

      nav({ to: "/account/invoices" });
    } catch (err: any) {
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold mb-6">Checkout & Payment</h1>

      <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Shipping Address */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Delivery Address</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Full Name *</Label>
                <Input
                  required
                  placeholder="Recipient full name"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Street Address *</Label>
                <Input
                  required
                  placeholder="House / Flat / Street / Area"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                />
              </div>
              <div>
                <Label>City *</Label>
                <Input
                  required
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                />
              </div>
              <div>
                <Label>State / Region</Label>
                <Input
                  placeholder="State"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                />
              </div>
              <div>
                <Label>PIN / Postal Code *</Label>
                <Input
                  required
                  placeholder="e.g. 500001"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Payment Method</h2>
            </div>

            <RadioGroup
              value={selectedProvider}
              onValueChange={setSelectedProvider}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="razorpay" id="pay-razorpay" />
                <Label htmlFor="pay-razorpay" className="flex-1 cursor-pointer font-medium">
                  Razorpay (UPI, Credit/Debit Cards, NetBanking, Wallets)
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="cashfree" id="pay-cashfree" />
                <Label htmlFor="pay-cashfree" className="flex-1 cursor-pointer font-medium">
                  Cashfree Payments (UPI, Instant NetBanking)
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="mock" id="pay-mock" />
                <Label htmlFor="pay-mock" className="flex-1 cursor-pointer font-medium">
                  Cash on Delivery / Direct Settlement Test Mode
                </Label>
              </div>
            </RadioGroup>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto divide-y">
              {cartItems.map((item: any) => {
                const prod = item.product || item;
                return (
                  <div key={item.id || prod.id} className="pt-3 first:pt-0 flex justify-between text-sm">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-medium truncate">{prod.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity || 1}</p>
                    </div>
                    <span className="font-semibold">
                      {formatMoney(Number(prod.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t pt-2 mt-2">
                <span>Total Amount</span>
                <span>{formatMoney(totalAmount)}</span>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" size="lg" disabled={placing}>
              {placing ? "Processing Order…" : `Pay ${formatMoney(totalAmount)}`}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Safe & Secure 256-bit Encrypted Checkout</span>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
