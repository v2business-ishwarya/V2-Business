import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import * as z from "zod";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";
import auditService from "../services/auditService";

// Helper
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// User update schema (for admin to toggle active/role)
const userUpdateSchema = z.object({
  role: z.enum(["ADMIN", "VENDOR", "CUSTOMER"]).optional(),
  isActive: z.boolean().optional(),
});

type TUserUpdate = z.infer<typeof userUpdateSchema>;

export const getAdminStats = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  // Gather stats
  const [totalUsers, totalOrders, totalRevenue, totalProducts, lowStockProducts] =
    await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lt: 10 } } }), // low stock threshold 10
    ]);

  const revenue = totalRevenue._sum.total ?? 0;

  res.json({
    users: totalUsers,
    orders: totalOrders,
    revenue,
    products: totalProducts,
    lowStockProducts,
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const skip = (page - 1) * limit;
  const search = (req.query.search as string) ?? "";

  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }
  if (req.query.role) {
    where.role = req.query.role as string;
  }
  if (req.query.isActive !== undefined) {
    where.isActive = req.query.isActive === "true";
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      where,
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const { id } = req.params;
  const parseResult = userUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  const data = parseResult.data;

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
  });
  // Remove password hash from response
  const { passwordHash, ...safeUser } = updatedUser;
  res.json(safeUser);
});

// Audit logs
export const getAuditLogs = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const action = (req.query.action as string) ?? undefined;
  const userIdFilter = (req.query.userId as string) ?? undefined;
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

  const [auditLogs, total] = await Promise.all([
    auditService.getAuditLogs({
      page,
      limit,
      action,
      userId: userIdFilter,
      startDate,
      endDate,
    }),
    prisma.auditLog.count({
      where: {
        ...(action && { action }),
        ...(userIdFilter && { userId: userIdFilter }),
        ...(startDate &&
          endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        ...(startDate && !endDate && { createdAt: { gte: startDate } }),
        ...(!startDate && endDate && { createdAt: { lte: endDate } }),
      },
    }),
  ]);

  res.json(auditLogs);
});

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.marketplaceSettings.findMany();
  res.json(settings);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { key, value, description } = req.body;
  const setting = await prisma.marketplaceSettings.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description }
  });
  res.json(setting);
});

export const getPaymentProviders = asyncHandler(async (req, res) => {
  const providers = await prisma.paymentProviderSettings.findMany();
  res.json(providers);
});

export const updatePaymentProvider = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isEnabled, apiKey, apiSecret, webhookSecret, credentials } = req.body;
  const provider = await prisma.paymentProviderSettings.update({
    where: { id },
    data: { isEnabled, apiKey, apiSecret, webhookSecret, credentials }
  });
  res.json(provider);
});

export const getDeliveryProviders = asyncHandler(async (req, res) => {
  const providers = await prisma.deliveryProviderSettings.findMany();
  res.json(providers);
});

export const updateDeliveryProvider = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isEnabled, apiKey, apiSecret, credentials } = req.body;
  const provider = await prisma.deliveryProviderSettings.update({
    where: { id },
    data: { isEnabled, apiKey, apiSecret, credentials }
  });
  res.json(provider);
});

export const getInvoices = asyncHandler(async (req, res) => {
  const invoices = await prisma.invoice.findMany({
    include: { vendor: { select: { name: true } }, customer: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(invoices);
});

export const getCommissions = asyncHandler(async (req, res) => {
  const commissions = await prisma.commission.findMany({
    include: { vendor: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(commissions);
});

export default {
  getAdminStats,
  getUsers,
  updateUser,
  getAuditLogs,
  getSettings,
  updateSettings,
  getPaymentProviders,
  updatePaymentProvider,
  getDeliveryProviders,
  updateDeliveryProvider,
  getInvoices,
  getCommissions
};
