import { Router } from "express";
import authController from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimit";

const router = Router();

// Public authentication routes with brute-force protection
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

router.post("/request-password-reset", passwordResetLimiter, authController.requestPasswordReset);
router.post("/reset-password", passwordResetLimiter, authController.resetPassword);

// Google OAuth routes
router.get("/google", authController.googleRedirect);
router.get("/google/callback", authController.googleCallback);

// Get current user (protected)
router.get("/me", authenticate, authController.getMe);

export default router;