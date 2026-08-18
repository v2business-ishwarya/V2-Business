import { Router } from "express";
import couponController from "../controllers/couponController";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

// Admin routes (require ADMIN role)
router.use(authenticate, authorizeRole(["ADMIN"]));

router.post("/", couponController.createCoupon);
router.get("/", couponController.getCoupons);
router.get("/:id", couponController.getCouponById);
router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);

// Public route to validate a coupon code (no auth required)
router.post("/validate", couponController.validateCoupon);

export default router;
