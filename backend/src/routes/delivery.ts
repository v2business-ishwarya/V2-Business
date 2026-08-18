import { Router } from "express";
import deliveryController from "../controllers/deliveryController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/shipments", deliveryController.getShipments);
router.patch("/shipments/:id/status", deliveryController.updateShipmentStatus);

router.get("/config", deliveryController.getVendorDeliveryConfig);
router.put("/config", deliveryController.updateVendorDeliveryConfig);

export default router;
