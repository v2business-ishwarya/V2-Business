import { Router } from "express";
import adminController from "../controllers/adminController";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

// Read-only configurations accessible to authenticated users (vendors, customers, admin)
router.get("/settings", authenticate, adminController.getSettings);
router.get("/payment-providers", authenticate, adminController.getPaymentProviders);
router.get("/delivery-providers", authenticate, adminController.getDeliveryProviders);

// All management and sensitive routes strictly require ADMIN role
router.use(authenticate, authorizeRole(["ADMIN"]));

router.get("/stats", adminController.getAdminStats);
router.get("/users", adminController.getUsers);
router.put("/users/:id", adminController.updateUser);
router.get("/audit-logs", adminController.getAuditLogs);

router.put("/settings", adminController.updateSettings);
router.put("/payment-providers/:id", adminController.updatePaymentProvider);
router.put("/delivery-providers/:id", adminController.updateDeliveryProvider);

router.get("/invoices", adminController.getInvoices);
router.get("/commissions", adminController.getCommissions);

export default router;
