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

// Review validation
const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

type TReview = z.infer<typeof reviewSchema>;

export const createReview = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const parseResult = reviewSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  const { productId, rating, title, comment } = parseResult.data;

  // Optional: verify user has purchased product (check order items)
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId, status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] } },
    },
  });
  // For simplicity, we allow reviews without purchase verification; can enable if needed.
  // if (!hasPurchased) return res.status(403).json({ error: 'You must purchase the product to review it' });

  // Check if user already reviewed this product
  const existing = await prisma.review.findFirst({
    where: { userId, productId },
  });
  if (existing) {
    return res.status(400).json({ error: "You have already reviewed this product" });
  }

  const review = await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      title,
      comment,
    },
  });

  res.status(201).json(review);
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Number(req.query.limit ?? 10), 50);
  const skip = (page - 1) * limit;

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  res.json({ data: reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const toggleHelpfulVote = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const { reviewId } = req.params;

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return res.status(404).json({ error: "Review not found" });

  // Check if user already voted
  const existingVote = await prisma.helpfulVote.findFirst({
    where: { userId, reviewId },
  });

  if (existingVote) {
    // Remove vote (toggle off)
    await prisma.helpfulVote.delete({
      where: { id: existingVote.id },
    });
    // Decrement helpfulCount
    await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { decrement: 1 } },
    });
    return res.json({ voted: false, helpfulCount: review.helpfulCount - 1 });
  } else {
    // Add vote
    await prisma.helpfulVote.create({
      data: { userId, reviewId },
    });
    // Increment helpfulCount
    await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    });
    return res.json({ voted: true, helpfulCount: review.helpfulCount + 1 });
  }
});

// Admin: get all reviews (with pagination)
export const getAllReviews = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const skip = (page - 1) * limit;

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count(),
  ]);

  res.json({ data: reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// Admin: delete review (moderation)
export const deleteReview = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  const { id } = req.params;
  await prisma.review.delete({ where: { id } });
  res.json({ message: "Review deleted" });
});

export default {
  createReview,
  getProductReviews,
  toggleHelpfulVote,
  getAllReviews,
  deleteReview,
};
