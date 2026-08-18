import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import * as z from "zod";
import { authenticate, authorizeRole, attachUser } from "../middleware/authMiddleware";

// Helper
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Order creation expects cart items; we reduce stock and create order/items
const orderCreateSchema = z.object({
  couponCode: z.string().optional(),
  shippingAddress: z.any().optional(),
  billingAddress: z.any().optional(),
  notes: z.string().optional(),
});

type TOrderCreate = z.infer<typeof orderCreateSchema>;

export const createOrder = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: "User not found" });

  const parsedBody = orderCreateSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: parsedBody.error.errors });
  }
  const { couponCode, shippingAddress, billingAddress, notes } = parsedBody.data;

  // We should also accept providerType from request if we want to allow users to select it
  const providerType = req.body.providerType || 'mock';

  try {
    const { CheckoutService } = await import('../services/checkoutService');
    const checkoutService = new CheckoutService(providerType);
    const checkoutResult = await checkoutService.checkout(userId, shippingAddress, providerType);
    
    // The checkoutResult returns paymentSessionId, orderId, vendorOrders, etc.
    res.status(201).json(checkoutResult);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Number(req.query.limit ?? 10), 50);
  const skip = (page - 1) * limit;
  const status = (req.query.status as string) ?? undefined;

  const where: any = { userId };
  if (status) {
    where.status = status;
  }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// Vendors can only see order lines for products they own, together with the buyer and delivery details.
export const getVendorOrders = asyncHandler(async (req, res) => {
  const vendorId = (req as any).userId;
  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { vendorId } } } },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        where: { product: { vendorId } },
        include: { product: { select: { id: true, name: true, images: true, sku: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: orders });
});

export const updateVendorOrderStatus = asyncHandler(async (req, res) => {
  const vendorId = (req as any).userId;
  const { id } = req.params;
  const status = String(req.body.status ?? "").toUpperCase();
  if (!['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ error: "Invalid order status" });
  }
  const permitted = await prisma.orderItem.findFirst({
    where: { orderId: id, product: { vendorId } },
    select: { id: true },
  });
  if (!permitted) return res.status(404).json({ error: "Order not found" });
  const order = await prisma.order.update({ where: { id }, data: { status: status as any } });
  res.json(order);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).userId;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== "ADMIN") return res.status(403).json({ error: "Not authorized" });
  }
  res.json(order);
});

// Admin: update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as {
    status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  };
  if (!status) return res.status(400).json({ error: "Status required" });
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });
  res.json(order);
});

// Admin: list all orders (with pagination)
export const getAllOrders = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } }, items: true },
    }),
    prisma.order.count(),
  ]);

  res.json({ data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export default {
  createOrder,
  getMyOrders,
  getVendorOrders,
  updateVendorOrderStatus,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
};
