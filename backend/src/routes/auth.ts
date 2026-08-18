import { Router } from "express";
import authController from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/request-password-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);
// Google OAuth callback
router.get("/google/callback", authController.googleCallback);
// Get current user (protected)
router.get("/me", authenticate, authController.getMe);

export default router;
