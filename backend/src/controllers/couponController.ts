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

// Coupon validation schema
const couponSchema = z.object({
  code: z.string().min(3).max(20),
  name: z.string().optional(),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minPurchase: z.number().nonnegative().optional(),
  startsAt: z.date(),
  expiresAt: z.date(),
  usageLimit: z.number().int().nonnegative().optional(), // null means unlimited
  isActive: z.boolean().default(true),
});

// For update, make all fields partial
const updateCouponSchema = couponSchema.partial();

type TCoupon = z.infer<typeof couponSchema>;

export const createCoupon = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const parseResult = couponSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  const data = parseResult.data;
  const couponData = {
    ...data,
    name: data.name ?? data.code,
    discountType: data.discountType === "FIXED" ? ("FIXED_AMOUNT" as const) : data.discountType,
  };

  // Ensure code is unique
  const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
  if (existing) {
    return res.status(409).json({ error: "Coupon code already exists" });
  }

  const coupon = await prisma.coupon.create({ data: couponData });
  res.status(201).json(coupon);
});

export const getCoupons = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const skip = (page - 1) * limit;

  const [coupons, total] = await prisma.$transaction([
    prisma.coupon.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.coupon.count(),
  ]);

  res.json({ data: coupons, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getCouponById = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const { id } = req.params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return res.status(404).json({ error: "Coupon not found" });
  res.json(coupon);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const { id } = req.params;
  const parseResult = updateCouponSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  const data = parseResult.data;
  const couponData = {
    ...data,
    discountType: data.discountType === "FIXED" ? ("FIXED_AMOUNT" as const) : data.discountType,
  };

  const coupon = await prisma.coupon.update({
    where: { id },
    data: couponData,
  });
  res.json(coupon);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const { id } = req.params;
  await prisma.coupon.delete({ where: { id } });
  res.status(204).send();
});

// Public endpoint to validate a coupon code (returns discount info)
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code required" });

  const coupon = await prisma.coupon.findFirst({
    where: {
      code,
      isActive: true,
      // Check date validity
      startsAt: { lte: new Date() },
      expiresAt: { gte: new Date() },
    },
  });
  if (!coupon) return res.status(404).json({ error: "Invalid or expired coupon" });

  // Check usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ error: "Coupon usage limit exceeded" });
  }

  res.json({
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minPurchase: coupon.minPurchase,
    isActive: coupon.isActive,
  });
});

export default {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
