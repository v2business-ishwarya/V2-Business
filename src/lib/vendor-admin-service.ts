/**
 * Vendor Admin Service
 * Handles vendor directory aggregation, revenue & order metrics with customer details,
 * monthly store maintenance fee dues tracking (₹500/month), automated notice dispatching,
 * and vendor suspension/removal enforcement.
 */

export interface VendorCustomerOrder {
  id: string;
  orderId: string;
  invoiceNumber?: string;
  vendorId: string;
  vendorName: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    zipCode: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  utrNumber?: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
}

export interface MonthlyDuesPaymentRecord {
  id: string;
  month: string; // e.g. "Sep 2026"
  amount: number;
  status: "PAID" | "PENDING" | "OVERDUE" | "WAIVED";
  paidAt?: string;
  paymentMethod?: string;
  utrNumber?: string;
  notes?: string;
}

export interface DuesNoticeLog {
  id: string;
  vendorId: string;
  sentAt: string;
  channel: "EMAIL" | "WHATSAPP" | "AUTOMATED_SYSTEM";
  recipient: string;
  amountDue: number;
  month: string;
  status: "SENT" | "DELIVERED";
}

export interface AdminVendorRecord {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  businessType: string;
  gstNumber: string;
  isActive: boolean;
  isSuspended?: boolean;
  isRemoved?: boolean;
  joinedDate: string;
  productsCount: number;
  payout: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
  };
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  };
  orders: VendorCustomerOrder[];
  dues: {
    monthlyFee: number;
    currentMonth: string; // e.g. "September 2026"
    status: "PAID" | "PENDING" | "OVERDUE" | "PROMO";
    dueDate: string;
    lastPaidDate?: string;
    lastUtr?: string;
    totalPaidDues: number;
    outstandingDues: number;
    noticeLogs: DuesNoticeLog[];
    history: MonthlyDuesPaymentRecord[];
  };
}

// Current platform billing period
export const CURRENT_BILLING_MONTH = "September 2026";
export const DEFAULT_MONTHLY_FEE = 500;

