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

// Cart item validation
const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

type TCartItem = z.infer<typeof cartItemSchema>;

export const getCart = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { vendor: true } } },
  });

  // Calculate totals
  let subtotal = 0;
  for (const item of cartItems) {
    if (item.product) {
      subtotal += item.product.price * item.quantity;
    }
  }

  res.json({ items: cartItems, subtotal });
});

export const addToCart = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const parseResult = cartItemSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  const { productId, quantity } = parseResult.data;

  // Check product exists and has stock
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ error: "Product not found" });
  if (product.stock < quantity) {
    return res.status(400).json({ error: "Insufficient stock" });
  }

  // Check if item already in cart
  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId },
  });

  if (existing) {
    // Update quantity
    const newQty = existing.quantity + quantity;
    if (product.stock < newQty) {
      return res.status(400).json({ error: "Insufficient stock" });
    }
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { userId, productId, quantity },
    });
  }

  res.status(201).json({ message: "Item added to cart" });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const parseResult = cartItemSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  const { quantity } = parseResult.data;

  const cartItem = await prisma.cartItem.findFirst({
    where: { id, userId },
    include: { product: true },
  });
  if (!cartItem) return res.status(404).json({ error: "Cart item not found" });

  if (cartItem.product && cartItem.product.stock < quantity) {
    return res.status(400).json({ error: "Insufficient stock" });
  }

  await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  });

  res.json({ message: "Cart updated" });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;

  await prisma.cartItem.delete({
    where: { id, userId },
  });

  res.json({ message: "Item removed from cart" });
});

export const clearCart = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  await prisma.cartItem.deleteMany({ where: { userId } });
  res.json({ message: "Cart cleared" });
});

export const getCartCount = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const count = await prisma.cartItem.count({ where: { userId } });
  res.json({ count });
});

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
};
