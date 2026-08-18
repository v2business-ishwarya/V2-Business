import { Router } from "express";
import productController from "../controllers/productController";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";
import multer from "multer";

// Configure multer for memory storage (to stream to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

const router = Router();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getOneProduct);

// Protected routes (require authentication)
router.use(authenticate);

// Admin or vendor can create
router.post(
  "/",
  authorizeRole(["ADMIN", "VENDOR"]),
  upload.array("images", 5), // field name 'images', max 5 images
  productController.createProduct,
);

// Admin or owner can update/delete
router.put(
  "/:id",
  authorizeRole(["ADMIN", "VENDOR"]),
  upload.array("images", 5),
  productController.updateProduct,
);
router.delete("/:id", authorizeRole(["ADMIN", "VENDOR"]), productController.deleteProduct);

export default router;
