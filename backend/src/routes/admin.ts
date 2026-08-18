import { Router } from "express";
import adminController from "../controllers/adminController";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, authorizeRole(["ADMIN"]));

router.get("/stats", adminController.getAdminStats);
router.get("/users", adminController.getUsers);
router.put("/users/:id", adminController.updateUser);
router.get("/audit-logs", adminController.getAuditLogs);

router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

router.get("/payment-providers", adminController.getPaymentProviders);
router.put("/payment-providers/:id", adminController.updatePaymentProvider);

router.get("/delivery-providers", adminController.getDeliveryProviders);
router.put("/delivery-providers/:id", adminController.updateDeliveryProvider);

router.get("/invoices", adminController.getInvoices);
router.get("/commissions", adminController.getCommissions);

export default router;
