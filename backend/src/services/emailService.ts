import nodemailer from "nodemailer";
import { Resend } from "resend";

export type EmailUser = {
  id?: string;
  email: string;
  name?: string | null;
  storeName?: string | null;
};

export type EmailOrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image?: string;
};

export type EmailOrder = {
  id: string;
  createdAt: Date | string;
  total: number;
  status: string;
  shippingAddress?: any;
  items?: EmailOrderItem[];
};

export type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

let resendClient: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

function getSmtpTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.EMAIL_HOST || (user && user.includes("@gmail.com") ? "smtp.gmail.com" : "");
  const port = Number(process.env.EMAIL_PORT || 587);
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: host || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const getSenderEmail = (): string =>
  process.env.EMAIL_FROM || process.env.EMAIL_USER || "orders@v2business.in";

const getFrontendUrl = (): string =>
  (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",")[0] : "https://v2business.in").replace(/\/+$/, "");

function emailLayout(title: string, body: string): string {
  const url = getFrontendUrl();
  const yr = new Date().getFullYear();
  return [
    "<!DOCTYPE html><html><head><meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1.0'>",
    "<title>" + title + "</title></head>",
    "<body style='margin:0;padding:0;background:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#e2e8f0;'>",
    "<div style='padding:32px 12px;background:#0b0f19;'>",
    "<div style='max-width:600px;margin:0 auto;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1f2937;'>",
    "<div style='background:#090d16;padding:28px 24px;text-align:center;border-bottom:2px solid #f59e0b;'>",
    "<h1 style='font-size:24px;font-weight:900;color:#fff;margin:0;'>V2 <span style='color:#f59e0b;'>BUSINESS</span></h1>",
    "<div style='color:#94a3b8;font-size:12px;margin-top:6px;text-transform:uppercase;letter-spacing:1px;'>Multi-Vendor Marketplace</div>",
    "</div>",
    "<div style='padding:32px 24px;background:#111827;'>" + body + "</div>",
    "<div style='background:#090d16;padding:20px;text-align:center;border-top:1px solid #1f2937;color:#64748b;font-size:12px;'>",
    "<p style='margin:0 0 8px 0;'>&copy; " + yr + " V2 Business. All rights reserved.</p>",
    "<p style='margin:0;'><a href='mailto:support@v2business.in' style='color:#f59e0b;text-decoration:none;'>support@v2business.in</a>",
    " &bull; <a href='" + url + "' style='color:#f59e0b;text-decoration:none;'>Home</a></p>",
    "</div></div></div></body></html>",
  ].join("");
}

