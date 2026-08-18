import { Router } from "express";
import reviewController from "../controllers/reviewController";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.get("/product/:productId", reviewController.getProductReviews);

// Protected routes (require authentication)
router.use(authenticate);

router.post("/", reviewController.createReview);
router.put("/:reviewId/helpful", reviewController.toggleHelpfulVote);

// Admin routes
router.use(authorizeRole(["ADMIN"]));
router.get("/", reviewController.getAllReviews);
router.delete("/:id", reviewController.deleteReview);

export default router;
