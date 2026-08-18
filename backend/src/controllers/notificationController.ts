import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import * as z from "zod";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";

// Helper
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Notification schema for creating (admin)
const notificationSchema = z.object({
  userId: z.string().optional(), // if null, send to all users
  title: z.string(),
  message: z.string(),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "ERROR"]).default("INFO"),
  isRead: z.boolean().default(false),
  // optional link (e.g., orderId, productId)
  link: z.string().optional(),
});

type TNotificationCreate = z.infer<typeof notificationSchema>;

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  res.json({ items: notifications, unreadCount });
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;

  const notification = await prisma.notification.update({
    where: { id, userId },
    data: { isRead: true },
  });
  res.json(notification);
});

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  res.json({ message: "All notifications marked as read" });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;

  await prisma.notification.delete({ where: { id, userId } });
  res.status(204).send();
});

// Admin: send notification to specific user or all users
export const sendNotification = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const parseResult = notificationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  const { userId: targetUserId, title, message, type, isRead, link } = parseResult.data;

  if (targetUserId) {
    // Send to specific user
    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        title,
        message,
        type,
        isRead: !!isRead,
        data: link ? { link } : undefined,
      },
    });
    res.status(201).json(notification);
  } else {
    // Send to all users (broadcast)
    // Get all user IDs
    const users = await prisma.user.findMany({ select: { id: true } });
    const notifications = users.map((u) => ({
      userId: u.id,
      title,
      message,
      type,
      isRead: !!isRead,
      data: link ? { link } : undefined,
    }));
    await prisma.notification.createMany({ data: notifications });
    res.status(201).json({ message: `Notification sent to ${users.length} users` });
  }
});

export default {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  sendNotification,
};
