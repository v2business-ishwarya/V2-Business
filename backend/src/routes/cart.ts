import { Router } from "express";
import cartController from "../controllers/cartController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/items", cartController.addToCart);
router.put("/items/:id", cartController.updateCartItem);
router.delete("/items/:id", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);
router.get("/count", cartController.getCartCount);

export default router;
