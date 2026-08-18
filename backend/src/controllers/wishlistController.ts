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

// Wishlist item validation (just productId)
const wishlistItemSchema = z.object({
  productId: z.string(),
});

type TWishlistItem = z.infer<typeof wishlistItemSchema>;

export const getWishlist = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: true },
  });

  res.json({ items: wishlistItems });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const parseResult = wishlistItemSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  const { productId } = parseResult.data;

  // Check product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ error: "Product not found" });

  // Check if already in wishlist
  const existing = await prisma.wishlistItem.findFirst({
    where: { userId, productId },
  });

  if (existing) {
    // Already present
    return res.json({ action: "already_exists", message: "Item already in wishlist" });
  } else {
    // Add to wishlist
    await prisma.wishlistItem.create({
      data: { userId, productId },
    });
    return res.json({ action: "added", message: "Item added to wishlist" });
  }
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const { productId } = req.params;

  // Find wishlist item for this user and product
  const wishlistItem = await prisma.wishlistItem.findFirst({
    where: { userId, productId },
  });

  if (!wishlistItem) {
    return res.status(404).json({ error: "Wishlist item not found" });
  }

  await prisma.wishlistItem.delete({
    where: { id: wishlistItem.id },
  });

  res.json({ message: "Item removed from wishlist" });
});

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
