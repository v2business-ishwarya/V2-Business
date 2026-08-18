import { Router } from "express";
import { getMe, updateUser, becomeVendor } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/me", authenticate, getMe);
router.post("/become-vendor", authenticate, becomeVendor);
router.put("/:id", authenticate, updateUser);

export default router;