export const emailTemplates = {
  customerWelcome: (user: EmailUser) => {
    const url = getFrontendUrl();
    const name = user.name || "Shopper";
    return {
      subject: "Welcome to V2 Business — Your Account is Ready",
      html: emailLayout("Welcome", [
        "<h2 style='font-size:20px;font-weight:800;color:#fff;margin:0 0 14px 0;'>Welcome, " + name + "! 👋</h2>",
        "<p style='font-size:14px;line-height:1.6;color:#cbd5e1;margin:0 0 20px 0;'>Your V2 Business account is verified and ready. Shop from thousands of verified vendors across India.</p>",
        "<div style='text-align:center;margin:28px 0;'>",
        "<a href='" + url + "/search' style='background:#f59e0b;color:#000;font-weight:800;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;'>Start Shopping</a>",
        "</div>",
      ].join("")),
    };
  },

  vendorWelcome: (user: EmailUser) => {
    const url = getFrontendUrl();
    const vendorName = user.storeName || user.name || "Partner Merchant";
    return {
      subject: "Welcome to V2 Business Merchant Network",
      html: emailLayout("Merchant Onboarding", [
        "<h2 style='font-size:20px;font-weight:800;color:#fff;margin:0 0 14px 0;'>Welcome Aboard, " + vendorName + "! 🚀</h2>",
        "<p style='font-size:14px;line-height:1.6;color:#cbd5e1;margin:0 0 20px 0;'>Your merchant store is active. List products, manage orders, and grow your business on V2 Business.</p>",
        "<div style='text-align:center;margin:28px 0;'>",
        "<a href='" + url + "/vendor' style='background:#f59e0b;color:#000;font-weight:800;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;'>Open Vendor Dashboard</a>",
        "</div>",
      ].join("")),
    };
  },

  orderConfirmation: (order: EmailOrder, user: EmailUser) => {
    const url = getFrontendUrl();
    const shortId = order.id.slice(0, 8).toUpperCase();
    const itemRows = (order.items || []).map((i) =>
      "<tr><td style='padding:8px;border-bottom:1px solid #374151;color:#e2e8f0;'>" + i.name + " x" + i.quantity + "</td>" +
      "<td style='padding:8px;border-bottom:1px solid #374151;color:#f59e0b;text-align:right;'>Rs." + Number(i.total).toFixed(2) + "</td></tr>"
    ).join("");
    return {
      subject: "Order Confirmed #" + shortId + " — V2 Business",
      html: emailLayout("Order Confirmed", [
        "<h2 style='font-size:20px;font-weight:800;color:#fff;margin:0 0 14px 0;'>Order Confirmed! 🎉</h2>",
        "<p style='font-size:14px;color:#cbd5e1;margin:0 0 18px 0;'>Hi " + (user.name || user.email) + ", your payment is received for order <strong>#" + shortId + "</strong>.</p>",
        "<table style='width:100%;border-collapse:collapse;background:#1f2937;border-radius:8px;overflow:hidden;margin-bottom:20px;'>",
        itemRows,
        "<tr><td style='padding:12px;font-weight:800;color:#fff;'>Total Paid</td>",
        "<td style='padding:12px;font-weight:800;color:#10b981;text-align:right;'>Rs." + Number(order.total).toFixed(2) + "</td></tr>",
        "</table>",
        "<div style='text-align:center;margin:28px 0;'>",
        "<a href='" + url + "/account/orders' style='background:#f59e0b;color:#000;font-weight:800;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;'>View Order &amp; Invoice</a>",
        "</div>",
      ].join("")),
    };
  },

  vendorNewOrder: (vendor: EmailUser, order: EmailOrder, items: EmailOrderItem[]) => {
    const url = getFrontendUrl();
    const shortId = order.id.slice(0, 8).toUpperCase();
    const itemRows = items.map((i) =>
      "<tr><td style='padding:8px;border-bottom:1px solid #374151;color:#e2e8f0;'>" + i.name + " (Qty: " + i.quantity + ")</td>" +
      "<td style='padding:8px;border-bottom:1px solid #374151;color:#10b981;text-align:right;'>Rs." + Number(i.total).toFixed(2) + "</td></tr>"
    ).join("");
    return {
      subject: "New Order Alert #" + shortId + " — Action Required",
      html: emailLayout("New Order", [
        "<h2 style='font-size:20px;font-weight:800;color:#fff;margin:0 0 14px 0;'>New Order Received! 📦</h2>",
        "<p style='font-size:14px;color:#cbd5e1;margin:0 0 18px 0;'>Order <strong>#" + shortId + "</strong> — please pack and dispatch promptly.</p>",
        "<table style='width:100%;border-collapse:collapse;background:#1f2937;border-radius:8px;overflow:hidden;margin-bottom:20px;'>",
        itemRows,
        "</table>",
        "<div style='text-align:center;margin:28px 0;'>",
        "<a href='" + url + "/vendor/orders' style='background:#f59e0b;color:#000;font-weight:800;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;'>Manage Orders</a>",
        "</div>",
      ].join("")),
    };
  },

  shipmentTracking: (order: EmailOrder, user: EmailUser, trackingNumber: string, courierName?: string) => {
    const url = getFrontendUrl();
    const shortId = order.id.slice(0, 8).toUpperCase();
    return {
      subject: "Order #" + shortId + " Shipped — Track Your Package",
      html: emailLayout("Order Shipped", [
        "<h2 style='font-size:20px;font-weight:800;color:#fff;margin:0 0 14px 0;'>Your Order Has Shipped! 🚚</h2>",
        "<p style='font-size:14px;color:#cbd5e1;margin:0 0 18px 0;'>Hi " + (user.name || user.email) + ", order <strong>#" + shortId + "</strong> is on its way.</p>",
        "<div style='background:#1f2937;padding:16px;border-radius:8px;margin-bottom:20px;'>",
        "<p style='margin:0 0 6px 0;color:#94a3b8;font-size:13px;'>Courier: <strong style='color:#fff;'>" + (courierName || "Express Courier") + "</strong></p>",
        "<p style='margin:0;color:#94a3b8;font-size:13px;'>AWB / Tracking: <strong style='color:#f59e0b;font-family:monospace;'>" + trackingNumber + "</strong></p>",
        "</div>",
        "<div style='text-align:center;margin:28px 0;'>",
        "<a href='" + url + "/track/" + order.id + "' style='background:#f59e0b;color:#000;font-weight:800;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;'>Track Live</a>",
        "</div>",
      ].join("")),
    };
  },

  abandonedCart: (user: EmailUser, cartItems: any[]) => {
    const url = getFrontendUrl();
    const name = user.name || "there";
    return {
      subject: "You left items in your V2 Business cart",
      html: emailLayout("Cart Reminder", [
        "<h2 style='font-size:20px;font-weight:800;color:#fff;margin:0 0 14px 0;'>Hey " + name + ", your cart misses you! 🛒</h2>",
        "<p style='font-size:14px;color:#cbd5e1;margin:0 0 20px 0;'>You have " + cartItems.length + " item(s) waiting. Stock is limited — complete your order before they sell out.</p>",
        "<div style='text-align:center;margin:28px 0;'>",
        "<a href='" + url + "/cart' style='background:#f59e0b;color:#000;font-weight:800;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;'>Complete My Order</a>",
        "</div>",
      ].join("")),
    };
  },

  passwordReset: (user: EmailUser, resetToken: string) => {
    const url = getFrontendUrl();
    const resetUrl = url + "/reset-password?token=" + encodeURIComponent(resetToken) + "&email=" + encodeURIComponent(user.email);
    return {
      subject: "V2 Business — Password Reset Request",
      html: emailLayout("Password Reset", [
        "<h2 style='font-size:20px;font-weight:800;color:#fff;margin:0 0 14px 0;'>Reset Your Password 🔒</h2>",
        "<p style='font-size:14px;color:#cbd5e1;margin:0 0 20px 0;'>Click below to reset your password. This link expires in <strong>1 hour</strong>.</p>",
        "<div style='text-align:center;margin:28px 0;'>",
        "<a href='" + resetUrl + "' style='background:#f59e0b;color:#000;font-weight:800;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;'>Reset Password</a>",
        "</div>",
        "<p style='font-size:12px;color:#64748b;text-align:center;'>If you did not request this, please ignore this email.</p>",
      ].join("")),
    };
  },

  passwordChanged: (user: EmailUser) => {
    const url = getFrontendUrl();
    return {
      subject: "Security Alert — Your V2 Business Password Was Changed",
      html: emailLayout("Security Alert", [
        "<h2 style='font-size:20px;font-weight:800;color:#fff;margin:0 0 14px 0;'>Password Changed 🔒</h2>",
        "<p style='font-size:14px;color:#cbd5e1;margin:0 0 20px 0;'>The password for <strong>" + user.email + "</strong> was recently updated.</p>",
        "<div style='background:#1f2937;border-left:4px solid #ef4444;padding:14px 18px;border-radius:8px;margin-bottom:20px;'>",
        "<p style='margin:0;color:#e2e8f0;font-size:13px;'>If you did not make this change, contact <a href='mailto:support@v2business.in' style='color:#f59e0b;'>support@v2business.in</a> immediately.</p>",
        "</div>",
        "<div style='text-align:center;margin:24px 0;'>",
        "<a href='" + url + "/login' style='background:#f59e0b;color:#000;font-weight:800;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;'>Sign In</a>",
        "</div>",
      ].join("")),
    };
  },
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const { to, subject, html } = options;
  const from = getSenderEmail();

  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({ from, to, subject, html });
      console.log("[EMAIL SENT SMTP] To:", to, "ID:", info.messageId);
      return true;
    } catch (err) {
      console.error("[SMTP ERROR, trying Resend]", err);
    }
  }

  if (resendClient) {
    try {
      const res = await resendClient.emails.send({ from, to, subject, html });
      if (!res.error) {
        console.log("[EMAIL SENT RESEND] To:", to, "ID:", res.data?.id);
        return true;
      }
      console.error("[RESEND ERROR]", res.error);
    } catch (err) {
      console.error("[RESEND API ERROR]", err);
    }
  }

  console.log("[EMAIL NOT CONFIGURED] To:", to, "Subject:", subject);
  return false;
};

