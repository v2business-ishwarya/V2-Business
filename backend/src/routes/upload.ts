import { Router } from "express";
import uploadController from "../controllers/uploadController";
import { authenticate } from "../middleware/authMiddleware";
import multer from "multer";

// Configure multer for memory storage (to stream to Cloudinary)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB limit

const router = Router();

// All routes require authentication
router.use(authenticate);

// Single file upload endpoint
router.post("/", upload.single("file"), uploadController.uploadFile);

export default router;
