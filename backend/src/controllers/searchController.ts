import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import * as z from "zod";
import { authenticate } from "../middleware/authMiddleware";

// Helper
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Search query schema
const searchSchema = z.object({
  q: z.string().optional().default(""),
  category: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.enum(["price", "name", "createdAt", "rating"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

type TSearchParams = z.infer<typeof searchSchema>;

// Fast In-Memory Cache for Search
const searchCache = new Map<string, { data: any; timestamp: number }>();
const SEARCH_CACHE_TTL = 60 * 1000; // 60s

export const searchProducts = asyncHandler(async (req, res) => {
  const parseResult = searchSchema.safeParse(req.query);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }

  const cacheKey = `search:${JSON.stringify(req.query)}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
    return res.json(cached.data);
  }

  const {
    q,
    category,
    isActive,
    featured,
    minPrice,
    maxPrice,
    page = "1",
    limit = "20",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = parseResult.data;

  const pageNum = Math.max(parseInt(page, 10), 1);
  const limitNum = Math.min(parseInt(limit, 10), 100);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  if (q && q.trim() !== "") {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = category;
  }
  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }
  if (featured !== undefined) {
    where.featured = featured === "true";
  }
  if (minPrice !== undefined) {
    where.price = { ...(where.price || {}), gte: minPrice };
  }
  if (maxPrice !== undefined) {
    where.price = { ...(where.price || {}), lte: maxPrice };
  }

  // Order by
  const orderBy: any = {};
  if (sortBy) {
    orderBy[sortBy] = sortOrder;
  } else {
    orderBy.createdAt = "desc";
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limitNum,
      where,
      orderBy,
      include: { vendor: { select: { id: true, name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  const responseData = {
    data: products,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  };
  searchCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

  res.json(responseData);
});

// Optional: endpoint for search suggestions (autocomplete)
export const searchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== "string" || q.trim().length < 2) {
    return res.json([]);
  }
  const cleanQ = (q as string).trim().toLowerCase();
  const suggCacheKey = `sugg:${cleanQ}`;
  const cachedSugg = searchCache.get(suggCacheKey);
  if (cachedSugg && Date.now() - cachedSugg.timestamp < SEARCH_CACHE_TTL) {
    return res.json(cachedSugg.data);
  }

  const limit = 5;
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: cleanQ, mode: "insensitive" } },
        { description: { contains: cleanQ, mode: "insensitive" } },
      ],
      isActive: true,
    },
    select: { id: true, name: true },
    take: limit,
  });
  searchCache.set(suggCacheKey, { data: products, timestamp: Date.now() });
  res.json(products);
});

export default {
  searchProducts,
  searchSuggestions,
};