// Sample Rajahmundry Vendors for complete initial admin visibility
const SEED_VENDORS = [
  {
    id: "ven_lakshmi_grocery",
    name: "Lakshmi Ganapathi Supermarket",
    ownerName: "Venkata Satyanarayana",
    email: "lakshmi.grocery@gmail.com",
    phone: "+91 98480 23456",
    address: "Main Road, Danavaipeta",
    city: "Rajahmundry",
    state: "Andhra Pradesh",
    pincode: "533103",
    businessType: "physical_shop",
    gstNumber: "37AAACL1234F1Z8",
    isActive: true,
    joinedDate: "2026-01-15",
    productsCount: 48,
    payout: {
      accountHolder: "Lakshmi Ganapathi Supermarket",
      bankName: "State Bank of India",
      accountNumber: "38920192837",
      ifscCode: "SBIN0001234",
      upiId: "lakshmigrocery@sbi",
    },
    dues: {
      status: "PAID" as const,
      lastPaidDate: "2026-09-04",
      lastUtr: "426189021849",
      history: [
        { id: "due_sep_1", month: "Sep 2026", amount: 500, status: "PAID" as const, paidAt: "2026-09-04", paymentMethod: "Direct UPI", utrNumber: "426189021849", notes: "Monthly store maintenance fee" },
        { id: "due_aug_1", month: "Aug 2026", amount: 500, status: "PAID" as const, paidAt: "2026-08-05", paymentMethod: "Direct UPI", utrNumber: "423189021990", notes: "Monthly store maintenance fee" },
      ],
    },
    orders: [
      {
        id: "ord_cust_101",
        orderId: "ORD-982101",
        invoiceNumber: "INV-982101-LAK1",
        vendorId: "ven_lakshmi_grocery",
        vendorName: "Lakshmi Ganapathi Supermarket",
        customerName: "K. Sravani Devi",
        customerPhone: "+91 94401 88291",
        customerEmail: "sravani.k@gmail.com",
        shippingAddress: {
          street: "Plot 42, Srinagar Colony, Near Venkateswara Temple",
          city: "Rajahmundry",
          state: "Andhra Pradesh",
          zipCode: "533103",
        },
        items: [
          { name: "Sona Masoori Raw Rice (25kg Bag)", quantity: 1, unitPrice: 1450, total: 1450 },
          { name: "Freedom Refined Sunflower Oil (1L Pouch)", quantity: 2, unitPrice: 135, total: 270 },
          { name: "Tata Salt Crystal (1kg)", quantity: 2, unitPrice: 28, total: 56 },
        ],
        totalAmount: 1776,
        paymentMethod: "Direct UPI",
        utrNumber: "426189192834",
        status: "DELIVERED" as const,
        createdAt: "2026-09-24T14:30:00.000Z",
      },
      {
        id: "ord_cust_102",
        orderId: "ORD-982108",
        invoiceNumber: "INV-982108-LAK2",
        vendorId: "ven_lakshmi_grocery",
        vendorName: "Lakshmi Ganapathi Supermarket",
        customerName: "B. Ramesh Babu",
        customerPhone: "+91 98492 11029",
        customerEmail: "ramesh.babu@yahoo.com",
        shippingAddress: {
          street: "D.No 7-3-12, Alcot Gardens",
          city: "Rajahmundry",
          state: "Andhra Pradesh",
          zipCode: "533101",
        },
        items: [
          { name: "Organic Toor Dal Premium (1kg)", quantity: 2, unitPrice: 185, total: 370 },
          { name: "Aashirvaad Select Sharbati Atta (5kg)", quantity: 1, unitPrice: 340, total: 340 },
        ],
        totalAmount: 710,
        paymentMethod: "Direct UPI",
        utrNumber: "426290119283",
        status: "CONFIRMED" as const,
        createdAt: "2026-09-26T11:15:00.000Z",
      },
    ],
  },
  {
    id: "ven_kanyaka_silks",
    name: "Sri Kanyaka Parameswari Silks",
    ownerName: "P. Mallikarjuna Rao",
    email: "kanyaka.silks@rediffmail.com",
    phone: "+91 98481 99201",
    address: "Main Bazar, Near Kotagummam",
    city: "Rajahmundry",
    state: "Andhra Pradesh",
    pincode: "533101",
    businessType: "physical_shop",
    gstNumber: "37AAKCS9921B1Z2",
    isActive: true,
    joinedDate: "2026-02-10",
    productsCount: 65,
    payout: {
      accountHolder: "Sri Kanyaka Silks",
      bankName: "HDFC Bank",
      accountNumber: "5020008892182",
      ifscCode: "HDFC0000456",
      upiId: "kanyakasilks@okhdfcbank",
    },
    dues: {
      status: "OVERDUE" as const,
      lastPaidDate: "2026-08-02",
      lastUtr: "423019283741",
      history: [
        { id: "due_aug_2", month: "Aug 2026", amount: 500, status: "PAID" as const, paidAt: "2026-08-02", paymentMethod: "Direct UPI", utrNumber: "423019283741", notes: "Monthly maintenance fee" },
        { id: "due_sep_2", month: "Sep 2026", amount: 500, status: "OVERDUE" as const, notes: "Payment overdue by 22 days" },
      ],
    },
    orders: [
      {
        id: "ord_cust_201",
        orderId: "ORD-983301",
        invoiceNumber: "INV-983301-KAN1",
        vendorId: "ven_kanyaka_silks",
        vendorName: "Sri Kanyaka Parameswari Silks",
        customerName: "V. Lakshmi Prasanna",
        customerPhone: "+91 97012 34567",
        customerEmail: "prasanna.v@outlook.com",
        shippingAddress: {
          street: "Flat 204, Sai Balaji Enclave, Prakash Nagar",
          city: "Rajahmundry",
          state: "Andhra Pradesh",
          zipCode: "533103",
        },
        items: [
          { name: "Uppada Pure Silk Pattu Saree with Gold Zari", quantity: 1, unitPrice: 7800, total: 7800 },
        ],
        totalAmount: 7800,
        paymentMethod: "Direct UPI",
        utrNumber: "426101928471",
        status: "DELIVERED" as const,
        createdAt: "2026-09-22T16:45:00.000Z",
      },
    ],
  },
  {
    id: "ven_durga_jewellers",
    name: "Vijaya Durga Jewellers & Gold Works",
    ownerName: "G. V. Ramana Murthy",
    email: "vijayadurga.jewel@gmail.com",
    phone: "+91 94403 77123",
    address: "Kothapet Gold Market Lane",
    city: "Rajahmundry",
    state: "Andhra Pradesh",
    pincode: "533101",
    businessType: "physical_shop",
    gstNumber: "37AAGVD8831K1ZM",
    isActive: true,
    joinedDate: "2026-03-01",
    productsCount: 32,
    payout: {
      accountHolder: "Vijaya Durga Jewellers",
      bankName: "ICICI Bank",
      accountNumber: "024105008912",
      ifscCode: "ICIC0000241",
      upiId: "vijayadurgajewels@icici",
    },
    dues: {
      status: "PENDING" as const,
      lastPaidDate: "2026-08-06",
      lastUtr: "423401928374",
      history: [
        { id: "due_aug_3", month: "Aug 2026", amount: 500, status: "PAID" as const, paidAt: "2026-08-06", paymentMethod: "Direct UPI", utrNumber: "423401928374", notes: "August maintenance fee" },
        { id: "due_sep_3", month: "Sep 2026", amount: 500, status: "PENDING" as const, notes: "Due for September" },
      ],
    },
    orders: [
      {
        id: "ord_cust_301",
        orderId: "ORD-984401",
        invoiceNumber: "INV-984401-VIJ1",
        vendorId: "ven_durga_jewellers",
        vendorName: "Vijaya Durga Jewellers & Gold Works",
        customerName: "Ch. Anitha Rao",
        customerPhone: "+91 99890 44321",
        customerEmail: "anitha.ch@gmail.com",
        shippingAddress: {
          street: "Door No. 12-4-8, Tilak Road",
          city: "Rajahmundry",
          state: "Andhra Pradesh",
          zipCode: "533101",
        },
        items: [
          { name: "Silver 925 Peacock Design Temple Anklets (1 Pair)", quantity: 1, unitPrice: 3250, total: 3250 },
          { name: "1 Gram Gold Micro Plated Bridal Haram", quantity: 1, unitPrice: 1950, total: 1950 },
        ],
        totalAmount: 5200,
        paymentMethod: "Direct UPI",
        utrNumber: "426301928584",
        status: "CONFIRMED" as const,
        createdAt: "2026-09-25T18:20:00.000Z",
      },
    ],
  },
  {
    id: "ven_sai_mobiles",
    name: "Sai Krishna Mobiles & Gadgets",
    ownerName: "K. Sai Krishna",
    email: "saikrishna.mobiles@gmail.com",
    phone: "+91 99660 55443",
    address: "Stadium Road, Near Kambalacheruvu",
    city: "Rajahmundry",
    state: "Andhra Pradesh",
    pincode: "533105",
    businessType: "physical_shop",
    gstNumber: "37AABSK6621L1Z9",
    isActive: true,
    joinedDate: "2026-04-12",
    productsCount: 54,
    payout: {
      accountHolder: "Sai Krishna Mobiles",
      bankName: "Axis Bank",
      accountNumber: "9180200881239",
      ifscCode: "UTIB0000192",
      upiId: "saikrishnamobiles@axisbank",
    },
    dues: {
      status: "PAID" as const,
      lastPaidDate: "2026-09-02",
      lastUtr: "426019284712",
      history: [
        { id: "due_sep_4", month: "Sep 2026", amount: 500, status: "PAID" as const, paidAt: "2026-09-02", paymentMethod: "Direct UPI", utrNumber: "426019284712", notes: "Paid via UPI" },
      ],
    },
    orders: [
      {
        id: "ord_cust_401",
        orderId: "ORD-985501",
        invoiceNumber: "INV-985501-SAI1",
        vendorId: "ven_sai_mobiles",
        vendorName: "Sai Krishna Mobiles & Gadgets",
        customerName: "M. Sandeep Varma",
        customerPhone: "+91 98490 66778",
        customerEmail: "sandeep.varma@gmail.com",
        shippingAddress: {
          street: "House 3-81, Syamala Nagar",
          city: "Rajahmundry",
          state: "Andhra Pradesh",
          zipCode: "533103",
        },
        items: [
          { name: "Boat Airdopes 141 True Wireless Earbuds", quantity: 1, unitPrice: 1299, total: 1299 },
          { name: "Fast Charging 65W GaN Type-C Adapter", quantity: 1, unitPrice: 899, total: 899 },
        ],
        totalAmount: 2198,
        paymentMethod: "Direct UPI",
        utrNumber: "426189912039",
        status: "DELIVERED" as const,
        createdAt: "2026-09-23T10:00:00.000Z",
      },
    ],
  },
  {
    id: "ven_annapurna_bakery",
    name: "Annapurna Sweets, Bakery & Dry Fruits",
    ownerName: "T. Annapurna Rao",
    email: "annapurna.sweets@yahoo.com",
    phone: "+91 98485 11990",
    address: "Pushkar Ghat Road, Near Devi Chowk",
    city: "Rajahmundry",
    state: "Andhra Pradesh",
    pincode: "533101",
    businessType: "physical_shop",
    gstNumber: "37AACTA7712C1ZN",
    isActive: true,
    joinedDate: "2026-05-18",
    productsCount: 40,
    payout: {
      accountHolder: "Annapurna Sweets & Bakery",
      bankName: "Canara Bank",
      accountNumber: "1928101009281",
      ifscCode: "CNRB0001928",
      upiId: "annapurnasweets@upi",
    },
    dues: {
      status: "OVERDUE" as const,
      lastPaidDate: "2026-07-28",
      lastUtr: "422501928374",
      history: [
        { id: "due_jul_5", month: "Jul 2026", amount: 500, status: "PAID" as const, paidAt: "2026-07-28", paymentMethod: "Direct UPI", utrNumber: "422501928374", notes: "July fee" },
        { id: "due_aug_5", month: "Aug 2026", amount: 500, status: "OVERDUE" as const, notes: "August fee unpaid" },
        { id: "due_sep_5", month: "Sep 2026", amount: 500, status: "OVERDUE" as const, notes: "September fee unpaid" },
      ],
    },
    orders: [
      {
        id: "ord_cust_501",
        orderId: "ORD-986601",
        invoiceNumber: "INV-986601-ANN1",
        vendorId: "ven_annapurna_bakery",
        vendorName: "Annapurna Sweets, Bakery & Dry Fruits",
        customerName: "K. Mohan Krishna",
        customerPhone: "+91 94405 66778",
        customerEmail: "mohan.krishna@gmail.com",
        shippingAddress: {
          street: "D.No 5-1-19, Innespeta",
          city: "Rajahmundry",
          state: "Andhra Pradesh",
          zipCode: "533101",
        },
        items: [
          { name: "Special Rajahmundry Kaja (1kg Box)", quantity: 2, unitPrice: 380, total: 760 },
          { name: "Pure Ghee Dry Fruit Halwa (500g)", quantity: 1, unitPrice: 420, total: 420 },
        ],
        totalAmount: 1180,
        paymentMethod: "Direct UPI",
        utrNumber: "426401928374",
        status: "CONFIRMED" as const,
        createdAt: "2026-09-25T15:10:00.000Z",
      },
    ],
  },
];

