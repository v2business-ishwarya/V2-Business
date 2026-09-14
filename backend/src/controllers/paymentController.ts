import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import * as z from "zod";
import crypto from "crypto";


function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Payment initiation schema
const paymentIntentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("INR"),
  provider: z.enum(["STRIPE", "RAZORPAY", "CASHFREE"]).optional(),
});

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const parseResult = paymentIntentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  const { orderId, amount, currency, provider = "RAZORPAY" } = parseResult.data;

  // Verify order belongs to this user
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== userId) return res.status(403).json({ error: "Not authorized" });
  if (order.paymentStatus === "COMPLETED")
    return res.status(400).json({ error: "Order already paid" });

  const mockPaymentId = `pay_${Math.random().toString(36).substr(2, 9)}`;
  const mockClientSecret = `${mockPaymentId}_secret_${Math.random().toString(36).substr(2, 9)}`;

  // Create a pending payment transaction record
  await prisma.paymentTransaction.create({
    data: {
      userId,
      orderId,
      amount,
      currency,
      provider:
        provider === "STRIPE" ? "STRIPE" : provider === "CASHFREE" ? "CASHFREE" : "RAZORPAY" as any,
      providerPaymentId: mockPaymentId,
      netAmount: amount,
      metadata: { clientSecret: mockClientSecret },
      status: "PENDING",
    },
  });

  res.json({
    paymentId: mockPaymentId,
    clientSecret: mockClientSecret,
    amount,
    currency,
    provider,
  });
});

export const confirmPayment = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const { paymentId, orderId, providerPaymentId } = req.body;

  if (!paymentId || !orderId) {
    return res.status(400).json({ error: "paymentId and orderId required" });
  }

  // Verify user ownership of this order before confirming
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  if (order.userId !== userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized to confirm this order" });
    }
  }

  try {
    const { CheckoutService } = await import("../services/checkoutService.js");
    const checkoutService = new CheckoutService("mock");
    const result = await checkoutService.confirmPayment(paymentId, orderId, providerPaymentId);
    res.json({ message: "Payment confirmed", orderId: result.orderId });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Webhook endpoint for payment providers with HMAC signature validation
export const paymentWebhook = asyncHandler(async (req, res) => {
  const razoridSig = req.headers["x-razorpay-signature"] as string;
  const razorpaySecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // If Razorpay webhook secret is configured, enforce HMAC SHA256 signature validation
  if (razorpaySecret && razoridSig) {
    const expectedSig = crypto
      .createHmac("sha256", razorpaySecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSig !== razoridSig) {
      console.warn("[PAYMENT WEBHOOK] Invalid Razorpay signature rejected");
      return res.status(400).json({ error: "Invalid webhook signature" });
    }
  }

  const { event, data } = req.body;

  if (event === "payment.succeeded" && data?.object) {
    const { payment_id, order_id } = data.object;
    try {
      const { CheckoutService } = await import("../services/checkoutService.js");
      const checkoutService = new CheckoutService("mock");
      if (order_id) {
        await checkoutService.confirmPayment(payment_id, order_id, payment_id);
      }
    } catch (e) {
      console.error("webhook processing error:", e);
    }
  }

  res.status(200).json({ received: true });
});

export default {
  createPaymentIntent,
  confirmPayment,
  paymentWebhook,
};
