import { Router } from "express";
import orderController from "../controllers/orderController";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my orders (with pagination/filtering)
router.get("/", orderController.getMyOrders);
// Optional alias
router.get("/my", orderController.getMyOrders);
router.get("/vendor", authorizeRole(["ADMIN", "VENDOR"]), orderController.getVendorOrders);
router.patch("/vendor/:id/status", authorizeRole(["ADMIN", "VENDOR"]), orderController.updateVendorOrderStatus);

// Admin: all orders (must be before /:id)
router.get("/all", authorizeRole(["ADMIN"]), orderController.getAllOrders);
router.get("/admin", authorizeRole(["ADMIN"]), orderController.getAllOrders);

// Get order by ID
router.get("/:id", orderController.getOrderById);

// Update order status (PATCH as per frontend) - admin only
router.patch("/:id/status", authorizeRole(["ADMIN"]), orderController.updateOrderStatus);

export default router;