// Read Owner Bank details configured in Admin Settings
export function getOwnerPlatformBank() {
  const defaultBank = {
    accountHolder: "V2 Business Platform Owner",
    bankName: "HDFC Bank",
    accountNumber: "50200012345678",
    ifscCode: "HDFC0000123",
    upiId: "v2business@okhdfcbank",
    adminPhone: "+91 98480 99999",
    adminEmail: "admin@v2business.com",
  };

  if (typeof window === "undefined") return defaultBank;
  try {
    const raw = localStorage.getItem("platform_owner_bank");
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultBank, ...parsed };
    }
  } catch {}
  return defaultBank;
}

// Get configured Monthly Fee
export function getConfiguredMonthlyFee(): number {
  if (typeof window === "undefined") return DEFAULT_MONTHLY_FEE;
  try {
    const rawSettings = localStorage.getItem("admin_settings");
    if (rawSettings) {
      const list = JSON.parse(rawSettings);
      const feeSetting = list.find((s: any) => s.key === "VENDOR_MONTHLY_FEE");
      if (feeSetting?.value) return Number(feeSetting.value) || DEFAULT_MONTHLY_FEE;
    }
  } catch {}
  return DEFAULT_MONTHLY_FEE;
}

/**
 * Retrieve all vendors with real metrics, dues, orders, customer contact details,
 * and automated dues notice inspections.
 */
