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

// Admin or vendor can create — accepts JSON body with pre-uploaded image URLs
router.post(
  "/",
  authorizeRole(["ADMIN", "VENDOR"]),
  (req, res, next) => {
    const ct = req.headers["content-type"] || "";
    if (ct.includes("multipart/form-data")) {
      upload.array("images", 5)(req, res, next);
    } else {
      next();
    }
  },
  productController.createProduct,
);

// Admin or owner can update/delete
router.put(
  "/:id",
  authorizeRole(["ADMIN", "VENDOR"]),
  (req, res, next) => {
    const ct = req.headers["content-type"] || "";
    if (ct.includes("multipart/form-data")) {
      upload.array("images", 5)(req, res, next);
    } else {
      next();
    }
  },
  productController.updateProduct,
);
router.delete("/:id", authorizeRole(["ADMIN", "VENDOR"]), productController.deleteProduct);

export default router;
