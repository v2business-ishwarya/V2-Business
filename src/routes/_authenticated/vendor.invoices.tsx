import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/vendor/invoices")({
  head: () => ({ meta: [{ title: "Invoices — Vendor" }] }),
  component: VendorInvoicesPage,
});

function VendorInvoicesPage() {
  const [viewInvoice, setViewInvoice] = useState<any>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["vendor-invoices"],
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
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px}
    hr{border:none;border-top:1px solid #e5e5e5;margin:20px 0}</style></head><body>
    <div class="header"><div><h1>Invoice</h1><p class="meta">#${inv.invoiceNumber}</p></div>
    <div style="text-align:right"><p class="meta">Date: ${new Date(inv.issueDate || inv.createdAt).toLocaleDateString("en-IN")}</p>
    <p class="meta">Status: ${inv.status?.toUpperCase()}</p></div></div>
    <hr/>
    <p><strong>Vendor:</strong> ${inv.vendor?.name ?? "—"}</p>
    <p><strong>Customer:</strong> ${inv.customer?.name ?? inv.customer?.email ?? "—"}</p>
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
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Auto-generated invoices for every order placed with your store
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading invoices…</div>
      ) : (invoices as any[]).length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">No invoices yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Invoices are automatically generated when customers place orders from your store.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {(invoices as any[]).map((inv: any) => (
            <Card key={inv.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{inv.invoiceNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[inv.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customer: {inv.customer?.name ?? inv.customer?.email ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(inv.issueDate || inv.createdAt).toLocaleDateString("en-IN")}
                    {inv.orderId && ` · Order #${inv.orderId.substring(0, 8)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold mr-2">₹{Number(inv.totalAmount ?? 0).toFixed(2)}</p>
                  <Button size="sm" variant="ghost" onClick={() => setViewInvoice(inv)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handlePrint(inv)}>
                    <Download className="h-3 w-3 mr-1" /> Print
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invoice Detail Modal */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {viewInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Invoice {viewInvoice.invoiceNumber}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[viewInvoice.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {viewInvoice.status}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Date:</span> {new Date(viewInvoice.issueDate || viewInvoice.createdAt).toLocaleDateString("en-IN")}</div>
                  <div><span className="text-muted-foreground">Vendor:</span> {viewInvoice.vendor?.name ?? "—"}</div>
                  <div><span className="text-muted-foreground">Customer:</span> {viewInvoice.customer?.name ?? viewInvoice.customer?.email ?? "—"}</div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Item</th>
                        <th className="text-right px-3 py-2 font-medium">Qty</th>
                        <th className="text-right px-3 py-2 font-medium">Price</th>
                        <th className="text-right px-3 py-2 font-medium">Tax</th>
                        <th className="text-right px-3 py-2 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewInvoice.invoiceItems ?? []).map((item: any, i: number) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{item.name || item.product?.name || "Item"}</td>
                          <td className="px-3 py-2 text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-right">₹{Number(item.unitPrice).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">₹{Number(item.tax ?? 0).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">₹{Number(item.total ?? item.unitPrice * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-right space-y-1 pt-2 border-t">
                  <p>Subtotal: <strong>₹{Number(viewInvoice.subtotal ?? 0).toFixed(2)}</strong></p>
                  <p>Tax: <strong>₹{Number(viewInvoice.taxAmount ?? 0).toFixed(2)}</strong></p>
                  <p>Shipping: <strong>₹{Number(viewInvoice.shippingAmount ?? 0).toFixed(2)}</strong></p>
                  {viewInvoice.discountAmount > 0 && (
                    <p>Discount: <strong>-₹{Number(viewInvoice.discountAmount).toFixed(2)}</strong></p>
                  )}
                  <p className="text-lg font-bold pt-1">
                    Total: ₹{Number(viewInvoice.totalAmount ?? 0).toFixed(2)}
                  </p>
                </div>

                <Button className="w-full" onClick={() => handlePrint(viewInvoice)}>
                  <Download className="h-4 w-4 mr-2" /> Print Invoice
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
