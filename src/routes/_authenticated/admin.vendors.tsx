import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Store,
  Wallet,
  Building2,
  Copy,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Eye,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  RotateCcw,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  User,
  Package,
  Calendar,
  Search,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { formatMoney } from "@/lib/utils-app";
import {
  getAllAdminVendors,
  recordVendorMonthlyPayment,
  generateDuesNoticeDetails,
  recordDuesNoticeSent,
  suspendVendor,
  removeVendor,
  getAdminDuesSummary,
  AdminVendorRecord,
  CURRENT_BILLING_MONTH,
  getConfiguredMonthlyFee,
} from "@/lib/vendor-admin-service";

export const Route = createFileRoute("/_authenticated/admin/vendors")({
  head: () => ({ meta: [{ title: "Vendor & Dues Management — Admin" }] }),
  component: AdminVendorsPage,
});

function AdminVendorsPage() {
  const [vendorsList, setVendorsList] = useState<AdminVendorRecord[]>(() => getAllAdminVendors());
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unpaid" | "paid" | "suspended">("all");

  // Dialog States
  const [selectedVendor, setSelectedVendor] = useState<AdminVendorRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsActiveTab, setDetailsActiveTab] = useState<string>("details");

  // Dues Notice Modal State
  const [noticeVendor, setNoticeVendor] = useState<AdminVendorRecord | null>(null);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);

  // Record Payment Modal State
  const [paymentVendor, setPaymentVendor] = useState<AdminVendorRecord | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    month: CURRENT_BILLING_MONTH,
    amount: "500",
    utrNumber: "",
    paymentMethod: "Direct UPI",
    notes: "Monthly store maintenance fee",
  });

  // Suspend/Remove Confirmation State
  const [enforceVendor, setEnforceVendor] = useState<AdminVendorRecord | null>(null);
  const [enforceAction, setEnforceAction] = useState<"suspend" | "remove">("suspend");
  const [enforceModalOpen, setEnforceModalOpen] = useState(false);

  // Refresh data from storage
  const reloadData = () => {
    const fresh = getAllAdminVendors();
    setVendorsList(fresh);
    if (selectedVendor) {
      const updated = fresh.find((v) => v.id === selectedVendor.id);
      if (updated) setSelectedVendor(updated);
    }
  };

  // Summary Metrics
  const summary = useMemo(() => getAdminDuesSummary(), [vendorsList]);

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    return vendorsList.filter((v) => {
      // Exclude permanently removed from main view unless searching
      if (v.isRemoved && filterTab !== "suspended") return false;

      // Status tab filter
      if (filterTab === "unpaid" && v.dues.status === "PAID") return false;
      if (filterTab === "paid" && v.dues.status !== "PAID") return false;
      if (filterTab === "suspended" && !v.isSuspended && !v.isRemoved) return false;

      // Search match
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = v.name.toLowerCase().includes(q);
        const matchOwner = (v.ownerName || "").toLowerCase().includes(q);
        const matchEmail = (v.email || "").toLowerCase().includes(q);
        const matchPhone = (v.phone || "").includes(q);
        const matchCity = (v.city || "").toLowerCase().includes(q);
        const matchUpi = (v.payout?.upiId || "").toLowerCase().includes(q);
        return matchName || matchOwner || matchEmail || matchPhone || matchCity || matchUpi;
      }
      return true;
    });
  }, [vendorsList, search, filterTab]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return toast.error(`No ${label} available to copy`);
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  // Open Details Modal with optional default tab
  const handleOpenDetails = (v: AdminVendorRecord, tab = "details") => {
    setSelectedVendor(v);
    setDetailsActiveTab(tab);
    setDetailsOpen(true);
  };

  // Open Notice Modal
  const handleOpenNotice = (v: AdminVendorRecord) => {
    setNoticeVendor(v);
    setNoticeModalOpen(true);
  };

  // Open Record Payment Modal
  const handleOpenPayment = (v: AdminVendorRecord) => {
    setPaymentVendor(v);
    setPaymentForm({
      month: CURRENT_BILLING_MONTH,
      amount: String(v.dues.monthlyFee || getConfiguredMonthlyFee()),
      utrNumber: "",
      paymentMethod: "Direct UPI",
      notes: `Monthly fee for ${CURRENT_BILLING_MONTH}`,
    });
    setPaymentModalOpen(true);
  };

  // Submit Payment Record
  const handleSavePayment = () => {
    if (!paymentVendor) return;
    if (!paymentForm.utrNumber.trim()) {
      return toast.error("Please enter the 12-digit UPI UTR / Transaction Reference number");
    }

    recordVendorMonthlyPayment(paymentVendor.id, {
      month: paymentForm.month,
      amount: Number(paymentForm.amount) || 500,
      paymentMethod: paymentForm.paymentMethod,
      utrNumber: paymentForm.utrNumber.trim(),
      notes: paymentForm.notes,
    });

    toast.success(`Monthly fee marked as PAID for ${paymentVendor.name}! Status updated.`);
    setPaymentModalOpen(false);
    reloadData();
  };

  // Send Notice Email
  const handleSendEmailNotice = (v: AdminVendorRecord) => {
    const details = generateDuesNoticeDetails(v);
    recordDuesNoticeSent(v.id, "EMAIL");
    window.open(details.mailtoUrl, "_blank");
    toast.success(`Dues payment notice email opened for ${v.name}. Notice logged in vendor ledger.`);
    reloadData();
  };

  // Send WhatsApp Notice
  const handleSendWhatsAppNotice = (v: AdminVendorRecord) => {
    const details = generateDuesNoticeDetails(v);
    recordDuesNoticeSent(v.id, "WHATSAPP");
    window.open(details.whatsappUrl, "_blank");
    toast.success(`WhatsApp reminder notice generated for ${v.name} (${v.phone})`);
    reloadData();
  };

  // Open Suspend/Remove Modal
  const handleOpenEnforce = (v: AdminVendorRecord, action: "suspend" | "remove") => {
    setEnforceVendor(v);
    setEnforceAction(action);
    setEnforceModalOpen(true);
  };

  // Confirm Suspend/Remove
  const handleConfirmEnforce = () => {
    if (!enforceVendor) return;
    if (enforceAction === "suspend") {
      suspendVendor(enforceVendor.id);
      toast.warning(`Store "${enforceVendor.name}" has been suspended due to unpaid dues.`);
    } else {
      removeVendor(enforceVendor.id);
      toast.error(`Vendor "${enforceVendor.name}" has been removed from V2 Business.`);
    }
    setEnforceModalOpen(false);
    reloadData();
  };

  // Reactivate a suspended vendor
  const handleReactivate = (v: AdminVendorRecord) => {
    recordVendorMonthlyPayment(v.id, {
      notes: "Account reactivated by Admin",
    });
    toast.success(`Vendor "${v.name}" has been reactivated successfully!`);
    reloadData();
  };

  // Batch Auto-Notify all defaulting vendors
  const handleBatchAutoNotify = () => {
    if (summary.defaultingVendors.length === 0) {
      return toast.info("All vendors have cleared their monthly dues! No notices needed.");
    }

    summary.defaultingVendors.forEach((v) => {
      recordDuesNoticeSent(v.id, "AUTOMATED_SYSTEM");
    });

    toast.success(
      `Automated Dues Notices queued and recorded for all ${summary.defaultingVendors.length} defaulting vendors! Admin notification log updated.`
    );
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendor & Dues Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full 360° visibility: Track every vendor&apos;s store profile, <strong>monthly ₹500 maintenance dues</strong>,
          automated warning emails before removal, sales revenue, and complete <strong>customer order details</strong>.
        </p>
      </div>

      {/* ⚠️ ADMIN DUES ALERT CENTER: Visible when vendors have pending/overdue payments to the owner */}
      {summary.defaultingVendors.length > 0 && (
        <Card className="border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-amber-950 dark:text-amber-200">
                    ⚠️ Action Required: {summary.defaultingVendors.length} Vendor{summary.defaultingVendors.length > 1 ? "s" : ""} Have Pending Dues Payable to You
                  </h3>
                  <Badge variant="outline" className="border-amber-400 text-amber-800 dark:text-amber-300 font-bold bg-amber-100/50">
                    Total Due: {formatMoney(summary.totalPendingDues)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  The following vendors have not cleared their monthly store maintenance fee for <strong>{CURRENT_BILLING_MONTH}</strong>.
                  You can send them an official payment notice email & WhatsApp message with your UPI details before removing their store.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {summary.defaultingVendors.map((v) => (
                    <span
                      key={v.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30"
                    >
                      <Store className="h-3 w-3" />
                      {v.name} (₹{v.dues.monthlyFee})
                      <button
                        onClick={() => handleOpenNotice(v)}
                        title="Send Dues Warning Email"
                        className="ml-1 text-primary hover:underline font-bold"
                      >
                        ✉️ Notice
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 shadow-sm text-xs"
                onClick={handleBatchAutoNotify}
              >
                <Send className="h-3.5 w-3.5" /> Auto-Notify All Defaulting Vendors
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Overview Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-2 border-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Marketplace Vendors</span>
            <Store className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{summary.totalVendors}</span>
            <span className="text-xs text-emerald-600 font-medium">{summary.activeVendorsCount} Active</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{summary.suspendedVendorsCount} Suspended / Defaulting</p>
        </Card>

        <Card className="p-4 border-2 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Vendor Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatMoney(summary.totalMarketplaceRevenue)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{summary.totalMarketplaceOrders} Customer Orders Across Vendors</p>
        </Card>

        <Card className="p-4 border-2 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Monthly Dues Collected</span>
            <IndianRupee className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-400">
            {formatMoney(summary.totalCollectedDues)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{summary.paidVendorsCount} Vendors Paid for {CURRENT_BILLING_MONTH}</p>
        </Card>

        <Card className="p-4 border-2 border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">Pending Dues Receivable</span>
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-700 dark:text-purple-400">
            {formatMoney(summary.totalPendingDues)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{summary.defaultingVendors.length} Vendors with Pending Fee</p>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Button
            size="sm"
            variant={filterTab === "all" ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => setFilterTab("all")}
          >
            All Vendors ({vendorsList.filter((v) => !v.isRemoved).length})
          </Button>
          <Button
            size="sm"
            variant={filterTab === "unpaid" ? "default" : "outline"}
            className={`text-xs h-8 ${summary.defaultingVendors.length > 0 ? "border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10" : ""}`}
            onClick={() => setFilterTab("unpaid")}
          >
            ⚠️ Pending Dues ({summary.defaultingVendors.length})
          </Button>
          <Button
            size="sm"
            variant={filterTab === "paid" ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => setFilterTab("paid")}
          >
            🟢 Paid ({summary.paidVendorsCount})
          </Button>
          <Button
            size="sm"
            variant={filterTab === "suspended" ? "default" : "outline"}
            className="text-xs h-8 text-destructive"
            onClick={() => setFilterTab("suspended")}
          >
            🔴 Suspended / Removed ({summary.suspendedVendorsCount})
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search vendor, owner, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* Vendors Cards List */}
      {filteredVendors.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Store className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
          <p className="font-semibold text-foreground">No vendors found matching your filter</p>
          <p className="text-xs mt-1">Try resetting the search or selecting another tab.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredVendors.map((v) => {
            const isDefaulting = v.dues.status === "PENDING" || v.dues.status === "OVERDUE";
            const noticeCount = v.dues.noticeLogs?.length || 0;

            return (
              <Card
                key={v.id}
                className={`p-4 transition-all hover:shadow-md ${
                  v.isRemoved
                    ? "opacity-60 bg-muted/30 border-dashed"
                    : v.isSuspended
                    ? "border-destructive/40 bg-destructive/5"
                    : isDefaulting
                    ? "border-amber-500/40 bg-amber-500/[0.02]"
                    : "border-border"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Store Profile & Contact */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-base text-foreground flex items-center gap-1.5">
                        <Store className="h-4 w-4 text-primary" /> {v.name}
                      </h2>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {v.businessType === "physical_shop" ? "Physical Shop" : "Cloud/Online"}
                      </Badge>
                      {v.isRemoved ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Removed
                        </Badge>
                      ) : v.isSuspended ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Suspended
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px]">
                          Active Store
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-muted-foreground/70" />
                        <span className="font-medium text-foreground">{v.ownerName || "Owner"}</span>
                        <span>•</span>
                        <Phone className="h-3 w-3 text-muted-foreground/70" />
                        <span>{v.phone}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground/70" />
                        <span className="truncate">{v.email}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-muted-foreground/70" />
                        <span>{v.address}, {v.city}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <QrCode className="h-3 w-3 text-emerald-600" />
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300 font-mono">
                          UPI: {v.payout?.upiId || "Not added"}
                        </span>
                        {v.payout?.upiId && (
                          <button
                            onClick={() => copyToClipboard(v.payout.upiId, "Vendor UPI ID")}
                            className="text-muted-foreground hover:text-foreground"
                            title="Copy UPI ID"
                          >
                            <Copy className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Orders & Revenue Metrics */}
                  <div className="flex items-center gap-4 bg-muted/40 px-3.5 py-2 rounded-xl shrink-0">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Revenue</p>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {formatMoney(v.metrics.totalRevenue)}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Orders</p>
                      <button
                        onClick={() => handleOpenDetails(v, "orders")}
                        className="text-sm font-bold text-primary hover:underline"
                        title="Click to view Customer Orders"
                      >
                        {v.metrics.totalOrders} order{v.metrics.totalOrders !== 1 ? "s" : ""}
                      </button>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Products</p>
                      <p className="text-sm font-bold text-foreground">{v.productsCount}</p>
                    </div>
                  </div>

                  {/* Right Column: Monthly Maintenance Dues & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-2.5 shrink-0">
                    {/* Dues Status Badge */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground font-medium">Monthly Fee:</span>
                        {v.dues.status === "PAID" ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Paid ₹{v.dues.monthlyFee}
                          </Badge>
                        ) : v.dues.status === "OVERDUE" ? (
                          <Badge variant="destructive" className="font-bold text-xs gap-1 animate-pulse">
                            <AlertTriangle className="h-3 w-3" /> Overdue: ₹{v.dues.monthlyFee}
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs gap-1">
                            <Clock className="h-3 w-3" /> Due: ₹{v.dues.monthlyFee}
                          </Badge>
                        )}
                      </div>

                      <div className="text-[10px] text-muted-foreground">
                        {v.dues.status === "PAID" ? (
                          <span>Paid on {v.dues.lastPaidDate} {v.dues.lastUtr ? `(UTR: ${v.dues.lastUtr.slice(-6)})` : ""}</span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-400 font-medium">
                            {noticeCount > 0 ? `⚠️ ${noticeCount} notice${noticeCount > 1 ? "s" : ""} sent` : "No notice sent yet"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs font-semibold h-8"
                        onClick={() => handleOpenDetails(v, "details")}
                      >
                        <Eye className="h-3.5 w-3.5" /> Full Details & Orders
                      </Button>

                      {/* If unpaid, show quick warning button */}
                      {isDefaulting && (
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white gap-1 text-xs font-bold h-8"
                          onClick={() => handleOpenNotice(v)}
                        >
                          <Send className="h-3 w-3" /> Send Notice
                        </Button>
                      )}

                      {/* Quick Record Payment */}
                      {isDefaulting && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 gap-1 text-xs font-bold h-8"
                          onClick={() => handleOpenPayment(v)}
                        >
                          <CheckCircle2 className="h-3 w-3" /> Mark Paid
                        </Button>
                      )}

                      {/* More actions dropdown: Suspend / Remove / Reactivate */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuLabel>Vendor Enforcement</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenNotice(v)}>
                            <Mail className="h-3.5 w-3.5 mr-2 text-amber-600" /> Send Dues Notice Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendWhatsAppNotice(v)}>
                            <MessageSquare className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Send WhatsApp Notice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenPayment(v)}>
                            <IndianRupee className="h-3.5 w-3.5 mr-2 text-blue-600" /> Record Fee Payment (UTR)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {v.isSuspended ? (
                            <DropdownMenuItem onClick={() => handleReactivate(v)}>
                              <RotateCcw className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Reactivate Store
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleOpenEnforce(v, "suspend")}
                              className="text-amber-700 font-semibold"
                            >
                              <Ban className="h-3.5 w-3.5 mr-2" /> Suspend Store (Unpaid Dues)
                            </DropdownMenuItem>
                          )}
                          {!v.isRemoved && (
                            <DropdownMenuItem
                              onClick={() => handleOpenEnforce(v, "remove")}
                              className="text-destructive font-semibold"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove Vendor Account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3-TAB COMPREHENSIVE VENDOR DETAILS MODAL */}
      {/* ========================================================================= */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedVendor && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <Store className="h-5 w-5 text-primary" /> {selectedVendor.name}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    {selectedVendor.dues.status === "PAID" ? (
                      <Badge className="bg-emerald-600 text-white font-bold text-xs">
                        🟢 Dues Paid
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="font-bold text-xs">
                        ⚠️ {selectedVendor.dues.status}: ₹{selectedVendor.dues.monthlyFee}
                      </Badge>
                    )}
                  </div>
                </div>
                <DialogDescription className="text-xs">
                  Joined on {selectedVendor.joinedDate} • Registered in {selectedVendor.city} • {selectedVendor.productsCount} active products
                </DialogDescription>
              </DialogHeader>

              <Tabs value={detailsActiveTab} onValueChange={setDetailsActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="details" className="text-xs font-semibold">
                    1. Store & Payout
                  </TabsTrigger>
                  <TabsTrigger value="dues" className="text-xs font-semibold">
                    2. Monthly Dues & Notices
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="text-xs font-semibold">
                    3. Customer Orders ({selectedVendor.orders.length})
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: STORE & PAYOUT DETAILS */}
                <TabsContent value="details" className="space-y-4 pt-3">
                  {/* Direct Payout Receiving Credentials */}
                  <div className="rounded-xl border-2 border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <Wallet className="h-4 w-4 text-emerald-600" /> Vendor Payout Receiving Account (Direct UPI)
                      </h4>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 text-[10px]">
                        0% Commission Marketplace
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1.5">
                        <span className="text-muted-foreground font-medium">Beneficiary Name:</span>
                        <span className="font-bold text-foreground">{selectedVendor.payout.accountHolder}</span>
                      </div>

                      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1.5">
                        <span className="text-muted-foreground font-medium">Direct UPI ID:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-950 dark:text-emerald-100 text-sm">
                            {selectedVendor.payout.upiId || "Not added yet"}
                          </span>
                          {selectedVendor.payout.upiId && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-emerald-700"
                              onClick={() => copyToClipboard(selectedVendor.payout.upiId, "Vendor UPI ID")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1.5">
                        <span className="text-muted-foreground font-medium">Bank Name:</span>
                        <span className="font-medium text-foreground">{selectedVendor.payout.bankName}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Bank Account & IFSC:</span>
                        <span className="font-mono font-medium text-foreground">
                          {selectedVendor.payout.accountNumber ? `${selectedVendor.payout.accountNumber} (${selectedVendor.payout.ifscCode})` : "Direct UPI Preferred"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Store & Contact Credentials */}
                  <div className="rounded-xl border p-4 space-y-2.5 bg-muted/20 text-xs">
                    <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-primary" /> Store Information & Owner Contact
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-muted-foreground">Owner / Contact Person:</span>
                        <p className="font-bold text-foreground mt-0.5">{selectedVendor.ownerName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact Phone / WhatsApp:</span>
                        <p className="font-bold text-foreground mt-0.5">{selectedVendor.phone}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Registered Email:</span>
                        <p className="font-bold text-foreground mt-0.5">{selectedVendor.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">GSTIN Number:</span>
                        <p className="font-mono font-bold text-foreground mt-0.5">{selectedVendor.gstNumber}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Physical Store Address:</span>
                        <p className="font-medium text-foreground mt-0.5 leading-relaxed">
                          {selectedVendor.address}, {selectedVendor.city}, {selectedVendor.state} - {selectedVendor.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 2: MONTHLY DUES & AUTOMATED WARNING NOTICES */}
                <TabsContent value="dues" className="space-y-4 pt-3">
                  {/* Current Dues Overview Banner */}
                  <div className="rounded-xl border-2 border-primary/20 bg-muted/40 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Current Billing Cycle: {selectedVendor.dues.currentMonth}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl font-bold">
                            Monthly Maintenance Fee: ₹{selectedVendor.dues.monthlyFee}
                          </span>
                          {selectedVendor.dues.status === "PAID" ? (
                            <Badge className="bg-emerald-600 text-white font-bold">PAID</Badge>
                          ) : (
                            <Badge variant="destructive" className="font-bold">
                              {selectedVendor.dues.status}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1"
                          onClick={() => handleOpenPayment(selectedVendor)}
                        >
                          <IndianRupee className="h-3.5 w-3.5" /> Record Fee Payment
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-500/50 text-amber-800 dark:text-amber-300 gap-1 text-xs font-bold"
                          onClick={() => handleOpenNotice(selectedVendor)}
                        >
                          <Send className="h-3.5 w-3.5" /> Send Warning Notice
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t text-xs">
                      <div>
                        <span className="text-muted-foreground">Due Date:</span>
                        <p className="font-medium">{selectedVendor.dues.dueDate}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Payment Date:</span>
                        <p className="font-medium">{selectedVendor.dues.lastPaidDate || "None"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last UTR Reference:</span>
                        <p className="font-mono font-medium">{selectedVendor.dues.lastUtr || "None"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Warning Notice Logs (Audit trail of emails / whatsapp sent before removal) */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-amber-600" /> Dues Warning Notices Dispatched Before Removal
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {selectedVendor.dues.noticeLogs?.length || 0} notice(s) logged
                      </span>
                    </h4>

                    {(!selectedVendor.dues.noticeLogs || selectedVendor.dues.noticeLogs.length === 0) ? (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-dashed">
                        No warning notices have been sent to this vendor yet. Before suspending or removing a defaulting vendor, click &quot;Send Warning Notice&quot; above.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {selectedVendor.dues.noticeLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              {log.channel === "EMAIL" ? (
                                <Mail className="h-3.5 w-3.5 text-amber-700" />
                              ) : log.channel === "WHATSAPP" ? (
                                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                              )}
                              <span className="font-bold">
                                {log.channel === "EMAIL" ? "Notice Email Dispatched" : log.channel === "WHATSAPP" ? "WhatsApp Warning Sent" : "Automated System Alert"}
                              </span>
                              <span className="text-muted-foreground">to {log.recipient}</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {new Date(log.sentAt).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Complete Dues Payment History Table */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" /> Monthly Maintenance Fee Payment History
                    </h4>
                    <div className="border rounded-xl overflow-hidden text-xs">
                      <table className="w-full">
                        <thead className="bg-muted/60 text-muted-foreground text-left">
                          <tr>
                            <th className="p-2.5">Billing Month</th>
                            <th className="p-2.5">Fee Amount</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">Payment Date</th>
                            <th className="p-2.5">UPI UTR / Ref</th>
                            <th className="p-2.5">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {selectedVendor.dues.history?.map((item) => (
                            <tr key={item.id} className="hover:bg-muted/30">
                              <td className="p-2.5 font-bold">{item.month}</td>
                              <td className="p-2.5 font-mono">₹{item.amount}</td>
                              <td className="p-2.5">
                                {item.status === "PAID" ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    PAID
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                    {item.status}
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-muted-foreground">{item.paidAt || "—"}</td>
                              <td className="p-2.5 font-mono">{item.utrNumber || "—"}</td>
                              <td className="p-2.5 text-muted-foreground">{item.notes || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Suspension & Removal Actions */}
                  <div className="pt-3 border-t flex items-center justify-between gap-3">
                    <div>
                      <h5 className="font-bold text-xs text-destructive flex items-center gap-1">
                        <Ban className="h-3.5 w-3.5" /> Vendor Account Enforcement
                      </h5>
                      <p className="text-[11px] text-muted-foreground">
                        If this vendor refuses to pay monthly dues after notice, you can suspend their storefront or remove their account.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-700 border-amber-500/40 hover:bg-amber-500/10 text-xs font-semibold"
                        onClick={() => handleOpenEnforce(selectedVendor, "suspend")}
                      >
                        Suspend Store
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs font-semibold"
                        onClick={() => handleOpenEnforce(selectedVendor, "remove")}
                      >
                        Remove Vendor
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 3: CUSTOMER ORDERS & REVENUE (CUSTOMER DETAILS DRILLDOWN) */}
                <TabsContent value="orders" className="space-y-4 pt-3">
                  {/* Revenue Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border p-3 bg-emerald-500/5">
                      <span className="text-[11px] text-muted-foreground font-semibold">Total Vendor Revenue</span>
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {formatMoney(selectedVendor.metrics.totalRevenue)}
                      </p>
                    </div>
                    <div className="rounded-xl border p-3 bg-blue-500/5">
                      <span className="text-[11px] text-muted-foreground font-semibold">Total Customer Orders</span>
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                        {selectedVendor.metrics.totalOrders}
                      </p>
                    </div>
                    <div className="rounded-xl border p-3 bg-purple-500/5">
                      <span className="text-[11px] text-muted-foreground font-semibold">Average Order Value</span>
                      <p className="text-lg font-bold text-purple-700 dark:text-purple-400 mt-0.5">
                        {formatMoney(selectedVendor.metrics.averageOrderValue)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Orders List with Full Customer Details */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="h-4 w-4 text-primary" /> Customer Orders Placed with {selectedVendor.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        Showing customer contact details, items & UPI UTR
                      </span>
                    </h4>

                    {selectedVendor.orders.length === 0 ? (
                      <p className="text-center py-8 text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        No orders recorded yet for this vendor.
                      </p>
                    ) : (
                      selectedVendor.orders.map((ord) => (
                        <div key={ord.id} className="rounded-xl border p-4 space-y-3 bg-card text-xs">
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-foreground">{ord.orderId}</span>
                              {ord.invoiceNumber && (
                                <Badge variant="outline" className="font-mono text-[10px]">
                                  {ord.invoiceNumber}
                                </Badge>
                              )}
                              <Badge className="bg-emerald-600 text-white text-[10px]">
                                {ord.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Order Total:</span>
                              <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                                {formatMoney(ord.totalAmount)}
                              </span>
                            </div>
                          </div>

                          {/* 👤 CUSTOMER DETAILS ONLY (As Requested) */}
                          <div className="rounded-lg bg-primary/5 border border-primary/15 p-3 space-y-2">
                            <h5 className="font-bold text-primary flex items-center gap-1.5 text-xs">
                              <User className="h-3.5 w-3.5" /> Customer Contact & Delivery Details
                            </h5>
                            <div className="grid sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Customer Full Name:</span>
                                <p className="font-bold text-foreground mt-0.5">{ord.customerName}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Mobile Phone:</span>
                                <p className="font-bold text-foreground mt-0.5">{ord.customerPhone}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Email:</span>
                                <p className="font-medium text-foreground mt-0.5">{ord.customerEmail}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Delivery Address:</span>
                                <p className="font-medium text-foreground mt-0.5">
                                  {ord.shippingAddress?.street}, {ord.shippingAddress?.city} - {ord.shippingAddress?.zipCode}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Direct UPI Payment & UTR */}
                          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <div className="flex items-center gap-2">
                              <QrCode className="h-3.5 w-3.5 text-emerald-700" />
                              <span className="font-semibold text-emerald-950 dark:text-emerald-200">Payment: {ord.paymentMethod}</span>
                              <span className="font-mono font-bold text-emerald-900 dark:text-emerald-300">
                                UTR: {ord.utrNumber || "Direct UPI"}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              Date: {new Date(ord.createdAt).toLocaleString("en-IN")}
                            </span>
                          </div>

                          {/* Items Breakdown */}
                          <div>
                            <span className="text-[11px] font-semibold text-muted-foreground">Ordered Products:</span>
                            <div className="mt-1 space-y-1">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs text-foreground py-0.5">
                                  <span>{it.name} <span className="text-muted-foreground">× {it.quantity}</span></span>
                                  <span className="font-medium font-mono">{formatMoney(it.total)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DUES WARNING EMAIL & WHATSAPP MODAL (BEFORE REMOVAL) */}
      {/* ========================================================================= */}
      <Dialog open={noticeModalOpen} onOpenChange={setNoticeModalOpen}>
        <DialogContent className="max-w-xl">
          {noticeVendor && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
                  <Mail className="h-5 w-5" /> Send Monthly Dues Notice to {noticeVendor.name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  This official payment warning is dispatched to the vendor before removing or suspending their store from V2 Business.
                </DialogDescription>
              </DialogHeader>

              {(() => {
                const details = generateDuesNoticeDetails(noticeVendor);
                return (
                  <div className="space-y-3 text-xs">
                    <div className="rounded-lg border p-3 space-y-1.5 bg-muted/30">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">To:</span>
                        <span className="font-bold text-foreground">{noticeVendor.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">WhatsApp:</span>
                        <span className="font-bold text-foreground">{noticeVendor.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Amount Due:</span>
                        <span className="font-bold text-destructive font-mono">₹{details.fee} ({details.month})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Platform Owner UPI:</span>
                        <span className="font-bold text-emerald-700 font-mono">{details.bank.upiId}</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-muted-foreground">Email Preview:</span>
                      <pre className="mt-1 p-3 bg-card border rounded-lg text-[11px] leading-relaxed font-sans whitespace-pre-wrap max-h-48 overflow-y-auto text-foreground">
                        {details.emailBody}
                      </pre>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold gap-2 text-xs"
                        onClick={() => {
                          handleSendEmailNotice(noticeVendor);
                          setNoticeModalOpen(false);
                        }}
                      >
                        <Mail className="h-4 w-4" /> Open in Email Client (Mailto)
                      </Button>

                      <Button
                        variant="outline"
                        className="flex-1 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/10 font-bold gap-2 text-xs"
                        onClick={() => {
                          handleSendWhatsAppNotice(noticeVendor);
                          setNoticeModalOpen(false);
                        }}
                      >
                        <MessageSquare className="h-4 w-4" /> Send via WhatsApp
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* RECORD MONTHLY PAYMENT MODAL */}
      {/* ========================================================================= */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-md">
          {paymentVendor && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" /> Record Monthly Fee Payment
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Mark monthly maintenance fee as PAID for <strong>{paymentVendor.name}</strong> upon receiving transfer to your platform account.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold">Billing Month</label>
                  <Input
                    value={paymentForm.month}
                    onChange={(e) => setPaymentForm({ ...paymentForm, month: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold">Fee Amount (₹)</label>
                  <Input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="mt-1 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold">Payment Mode</label>
                  <Input
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold">12-Digit UPI Transaction ID / UTR Number *</label>
                  <Input
                    placeholder="e.g. 426189021849"
                    value={paymentForm.utrNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, utrNumber: e.target.value })}
                    className="mt-1 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold">Admin Notes (Optional)</label>
                  <Input
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="ghost" onClick={() => setPaymentModalOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={handleSavePayment}>
                  Save & Mark Paid
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* SUSPEND / REMOVE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Dialog open={enforceModalOpen} onOpenChange={setEnforceModalOpen}>
        <DialogContent className="max-w-md">
          {enforceVendor && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  {enforceAction === "suspend" ? "Suspend Vendor Store?" : "Permanently Remove Vendor?"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {enforceAction === "suspend"
                    ? `Suspending "${enforceVendor.name}" will hide their products from the marketplace while keeping their account.`
                    : `Removing "${enforceVendor.name}" will completely terminate their store on V2 Business.`}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border p-3 bg-muted/40 space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>Vendor:</span>
                  <span>{enforceVendor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Outstanding Dues:</span>
                  <span className="font-bold text-destructive font-mono">₹{enforceVendor.dues.monthlyFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Notice Email Status:</span>
                  <span className={enforceVendor.dues.noticeLogs?.length ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                    {enforceVendor.dues.noticeLogs?.length ? `✅ Sent (${enforceVendor.dues.noticeLogs.length} time)` : "⚠️ Notice Not Sent Yet"}
                  </span>
                </div>
              </div>

              {(!enforceVendor.dues.noticeLogs || enforceVendor.dues.noticeLogs.length === 0) && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
                  <strong>Recommendation:</strong> You have not sent a Dues Warning Notice to this vendor yet. It is recommended to click <strong>&quot;Send Notice First&quot;</strong> before taking action.
                </div>
              )}

              <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    setEnforceModalOpen(false);
                    handleOpenNotice(enforceVendor);
                  }}
                >
                  <Mail className="h-3.5 w-3.5 mr-1 text-amber-600" /> Send Notice First
                </Button>
                <Button
                  variant={enforceAction === "remove" ? "destructive" : "default"}
                  className="text-xs font-bold"
                  onClick={handleConfirmEnforce}
                >
                  {enforceAction === "suspend" ? "Confirm Suspension" : "Confirm Permanent Removal"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminVendorsPage;
