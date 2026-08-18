import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils-app";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/invoices")({
  head: () => ({ meta: [{ title: "Invoice Management — Admin" }] }),
  component: AdminInvoicesPage,
});

function AdminInvoicesPage() {
  const [search, setSearch] = useState("");
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: () => api.getAdminInvoices(),
  });

  const statusColor: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    sent: "bg-blue-100 text-blue-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  const filtered = (invoices as any[]).filter((inv) =>
    inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    inv.vendor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = (inv: any) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Invoice ${inv.invoiceNumber}</title>
      <style>body{font-family:sans-serif;padding:32px;max-width:700px;margin:auto}table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #eee}th{background:#f8f8f8}.total{font-size:1.2em;font-weight:bold}</style>
      </head><body>
      <h2>Invoice #${inv.invoiceNumber}</h2>
      <p>Date: ${new Date(inv.issueDate || inv.createdAt).toLocaleDateString("en-IN")}</p>
      <p>Vendor: ${inv.vendor?.name ?? "—"}</p>
      <p>Customer: ${inv.customer?.name ?? inv.customer?.email ?? "—"}</p>
      <p>Status: ${inv.status}</p>
      <hr/>
      <table><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Total</th></tr>
      ${(inv.invoiceItems ?? []).map((i: any) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.unitPrice}</td><td>₹${i.tax?.toFixed(2) ?? 0}</td><td>₹${i.total?.toFixed(2)}</td></tr>`).join("")}
      </table><br/>
      <p>Subtotal: ₹${inv.subtotal?.toFixed(2)}</p>
      <p>Tax: ₹${inv.taxAmount?.toFixed(2)}</p>
      <p>Shipping: ₹${inv.shippingAmount?.toFixed(2)}</p>
      <p>Discount: -₹${inv.discountAmount?.toFixed(2)}</p>
      <p class="total">Total: ₹${inv.totalAmount?.toFixed(2)}</p>
      </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invoice Management</h1>
        <p className="text-sm text-muted-foreground mt-1">View and download all marketplace invoices</p>
      </div>
      <input
        className="border rounded-lg px-3 py-2 text-sm w-full max-w-sm"
        placeholder="Search by invoice #, vendor, customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading invoices…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No invoices found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv: any) => (
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
                    Vendor: {inv.vendor?.name ?? "—"} · Customer: {inv.customer?.name ?? inv.customer?.email ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(inv.issueDate || inv.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold">₹{inv.totalAmount?.toFixed(2)}</p>
                  <Button size="sm" variant="outline" onClick={() => handlePrint(inv)}>
                    <Download className="h-3 w-3 mr-1" /> Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
