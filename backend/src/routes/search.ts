import { Router } from "express";
import searchController from "../controllers/searchController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Public search routes (no auth required)
router.get("/", searchController.searchProducts);
router.get("/suggest", searchController.searchSuggestions);

export default router;
