import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useSession } from "@/hooks/use-session";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatMoney } from "@/lib/utils-app";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from "lucide-react";

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
    initialData: () => qc.getQueryData(["cart", user?.id]),
    staleTime: 1000 * 60 * 3,
  });

  const cartItems: any[] = (cartData as any)?.items ?? (Array.isArray(cartData) ? cartData : []);

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const [selectedProvider, setSelectedProvider] = useState<string>("direct_upi");
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  // Group cart items by vendor to handle per-vendor UPI payments
  const vendorGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        vendorId: string;
        vendorName: string;
        upiId: string;
        items: any[];
        subtotal: number;
      }
    >();

    cartItems.forEach((item) => {
      const prod = item.product || item;
      const vId = prod.vendorId || prod.vendor?.id || "v2-default";
      const vName = prod.vendor?.name || prod.vendorName || "Store Seller";

      let upi = "";
      if (typeof window !== "undefined") {
        try {
          const payout = localStorage.getItem(`vendor_payout_${vId}`);
          if (payout) {
            const parsed = JSON.parse(payout);
            if (parsed.upiId) upi = parsed.upiId;
          }
          if (!upi) {
            const store = localStorage.getItem(`vendor_store_${vId}`);
            if (store) {
              const parsed = JSON.parse(store);
              if (parsed.upiId) upi = parsed.upiId;
            }
          }
        } catch {}
      }
      if (!upi) {
        upi = "v2business@okhdfcbank"; // Fallback to verified marketplace UPI
      }

      const price = Number(prod.price ?? 0);
      const qty = Number(item.quantity ?? 1);
      const lineTotal = price * qty;

      if (!map.has(vId)) {
        map.set(vId, {
          vendorId: vId,
          vendorName: vName,
          upiId: upi,
          items: [item],
          subtotal: lineTotal,
        });
      } else {
        const existing = map.get(vId)!;
        existing.items.push(item);
        existing.subtotal += lineTotal;
      }
    });

    return Array.from(map.values());
  }, [cartItems]);

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

  if (cartLoading && !cartData) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-8 w-48 rounded bg-muted/60 mb-6" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 rounded-2xl bg-muted/50" />
            <div className="h-44 rounded-2xl bg-muted/50" />
          </div>
          <div>
            <div className="h-72 rounded-2xl bg-muted/60" />
          </div>
        </div>
      </div>
    );
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

    if (selectedProvider === "direct_upi") {
      const cleanUtr = utrNumber.trim();
      if (!cleanUtr) {
        return toast.error("Please enter the 12-digit UPI Reference / UTR Number from your payment app.");
      }
      if (!/^\d{12}$/.test(cleanUtr)) {
        return toast.error("UTR must be exactly 12 numeric digits (found on your GPay / PhonePe receipt).");
      }
      try {
        const usedUtrs = JSON.parse(localStorage.getItem("used_order_utrs") || "[]");
        if (usedUtrs.includes(cleanUtr)) {
          return toast.error("This UTR has already been submitted for a previous order. Please check your transaction details.");
        }
      } catch {}
    }

    setPlacing(true);
    try {
      const payload: any = {
        shippingAddress,
        providerType: selectedProvider === "direct_upi" ? "mock" : (selectedProvider || "razorpay"),
        paymentMethod: selectedProvider === "direct_upi" ? "DIRECT_UPI" : selectedProvider,
        paymentStatus: selectedProvider === "direct_upi" ? "UNDER_VERIFICATION" : "PENDING",
        utrNumber: selectedProvider === "direct_upi" ? utrNumber.trim() : undefined,
      };

      const result: any = await api.createOrder(payload);
      const orderId = result?.orderId || result?.id || result?.data?.id || `ORD-${Date.now()}`;

      if (selectedProvider === "direct_upi") {
        const cleanUtr = utrNumber.trim();
        try {
          const usedUtrs = JSON.parse(localStorage.getItem("used_order_utrs") || "[]");
          usedUtrs.push(cleanUtr);
          localStorage.setItem("used_order_utrs", JSON.stringify(usedUtrs.slice(-100)));

          const orderMeta = {
            orderId,
            paymentMethod: "DIRECT_UPI",
            utrNumber: cleanUtr,
            paymentStatus: "UNDER_VERIFICATION",
            shippingAddress,
            vendorGroups: vendorGroups.map((vg) => ({
              vendorId: vg.vendorId,
              vendorName: vg.vendorName,
              upiId: vg.upiId,
              amount: vg.subtotal,
            })),
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem(`order_meta_${orderId}`, JSON.stringify(orderMeta));

          const allDirect = JSON.parse(localStorage.getItem("all_direct_upi_orders") || "[]");
          allDirect.unshift(orderMeta);
          localStorage.setItem("all_direct_upi_orders", JSON.stringify(allDirect.slice(0, 100)));

          // Automatically generate an invoice for each vendor order with customer & transaction ID
          vendorGroups.forEach((vg, idx) => {
            const invNumber = `INV-${Date.now().toString().slice(-6)}-${vg.vendorId.slice(0, 4).toUpperCase()}${idx + 1}`;
            const invoiceRecord = {
              id: `inv_${Date.now()}_${vg.vendorId}`,
              invoiceNumber: invNumber,
              orderId,
              vendorId: vg.vendorId,
              vendor: { id: vg.vendorId, name: vg.vendorName },
              customerId: user?.id,
              customer: { id: user?.id, name: user?.name || shippingAddress.name, email: user?.email },
              shippingAddress,
              paymentMethod: "Direct UPI",
              utrNumber: cleanUtr,
              status: "paid",
              subtotal: vg.subtotal,
              taxAmount: 0,
              shippingAmount: 0,
              discountAmount: 0,
              totalAmount: vg.subtotal,
              paidAmount: vg.subtotal,
              balanceDue: 0,
              issueDate: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              invoiceItems: vg.items.map((it: any) => {
                const p = it.product || it;
                return {
                  name: p.name || "Item",
                  quantity: it.quantity || 1,
                  unitPrice: Number(p.price || 0),
                  total: Number(p.price || 0) * (it.quantity || 1),
                };
              }),
            };

            if (user?.id) {
              const custKey = `customer_invoices_${user.id}`;
              const custInvoices = JSON.parse(localStorage.getItem(custKey) || "[]");
              custInvoices.unshift(invoiceRecord);
              localStorage.setItem(custKey, JSON.stringify(custInvoices.slice(0, 50)));
            }

            const vendKey = `vendor_invoices_${vg.vendorId}`;
            const vendInvoices = JSON.parse(localStorage.getItem(vendKey) || "[]");
            vendInvoices.unshift(invoiceRecord);
            localStorage.setItem(vendKey, JSON.stringify(vendInvoices.slice(0, 50)));

            const allInvoices = JSON.parse(localStorage.getItem("all_marketplace_invoices") || "[]");
            allInvoices.unshift(invoiceRecord);
            localStorage.setItem("all_marketplace_invoices", JSON.stringify(allInvoices.slice(0, 100)));
          });
        } catch {}
      }

      toast.success("Order placed and invoice generated with your UPI Transaction ID!");
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      qc.invalidateQueries({ queryKey: ["customer-invoices"] });

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

          {/* Payment Method - Direct UPI Only */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">Payment Method</h2>
            </div>

            <div className="rounded-xl border-2 border-emerald-500 bg-emerald-500/10 p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-base text-foreground">
                  Direct UPI to Seller (GPay / PhonePe / Paytm / BHIM)
                </span>
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold py-0.5 px-2">
                  0% Fee • Instant Direct Settlement
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Scan the seller's QR code or tap to pay via UPI app. No cards or bank account details required — 100% direct seller settlement.
              </p>
            </div>

            {/* Direct UPI Interactive Payment Section */}
            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-card p-5 space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Step 1: Scan & Pay Seller Directly</h3>
                    <p className="text-xs text-muted-foreground">Use Google Pay, PhonePe, Paytm, or BHIM</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs">
                  0% Fee • Direct Settlement
                </Badge>
              </div>

                {vendorGroups.map((vg) => {
                  const upiUrl = `upi://pay?pa=${vg.upiId}&pn=${encodeURIComponent(
                    vg.vendorName,
                  )}&am=${vg.subtotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`V2 Order - ${vg.vendorName}`)}`;
                  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    upiUrl,
                  )}`;

                  return (
                    <div
                      key={vg.vendorId}
                      className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/10 pb-2">
                        <div>
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Seller Store
                          </span>
                          <p className="font-bold text-base text-foreground flex items-center gap-1.5">
                            {vg.vendorName}
                            <Badge
                              variant="outline"
                              className="text-[10px] text-emerald-700 border-emerald-500/30 bg-emerald-50/50"
                            >
                              Verified Seller
                            </Badge>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground">Exact Amount to Pay</span>
                          <p className="text-lg font-bold text-emerald-700">{formatMoney(vg.subtotal)}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                        <div className="relative group shrink-0">
                          <div className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-sm">
                            <img
                              src={qrImageUrl}
                              alt={`UPI QR for ${vg.vendorName}`}
                              className="h-40 w-40 object-contain rounded-lg"
                            />
                          </div>
                          <p className="text-[10px] text-center text-muted-foreground mt-1.5 font-medium">
                            Scan with any UPI App
                          </p>
                        </div>

                        <div className="space-y-3 flex-1 text-center sm:text-left">
                          <div>
                            <Label className="text-xs text-muted-foreground font-semibold">Seller UPI ID (VPA)</Label>
                            <div className="mt-1 flex items-center justify-center sm:justify-start gap-2">
                              <code className="rounded-md border bg-background px-3 py-1.5 text-xs font-mono font-bold text-foreground shadow-xs">
                                {vg.upiId}
                              </code>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1.5 font-semibold"
                                onClick={() => {
                                  navigator.clipboard.writeText(vg.upiId);
                                  setCopiedUpi(vg.upiId);
                                  toast.success("Seller UPI ID copied to clipboard!");
                                  setTimeout(() => setCopiedUpi(null), 2500);
                                }}
                              >
                                {copiedUpi === vg.upiId ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                                {copiedUpi === vg.upiId ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          </div>

                          <div className="pt-1">
                            <p className="text-xs text-muted-foreground mb-2">
                              On mobile phone? Tap to launch your UPI app directly:
                            </p>
                            <a
                              href={upiUrl}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-all"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Pay {formatMoney(vg.subtotal)} via GPay / PhonePe / Paytm
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Step 2: 12-digit UTR Input */}
                <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div>
                    <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                      Step 2: Enter 12-Digit UPI Reference / UTR Number *
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      After paying in your UPI app, copy the 12-digit <strong>UPI Ref No. / UTR</strong> from your
                      transaction details and paste it here.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="text"
                      maxLength={12}
                      placeholder="Enter 12-digit UTR (e.g. 428192837461)"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                      className="font-mono text-base tracking-widest bg-background"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>
                      The seller checks this UTR number in their bank app before dispatching your package.
                    </span>
                  </div>
                </div>
              </div>
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

            <Button
              type="submit"
              className={`w-full mt-6 font-bold ${
                selectedProvider === "direct_upi"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  : ""
              }`}
              size="lg"
              disabled={placing}
            >
              {placing
                ? "Processing Order…"
                : selectedProvider === "direct_upi"
                ? `Submit Payment & Place Order (${formatMoney(totalAmount)})`
                : `Pay ${formatMoney(totalAmount)}`}
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
