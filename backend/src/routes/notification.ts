import { Router } from "express";
import notificationController from "../controllers/notificationController";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.put("/:id/read", notificationController.markNotificationAsRead);
router.put("/read-all", notificationController.markAllNotificationsAsRead);
router.delete("/:id", notificationController.deleteNotification);

// Admin routes
router.post("/send", authorizeRole(["ADMIN"]), notificationController.sendNotification);

export default router;
