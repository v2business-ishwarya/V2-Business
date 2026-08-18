import { Router } from "express";
import paymentController from "../controllers/paymentController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Payment routes (require authentication, except webhook)
router.post("/create-intent", authenticate, paymentController.createPaymentIntent);
router.post("/confirm", authenticate, paymentController.confirmPayment);

// Webhook endpoint (no authentication – provider will call this)
router.post("/webhook", paymentController.paymentWebhook);

export default router;
