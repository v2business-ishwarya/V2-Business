import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { useState } from "react";
import { toast } from "sonner";
import {
  Wallet,
  Building2,
  Copy,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Store,
  QrCode,
  Eye,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/vendors")({
  component: AdminVendors,
});

function AdminVendors() {
  const qc = useQueryClient();
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: () => api.getAdminUsers({ role: "VENDOR" }),
  });

  const vendors: any[] = (data as any)?.data ?? (Array.isArray(data) ? data : []);

  const updateMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.updateAdminUser(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vendors"] });
      toast.success("Vendor status updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update vendor"),
  });

  const handleOpenDetails = (v: any) => {
    // Read vendor store profile and payout details from storage or backend payload
    let storeData: any = {};
    let payoutData: any = {};

    try {
      const storedStore = localStorage.getItem(`vendor_store_${v.id}`);
      if (storedStore) storeData = JSON.parse(storedStore);
    } catch {}

    try {
      const storedPayout = localStorage.getItem(`vendor_payout_${v.id}`);
      if (storedPayout) payoutData = JSON.parse(storedPayout);
    } catch {}

    setSelectedVendor({
      ...v,
      phone: storeData.phone || "—",
      businessType: storeData.businessType || "physical_shop",
      gstNumber: storeData.gstNumber || (storeData.isGstExempt ? "GST Exempt Seller" : "Not Provided"),
      address: storeData.address
        ? `${storeData.address}, ${storeData.city || ""}, ${storeData.state || ""} ${storeData.pincode ? "- " + storeData.pincode : ""}`
        : "Address not set yet",
      payout: {
        accountHolder: payoutData.accountHolder || storeData.name || v.name || "Vendor",
        bankName: payoutData.bankName || storeData.bankName || "Not Provided",
        accountNumber: payoutData.accountNumber || storeData.bankAccount || "",
        ifscCode: payoutData.ifscCode || storeData.ifscCode || "",
        upiId: payoutData.upiId || storeData.upiId || "",
      },
    });
    setDetailsOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return toast.error(`No ${label} available to copy`);
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading vendors…</div>;
  if (vendors.length === 0)
    return <EmptyState title="No vendors" description="Vendor accounts will appear here." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Vendor Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage, approve marketplace sellers, and access their receiving bank & UPI payout details for sales disbursals.
        </p>
      </div>

      <div className="space-y-2">
        {vendors.map((v) => (
          <Card key={v.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{v.name || v.email}</p>
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>{v.email ?? "—"}</span>
                <span>•</span>
                <span>Joined {new Date(v.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs font-semibold"
                onClick={() => handleOpenDetails(v)}
              >
                <Eye className="h-3.5 w-3.5" /> Payout & Store Info
              </Button>

              <Badge variant={v.isActive ? "default" : "secondary"}>
                {v.isActive ? "Active" : "Suspended"}
              </Badge>

              {!v.isActive && (
                <Button
                  size="sm"
                  onClick={() => updateMutation.mutate({ id: v.id, isActive: true })}
                  disabled={updateMutation.isPending}
                >
                  Approve / Activate
                </Button>
              )}
              {v.isActive && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => updateMutation.mutate({ id: v.id, isActive: false })}
                  disabled={updateMutation.isPending}
                >
                  Suspend
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog for Viewing Vendor Payout & Profile Details */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5 text-primary" /> {selectedVendor?.name || "Vendor Store Details"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Registered business profile and payout bank/UPI credentials for disbursing sales earnings.
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-4 pt-2 text-xs">
              {/* 1. Direct Payout Receiving Credentials */}
              <div className="rounded-xl border-2 border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                    <Wallet className="h-4 w-4 text-emerald-600" /> Vendor Payout Receiving Account
                  </h3>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 text-[10px]">
                    0% Commission Payout
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1.5">
                    <span className="text-muted-foreground font-medium">Beneficiary Name:</span>
                    <span className="font-bold text-foreground">{selectedVendor.payout.accountHolder}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1.5">
                    <span className="text-muted-foreground font-medium">Bank Name:</span>
                    <span className="font-bold text-foreground">{selectedVendor.payout.bankName}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1.5">
                    <span className="text-muted-foreground font-medium">Account Number:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-foreground">
                        {selectedVendor.payout.accountNumber || "Not added yet"}
                      </span>
                      {selectedVendor.payout.accountNumber && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          title="Copy Account Number"
                          onClick={() => copyToClipboard(selectedVendor.payout.accountNumber, "Bank Account Number")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1.5">
                    <span className="text-muted-foreground font-medium">Bank IFSC Code:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-foreground">
                        {selectedVendor.payout.ifscCode || "Not added yet"}
                      </span>
                      {selectedVendor.payout.ifscCode && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          title="Copy IFSC Code"
                          onClick={() => copyToClipboard(selectedVendor.payout.ifscCode, "IFSC Code")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-emerald-900 font-bold flex items-center gap-1">
                      <QrCode className="h-3.5 w-3.5 text-emerald-600" /> Instant UPI ID:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-emerald-950">
                        {selectedVendor.payout.upiId || "Not added yet"}
                      </span>
                      {selectedVendor.payout.upiId && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-emerald-700 hover:text-emerald-900"
                          title="Copy UPI ID"
                          onClick={() => copyToClipboard(selectedVendor.payout.upiId, "UPI ID")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Store & Contact Details */}
              <div className="rounded-xl border p-4 space-y-2 bg-muted/20">
                <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary" /> Store Credentials
                </h3>
                <div className="grid gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-foreground">{selectedVendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium text-foreground">{selectedVendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">GSTIN:</span>
                    <span className="font-medium text-foreground font-mono">{selectedVendor.gstNumber}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium text-foreground leading-relaxed">{selectedVendor.address}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
