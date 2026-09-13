import { Router } from "express";
import {
  getTodaySpotlight,
  getVendorSpotlightAds,
  createVendorSpotlightAd,
  getAdminSpotlightAds,
  updateSpotlightAdStatus,
} from "../controllers/spotlightController";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

// Public route: landing page popup
router.get("/today", getTodaySpotlight);

// Vendor routes
router.get("/vendor", authenticate, getVendorSpotlightAds);
router.post("/vendor", authenticate, createVendorSpotlightAd);

// Admin routes
router.get("/admin", authenticate, authorizeRole(["ADMIN"]), getAdminSpotlightAds);
router.patch("/admin/:id/status", authenticate, authorizeRole(["ADMIN"]), updateSpotlightAdStatus);

export default router;