export function getAllAdminVendors(): AdminVendorRecord[] {
  if (typeof window === "undefined") {
    return calculateVendorAggregates(SEED_VENDORS);
  }

  try {
    // 1. Check existing stored admin vendor database
    let vendors: any[] = [];
    const stored = localStorage.getItem("v2_admin_vendors_db");
    if (stored) {
      vendors = JSON.parse(stored);
    } else {
      vendors = JSON.parse(JSON.stringify(SEED_VENDORS));
    }

    // 2. Discover dynamically registered vendor stores from localStorage (e.g. vendor_store_*)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("vendor_store_")) {
        const vendorId = key.replace("vendor_store_", "");
        const rawStore = localStorage.getItem(key);
        if (rawStore) {
          const store = JSON.parse(rawStore);
          const existingIdx = vendors.findIndex((v) => v.id === vendorId || v.id === store.id);

          let payout: any = {};
          try {
            const rawPayout = localStorage.getItem(`vendor_payout_${vendorId}`);
            if (rawPayout) payout = JSON.parse(rawPayout);
          } catch {}

          const vendorRecord = {
            id: vendorId,
            name: store.name || "Seller Store",
            ownerName: store.ownerName || store.name || "Store Owner",
            email: store.email || `${store.slug || "vendor"}@v2business.com`,
            phone: store.phone || "+91 98480 00000",
            address: store.address || "Main Commercial Street",
            city: store.city || "Rajahmundry",
            state: store.state || "Andhra Pradesh",
            pincode: store.pincode || "533101",
            businessType: store.businessType || "physical_shop",
            gstNumber: store.gstNumber || (store.isGstExempt ? "GST Exempt" : "Not Provided"),
            isActive: store.isActive !== false,
            isSuspended: Boolean(store.isSuspended),
            isRemoved: Boolean(store.isRemoved),
            joinedDate: store.joinedDate || new Date().toISOString().split("T")[0],
            productsCount: store.productsCount || 10,
            payout: {
              accountHolder: payout.accountHolder || store.name || "Vendor",
              bankName: payout.bankName || "Not Provided",
              accountNumber: payout.accountNumber || "",
              ifscCode: payout.ifscCode || "",
              upiId: payout.upiId || store.upiId || "vendor@upi",
            },
            dues: existingIdx >= 0 ? vendors[existingIdx].dues : {
              status: "PENDING",
              history: [{ id: `due_${Date.now()}`, month: CURRENT_BILLING_MONTH, amount: getConfiguredMonthlyFee(), status: "PENDING" }],
            },
            orders: existingIdx >= 0 ? vendors[existingIdx].orders : [],
          };

          if (existingIdx >= 0) {
            vendors[existingIdx] = { ...vendors[existingIdx], ...vendorRecord, dues: vendors[existingIdx].dues, orders: vendors[existingIdx].orders };
          } else {
            vendors.push(vendorRecord);
          }
        }
      }
    }

    // 3. Merge real customer orders & invoices created through checkout
    const allInvoices = JSON.parse(localStorage.getItem("all_marketplace_invoices") || "[]");
    const allDirectOrders = JSON.parse(localStorage.getItem("all_direct_upi_orders") || "[]");

    vendors.forEach((v) => {
      // Find invoices for this vendor
      allInvoices.forEach((inv: any) => {
        if (inv.vendorId === v.id || inv.vendor?.id === v.id || inv.vendor?.name?.toLowerCase() === v.name.toLowerCase()) {
          const exists = v.orders.some((o: any) => o.id === inv.id || o.orderId === inv.orderId);
          if (!exists) {
            v.orders.unshift({
              id: inv.id,
              orderId: inv.orderId || `ORD-${Date.now()}`,
              invoiceNumber: inv.invoiceNumber,
              vendorId: v.id,
              vendorName: v.name,
              customerId: inv.customerId,
              customerName: inv.customer?.name || inv.shippingAddress?.name || "Customer",
              customerPhone: inv.shippingAddress?.phone || inv.customer?.phone || "+91 98480 11223",
              customerEmail: inv.customer?.email || "customer@v2business.com",
              shippingAddress: {
                street: inv.shippingAddress?.street || "Commercial Rd",
                city: inv.shippingAddress?.city || "Rajahmundry",
                state: inv.shippingAddress?.state || "Andhra Pradesh",
                zipCode: inv.shippingAddress?.zipCode || "533101",
              },
              items: inv.invoiceItems?.map((it: any) => ({
                name: it.name,
                quantity: it.quantity || 1,
                unitPrice: it.unitPrice || 0,
                total: it.total || it.unitPrice * (it.quantity || 1),
              })) || [],
              totalAmount: Number(inv.totalAmount || 0),
              paymentMethod: inv.paymentMethod || "Direct UPI",
              utrNumber: inv.utrNumber || "DIRECT_UPI_PAID",
              status: "CONFIRMED",
              createdAt: inv.createdAt || inv.issueDate || new Date().toISOString(),
            });
          }
        }
      });

      // Also merge direct UPI orders if any
      allDirectOrders.forEach((doOrder: any) => {
        const vGroup = doOrder.vendorGroups?.find((g: any) => g.vendorId === v.id || g.vendorName === v.name);
        if (vGroup) {
          const exists = v.orders.some((o: any) => o.orderId === doOrder.orderId);
          if (!exists) {
            v.orders.unshift({
              id: `direct_${doOrder.orderId}`,
              orderId: doOrder.orderId,
              vendorId: v.id,
              vendorName: v.name,
              customerName: doOrder.shippingAddress?.name || "Customer",
              customerPhone: doOrder.shippingAddress?.phone || "+91 98480 11223",
              customerEmail: "customer@v2business.com",
              shippingAddress: {
                street: doOrder.shippingAddress?.street || "Danavaipeta",
                city: doOrder.shippingAddress?.city || "Rajahmundry",
                state: "Andhra Pradesh",
                zipCode: doOrder.shippingAddress?.zipCode || "533101",
              },
              items: [{ name: "Marketplace Direct Order", quantity: 1, unitPrice: vGroup.amount, total: vGroup.amount }],
              totalAmount: vGroup.amount,
              paymentMethod: "Direct UPI",
              utrNumber: doOrder.utrNumber,
              status: "CONFIRMED",
              createdAt: doOrder.createdAt || new Date().toISOString(),
            });
          }
        }
      });
    });

    // 4. Calculate metrics, dues state, notice logs and save
    const processed = calculateVendorAggregates(vendors);
    localStorage.setItem("v2_admin_vendors_db", JSON.stringify(processed));
    return processed;
  } catch (e) {
    console.error("Error loading admin vendors:", e);
    return calculateVendorAggregates(SEED_VENDORS);
  }
}

