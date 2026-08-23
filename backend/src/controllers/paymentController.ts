import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import * as z from "zod";
import { authenticate } from "../middleware/authMiddleware";

// Helper
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Payment initiation schema
const paymentIntentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  provider: z.enum(["STRIPE", "RAZORPAY"]).optional(),
});

type TPaymentIntent = z.infer<typeof paymentIntentSchema>;

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const parseResult = paymentIntentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  const { orderId, amount, currency, provider = "STRIPE" } = parseResult.data;

  // Verify order belongs to user
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== userId) return res.status(403).json({ error: "Not authorized" });
  if (order.paymentStatus === "COMPLETED")
    return res.status(400).json({ error: "Order already paid" });

  // In a real implementation, we would call Razorpay/Stripe SDK to create a payment intent
  // For now, we mock a response
  const mockPaymentId = `pay_${Math.random().toString(36).substr(2, 9)}`;
  const mockClientSecret = `${mockPaymentId}_secret_${Math.random().toString(36).substr(2, 9)}`;

  // Create a pending payment transaction record
  const paymentTx = await prisma.paymentTransaction.create({
    data: {
      userId,
      orderId,
      amount,
      currency,
      provider,
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

  // The client side usually calls order confirmation after the payment gateway completes.
  try {
    const { CheckoutService } = await import('../services/checkoutService.js');
    // For mock, provider is mock. In real it's from db or req
    const checkoutService = new CheckoutService('mock');
    const result = await checkoutService.confirmPayment(paymentId, orderId, providerPaymentId);
    
    res.json({ message: "Payment confirmed", orderId: result.orderId });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Webhook endpoint for payment provider (no auth)
export const paymentWebhook = asyncHandler(async (req, res) => {
  // In production, verify signature using provider secret
  const { event, data } = req.body;

  if (event === "payment.succeeded" && data?.object) {
    const { payment_id, order_id, amount } = data.object;
    try {
      const { CheckoutService } = await import('../services/checkoutService.js');
      const checkoutService = new CheckoutService('mock');
      // In webhook, we process confirmation if order_id is present
      if (order_id) {
        await checkoutService.confirmPayment(payment_id, order_id, payment_id);
      }
    } catch (e) {
      console.error("Webhook processing error:", e);
    }
  }

  res.status(200).json({ received: true });
});

export default {
  createPaymentIntent,
  confirmPayment,
  paymentWebhook,
};
