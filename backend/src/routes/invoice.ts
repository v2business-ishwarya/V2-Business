import { Router } from "express";
import invoiceController from "../controllers/invoiceController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/", invoiceController.getInvoices);
router.get("/:id", invoiceController.getInvoiceById);

export default router;