function calculateVendorAggregates(rawVendors: any[]): AdminVendorRecord[] {
  const monthlyFee = getConfiguredMonthlyFee();

  return rawVendors.map((v) => {
    const orders: VendorCustomerOrder[] = v.orders || [];
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Load dues state
    const duesRaw = v.dues || {};
    const history: MonthlyDuesPaymentRecord[] = duesRaw.history || [];
    const noticeLogs: DuesNoticeLog[] = duesRaw.noticeLogs || [];

    const paidRecords = history.filter((h) => h.status === "PAID");
    const totalPaidDues = paidRecords.reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

    const pendingOrOverdue = history.filter((h) => h.status === "PENDING" || h.status === "OVERDUE");
    const outstandingDues = pendingOrOverdue.reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

    let status = duesRaw.status || (outstandingDues > 0 ? "OVERDUE" : "PAID");
    if (v.isRemoved) status = "OVERDUE";

    return {
      ...v,
      metrics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
      },
      dues: {
        monthlyFee,
        currentMonth: CURRENT_BILLING_MONTH,
        status,
        dueDate: "5th of every month",
        lastPaidDate: duesRaw.lastPaidDate || paidRecords[0]?.paidAt,
        lastUtr: duesRaw.lastUtr || paidRecords[0]?.utrNumber,
        totalPaidDues,
        outstandingDues: outstandingDues || (status === "PAID" ? 0 : monthlyFee),
        noticeLogs,
        history,
      },
      orders,
    };
  });
}