export const sendCustomerWelcomeEmail = async (user: EmailUser) => {
  try { const t = emailTemplates.customerWelcome(user); await sendEmail({ to: user.email, ...t }); }
  catch (e) { console.warn("[CUSTOMER WELCOME ERROR]", e); }
};

export const sendVendorWelcomeEmail = async (user: EmailUser) => {
  try { const t = emailTemplates.vendorWelcome(user); await sendEmail({ to: user.email, ...t }); }
  catch (e) { console.warn("[VENDOR WELCOME ERROR]", e); }
};

export const sendOrderConfirmationEmail = async (order: EmailOrder, user: EmailUser) => {
  try { const t = emailTemplates.orderConfirmation(order, user); await sendEmail({ to: user.email, ...t }); }
  catch (e) { console.warn("[ORDER CONFIRMATION ERROR]", e); }
};

export const sendVendorNewOrderEmail = async (vendor: EmailUser, order: EmailOrder, items: EmailOrderItem[]) => {
  try { const t = emailTemplates.vendorNewOrder(vendor, order, items); await sendEmail({ to: vendor.email, ...t }); }
  catch (e) { console.warn("[VENDOR NEW ORDER ERROR]", e); }
};

export const sendShipmentTrackingEmail = async (order: EmailOrder, user: EmailUser, trackingNumber: string, courierName?: string) => {
  try { const t = emailTemplates.shipmentTracking(order, user, trackingNumber, courierName); await sendEmail({ to: user.email, ...t }); }
  catch (e) { console.warn("[SHIPMENT TRACKING ERROR]", e); }
};

export const sendAbandonedCartEmail = async (user: EmailUser, cartItems: any[]) => {
  try { const t = emailTemplates.abandonedCart(user, cartItems); await sendEmail({ to: user.email, ...t }); }
  catch (e) { console.warn("[ABANDONED CART ERROR]", e); }
};

export const sendPasswordResetEmail = async (user: EmailUser, resetToken: string) => {
  try { const t = emailTemplates.passwordReset(user, resetToken); await sendEmail({ to: user.email, ...t }); }
  catch (e) { console.warn("[PASSWORD RESET ERROR]", e); }
};

export const sendPasswordChangedEmail = async (user: EmailUser) => {
  try { const t = emailTemplates.passwordChanged(user); await sendEmail({ to: user.email, ...t }); }
  catch (e) { console.warn("[PASSWORD CHANGED ERROR]", e); }
};

export default {
  sendEmail,
  sendCustomerWelcomeEmail,
  sendVendorWelcomeEmail,
  sendOrderConfirmationEmail,
  sendVendorNewOrderEmail,
  sendShipmentTrackingEmail,
  sendAbandonedCartEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
};
