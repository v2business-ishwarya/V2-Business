import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Store } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account/invoices")({
  head: () => ({ meta: [{ title: "My Invoices — Account" }] }),
  component: CustomerInvoicesPage,
});

function CustomerInvoicesPage() {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["customer-invoices"],
    queryFn: () => api.getInvoices(),
  });

  const statusColor: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    sent: "bg-blue-100 text-blue-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  const handlePrint = (inv: any) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Invoice ${inv.invoiceNumber}</title>
    <style>body{font-family:system-ui,sans-serif;padding:40px;max-width:720px;margin:auto;color:#1a1a1a}
    h1{font-size:24px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:20px 0}
    th,td{padding:10px 14px;text-align:left;border-bottom:1px solid #e5e5e5}th{background:#f8f8f8;font-weight:600}
    .total-row{font-size:18px;font-weight:700}.meta{color:#666;font-size:14px}
    hr{border:none;border-top:1px solid #e5e5e5;margin:20px 0}</style></head><body>
    <h1>Invoice</h1><p class="meta">#${inv.invoiceNumber}</p><hr/>
    <p><strong>From:</strong> ${inv.vendor?.name ?? "Vendor"}</p>
    <p><strong>To:</strong> ${inv.customer?.name ?? inv.customer?.email ?? "—"}</p>
    <p class="meta">Date: ${new Date(inv.issueDate || inv.createdAt).toLocaleDateString("en-IN")}</p>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Total</th></tr></thead><tbody>
    ${(inv.invoiceItems ?? []).map((i: any) => `<tr><td>${i.name || i.product?.name || "Item"}</td><td>${i.quantity}</td><td>₹${Number(i.unitPrice).toFixed(2)}</td><td>₹${Number(i.tax ?? 0).toFixed(2)}</td><td>₹${Number(i.total ?? i.unitPrice * i.quantity).toFixed(2)}</td></tr>`).join("")}
    </tbody></table>
    <div style="text-align:right;margin-top:16px">
    <p>Subtotal: ₹${Number(inv.subtotal ?? 0).toFixed(2)}</p>
    <p>Tax: ₹${Number(inv.taxAmount ?? 0).toFixed(2)}</p>
    <p>Shipping: ₹${Number(inv.shippingAmount ?? 0).toFixed(2)}</p>
    ${inv.discountAmount > 0 ? `<p>Discount: -₹${Number(inv.discountAmount).toFixed(2)}</p>` : ""}
    <p class="total-row">Total: ₹${Number(inv.totalAmount ?? 0).toFixed(2)}</p>
    </div></body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Your Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Separate invoice for each vendor — if you ordered from 2 vendors, you get 2 invoices
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading your invoices…</div>
      ) : (invoices as any[]).length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">No invoices yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Place an order and your invoices will appear here automatically.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {(invoices as any[]).map((inv: any) => (
            <Card key={inv.id} className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">{inv.invoiceNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[inv.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="h-3.5 w-3.5" />
                    <span>{inv.vendor?.name ?? "Vendor"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(inv.issueDate || inv.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-xl font-bold">₹{Number(inv.totalAmount ?? 0).toFixed(2)}</p>
              </div>

              {/* Items summary */}
              {(inv.invoiceItems ?? []).length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Item</th>
                        <th className="text-right px-3 py-2 font-medium">Qty</th>
                        <th className="text-right px-3 py-2 font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(inv.invoiceItems ?? []).map((item: any, i: number) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{item.name || item.product?.name || "Item"}</td>
                          <td className="px-3 py-2 text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-right">₹{Number(item.total ?? item.unitPrice * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handlePrint(inv)}>
                  <Download className="h-3 w-3 mr-1" /> Download Invoice
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
