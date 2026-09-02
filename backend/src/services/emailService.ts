import { Resend } from "resend";

type EmailUser = {
  email: string;
  name?: string | null;
};

type EmailOrder = {
  id: string;
  createdAt: Date | string;
  total: number;
  status: string;
};

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

// Initialize Resend with API key from environment if available
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// Email templates
const emailTemplates = {
  orderConfirmation: (order: EmailOrder, user: EmailUser) => ({
    subject: `Order Confirmation #${order.id}`,
    html: `
      <h1>Order Confirmation</h1>
      <p>Hello ${user.name || user.email},</p>
      <p>Thank you for your order! Here are your order details:</p>
      <ul>
        <li><strong>Order ID:</strong> #${order.id}</li>
        <li><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</li>
        <li><strong>Total:</strong> $${order.total.toFixed(2)}</li>
        <li><strong>Status:</strong> ${order.status}</li>
      </ul>
      <p>We'll notify you when your order ships.</p>
      <p>Thanks for shopping with us!</p>
    `,
  }),
  passwordReset: (user: EmailUser, resetToken: string) => {
    const baseUrl = process.env.FRONTEND_URL || "https://v2business.in";
    const resetUrl = `${baseUrl.replace(/\/+$/, "")}/reset-password?token=${resetToken}`;
    console.log(`[PASSWORD RESET] Generated reset link for ${user.email}: ${resetUrl}`);
    return {
      subject: "Password Reset Request — V2 Business",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #111;">Password Reset Request</h2>
          <p>Hello ${user.name || user.email},</p>
          <p>We received a request to reset your password for your V2 Business account. Click the button below to set a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 13px; color: #64748b;">Or copy and paste this link into your browser:<br/><a href="${resetUrl}">${resetUrl}</a></p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    };
  },
  welcome: (user: EmailUser) => ({
    subject: "Welcome to Our Store!",
    html: `
      <h1>Welcome, ${user.name || user.email}!</h1>
      <p>Thank you for creating an account. We're excited to have you shop with us!</p>
      <p>Get started by browsing our products or updating your profile.</p>
    `,
  }),
};

/**
 * Send email using Resend
 * @param {Object} options - Email options
 * @param {string* @param {string} options.to - Recipient email } options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} Resend response or null if not configured
 */
export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  if (!resend) {
    console.warn("Resend not configured; skipping email send");
    return null;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};

/**
 * Send order confirmation email
 * @param {Object} order - Order object
 * @param {Object} user - User object
 */
export const sendOrderConfirmationEmail = async (order: EmailOrder, user: EmailUser) => {
  if (!resend) {
    console.warn("Resend not configured; skipping order confirmation email");
    return;
  }
  const { subject, html } = emailTemplates.orderConfirmation(order, user);
  await sendEmail({ to: user.email, subject, html });
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {string} resetToken - Reset token
 */
export const sendPasswordResetEmail = async (user: EmailUser, resetToken: string) => {
  if (!resend) {
    console.warn("Resend not configured; skipping password reset email");
    return;
  }
  const { subject, html } = emailTemplates.passwordReset(user, resetToken);
  await sendEmail({ to: user.email, subject, html });
};

/**
 * Send welcome email
 * @param {Object} user - User object
 */
export const sendWelcomeEmail = async (user: EmailUser) => {
  if (!resend) {
    console.warn("Resend not configured; skipping welcome email");
    return;
  }
  const { subject, html } = emailTemplates.welcome(user);
  await sendEmail({ to: user.email, subject, html });
};

export default {
  sendEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
