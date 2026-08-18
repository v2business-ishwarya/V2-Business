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
  passwordReset: (user: EmailUser, resetToken: string) => ({
    subject: "Password Reset Request",
    html: `
      <h1>Password Reset</h1>
      <p>Hello ${user.name || user.email},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  }),
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
