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

export const searchProducts = asyncHandler(async (req, res) => {
  const parseResult = searchSchema.safeParse(req.query);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
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

  // Full-text search using PostgreSQL @@ operator and to_tsquery
  if (q && q.trim() !== "") {
    // We'll use Prisma's full-text search via `search` (requires @db.TsVector column)
    // Assuming we have a `searchVector` column on Product
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      // For full-text search using tsvector, we can use Prisma's `$queryRaw` but keep simple
    ];
    // If you have a tsvector column, you could do:
    // where.AND = [
    //   { search: { search: q } },
    // ];
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

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      skip,
      take: limitNum,
      where,
      orderBy,
      include: { vendor: { select: { id: true, name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    data: products,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// Optional: endpoint for search suggestions (autocomplete)
export const searchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== "string" || q.trim().length < 2) {
    return res.json([]);
  }
  const limit = 5;
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q as string, mode: "insensitive" } },
        { description: { contains: q as string, mode: "insensitive" } },
      ],
      isActive: true,
    },
    select: { id: true, name: true },
    take: limit,
  });
  res.json(products);
});

export default {
  searchProducts,
  searchSuggestions,
};