/**
 * Record a vendor's monthly maintenance fee payment (₹500)
 */
export function recordVendorMonthlyPayment(
  vendorId: string,
  payment: {
    month?: string;
    amount?: number;
    paidAt?: string;
    paymentMethod?: string;
    utrNumber?: string;
    notes?: string;
  }
): AdminVendorRecord[] {
  const all = getAllAdminVendors();
  const vendor = all.find((v) => v.id === vendorId);
  if (!vendor) return all;

  const month = payment.month || CURRENT_BILLING_MONTH;
  const amount = payment.amount || getConfiguredMonthlyFee();
  const paidAt = payment.paidAt || new Date().toISOString().split("T")[0];
  const utrNumber = payment.utrNumber || `UTR-${Date.now().toString().slice(-8)}`;

  // Update or insert payment in history
  const history = vendor.dues.history.map((h) => {
    if (h.month === month) {
      return {
        ...h,
        amount,
        status: "PAID" as const,
        paidAt,
        paymentMethod: payment.paymentMethod || "Direct UPI",
        utrNumber,
        notes: payment.notes || "Monthly store maintenance fee paid",
      };
    }
    return h;
  });

  if (!history.some((h) => h.month === month)) {
    history.unshift({
      id: `due_${Date.now()}`,
      month,
      amount,
      status: "PAID",
      paidAt,
      paymentMethod: payment.paymentMethod || "Direct UPI",
      utrNumber,
      notes: payment.notes || "Monthly fee",
    });
  }

  vendor.dues.status = "PAID";
  vendor.dues.lastPaidDate = paidAt;
  vendor.dues.lastUtr = utrNumber;
  vendor.dues.history = history;
  vendor.isActive = true;
  vendor.isSuspended = false;

  if (typeof window !== "undefined") {
    localStorage.setItem("v2_admin_vendors_db", JSON.stringify(all));
  }
  return all;
}

/**
 * Generate Dues Notice Email Content & WhatsApp Message
 */
export function generateDuesNoticeDetails(vendor: AdminVendorRecord) {
  const bank = getOwnerPlatformBank();
  const fee = vendor.dues.monthlyFee || getConfiguredMonthlyFee();
  const month = vendor.dues.currentMonth || CURRENT_BILLING_MONTH;

  const subject = `URGENT: Monthly Store Maintenance Fee Due (₹${fee}) - ${vendor.name} on V2 Business`;

  const emailBody = `Dear ${vendor.ownerName || vendor.name},

Greetings from V2 Business Marketplace!

This is an official notice regarding the Monthly Store Maintenance Fee for your registered store "${vendor.name}".

==================================================
BILLING DETAILS:
Store Name: ${vendor.name}
Billing Month: ${month}
Monthly Maintenance Fee Due: ₹${fee}
Due Status: ${vendor.dues.status} (Payment Required)
==================================================

As per V2 Business marketplace terms, vendors retain 100% of their customer sales (0% commission), and maintain an active storefront via the flat monthly maintenance fee of ₹${fee}/month.

PLEASE TRANSFER YOUR MONTHLY FEE TO PLATFORM OWNER ACCOUNT:
--------------------------------------------------
Beneficiary Name: ${bank.accountHolder}
UPI ID (GPay / PhonePe / Paytm / BHIM): ${bank.upiId}
Bank Name: ${bank.bankName}
Account Number: ${bank.accountNumber}
IFSC Code: ${bank.ifscCode}
--------------------------------------------------

IMPORTANT ACTION REQUIRED:
After transferring ₹${fee} via UPI or Bank, please reply with your 12-digit UPI Transaction ID (UTR) or submit it in your vendor dashboard.

NOTICE BEFORE REMOVAL / SUSPENSION:
Please clear your outstanding dues within 48 hours. Stores with unresolved dues are subject to storefront suspension and removal from the marketplace directory.

For any queries or assistance, contact Admin at ${bank.adminPhone || "+91 98480 99999"} or ${bank.adminEmail || "admin@v2business.com"}.

Thank you,
Management Team
V2 Business Marketplace
Rajahmundry, Andhra Pradesh`;

  const whatsappMessage = `*URGENT: V2 Business Monthly Fee Notice*

Dear ${vendor.ownerName || vendor.name},
Your monthly store maintenance fee of *₹${fee}* for *${month}* is currently *${vendor.dues.status}*.

To avoid storefront suspension or removal from V2 Business, please transfer *₹${fee}* to:
*UPI ID*: \`${bank.upiId}\`
*Beneficiary*: ${bank.accountHolder}
*Bank*: ${bank.bankName} (A/C: ${bank.accountNumber}, IFSC: ${bank.ifscCode})

After payment, please reply with your *12-digit UPI UTR number*.

Thank you,
V2 Business Admin`;

  const mailtoUrl = `mailto:${encodeURIComponent(vendor.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
  const cleanPhone = (vendor.phone || "").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return {
    subject,
    emailBody,
    whatsappMessage,
    mailtoUrl,
    whatsappUrl,
    bank,
    fee,
    month,
  };
}

/**
 * Record that a dues notice was sent to the vendor (email, whatsapp, or automated system)
 */
export function recordDuesNoticeSent(
  vendorId: string,
  channel: "EMAIL" | "WHATSAPP" | "AUTOMATED_SYSTEM"
): DuesNoticeLog {
  const all = getAllAdminVendors();
  const vendor = all.find((v) => v.id === vendorId);

  const log: DuesNoticeLog = {
    id: `notice_${Date.now()}`,
    vendorId,
    sentAt: new Date().toISOString(),
    channel,
    recipient: channel === "EMAIL" ? (vendor?.email || "Email") : (vendor?.phone || "WhatsApp"),
    amountDue: vendor?.dues.monthlyFee || DEFAULT_MONTHLY_FEE,
    month: vendor?.dues.currentMonth || CURRENT_BILLING_MONTH,
    status: "SENT",
  };

  if (vendor) {
    vendor.dues.noticeLogs = [log, ...(vendor.dues.noticeLogs || [])];
    if (typeof window !== "undefined") {
      localStorage.setItem("v2_admin_vendors_db", JSON.stringify(all));
    }
  }

  return log;
}

/**
 * Suspend a vendor for unpaid dues
 */
export function suspendVendor(vendorId: string, reason = "Unpaid monthly maintenance fee"): AdminVendorRecord[] {
  const all = getAllAdminVendors();
  const vendor = all.find((v) => v.id === vendorId);
  if (vendor) {
    vendor.isActive = false;
    vendor.isSuspended = true;

    if (typeof window !== "undefined") {
      localStorage.setItem("v2_admin_vendors_db", JSON.stringify(all));
      // Also update local store status if exists
      const rawStore = localStorage.getItem(`vendor_store_${vendorId}`);
      if (rawStore) {
        try {
          const store = JSON.parse(rawStore);
          store.isActive = false;
          store.isSuspended = true;
          localStorage.setItem(`vendor_store_${vendorId}`, JSON.stringify(store));
        } catch {}
      }
    }
  }
  return all;
}

/**
 * Remove a vendor completely from the marketplace
 */
export function removeVendor(vendorId: string, reason = "Removed by admin for unpaid dues"): AdminVendorRecord[] {
  const all = getAllAdminVendors();
  const vendor = all.find((v) => v.id === vendorId);
  if (vendor) {
    vendor.isActive = false;
    vendor.isSuspended = true;
    vendor.isRemoved = true;

    if (typeof window !== "undefined") {
      localStorage.setItem("v2_admin_vendors_db", JSON.stringify(all));
      // Mark store profile as removed
      const rawStore = localStorage.getItem(`vendor_store_${vendorId}`);
      if (rawStore) {
        try {
          const store = JSON.parse(rawStore);
          store.isActive = false;
          store.isRemoved = true;
          localStorage.setItem(`vendor_store_${vendorId}`, JSON.stringify(store));
        } catch {}
      }
    }
  }
  return all;
}

/**
 * Automatically inspect all vendors and generate system alerts for unpaid dues
 */
export function getAdminDuesSummary() {
  const vendors = getAllAdminVendors();
  const defaultingVendors = vendors.filter((v) => !v.isRemoved && (v.dues.status === "PENDING" || v.dues.status === "OVERDUE"));
  const paidVendors = vendors.filter((v) => !v.isRemoved && v.dues.status === "PAID");
  const suspendedVendors = vendors.filter((v) => v.isSuspended || !v.isActive);

  const totalCollectedDues = paidVendors.reduce((sum, v) => sum + (v.dues.monthlyFee || DEFAULT_MONTHLY_FEE), 0);
  const totalPendingDues = defaultingVendors.reduce((sum, v) => sum + (v.dues.monthlyFee || DEFAULT_MONTHLY_FEE), 0);

  const totalMarketplaceRevenue = vendors.reduce((sum, v) => sum + (v.metrics.totalRevenue || 0), 0);
  const totalMarketplaceOrders = vendors.reduce((sum, v) => sum + (v.metrics.totalOrders || 0), 0);

  return {
    totalVendors: vendors.length,
    activeVendorsCount: vendors.filter((v) => v.isActive && !v.isRemoved).length,
    defaultingVendors,
    paidVendorsCount: paidVendors.length,
    suspendedVendorsCount: suspendedVendors.length,
    totalCollectedDues,
    totalPendingDues,
    totalMarketplaceRevenue,
    totalMarketplaceOrders,
  };
}
