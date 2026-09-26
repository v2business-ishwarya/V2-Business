import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import * as z from "zod";
import { authenticate } from "../middleware/authMiddleware";
import { getOrFetchActiveCatalog } from "./productController";

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
const SEARCH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

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

  // Ultra-fast in-memory catalog search (< 1ms response)
  const catalog = await getOrFetchActiveCatalog();
  if (catalog && (skip + limitNum <= catalog.length || catalog.length < 1000)) {
    let filtered = catalog;

    if (q && q.trim() !== "") {
      const term = q.trim().toLowerCase();
      filtered = filtered.filter((p: any) => {
        const n = (p.name || "").toLowerCase();
        const d = (p.description || "").toLowerCase();
        const c = (p.category || "").toLowerCase();
        const vn = (p.vendor?.name || "").toLowerCase();
        return n.includes(term) || d.includes(term) || c.includes(term) || vn.includes(term);
      });
    }

    if (category) {
      const cat = category.toLowerCase();
      filtered = filtered.filter((p: any) => (p.category || "").toLowerCase().includes(cat));
    }
    if (isActive !== undefined) {
      filtered = filtered.filter((p: any) => Boolean(p.isActive) === (isActive === "true"));
    }
    if (featured !== undefined) {
      filtered = filtered.filter((p: any) => Boolean(p.featured) === (featured === "true"));
    }
    if (minPrice !== undefined) {
      filtered = filtered.filter((p: any) => p.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter((p: any) => p.price <= maxPrice);
    }

    // Sort
    if (sortBy === "price") {
      filtered.sort((a, b) => (sortOrder === "asc" ? a.price - b.price : b.price - a.price));
    } else if (sortBy === "name") {
      filtered.sort((a, b) =>
        sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      );
    }

    const total = filtered.length;
    const sliced = filtered.slice(skip, skip + limitNum);
    const responseData = {
      data: sliced,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    };
    searchCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    return res.json(responseData);
  }

  // Build where clause fallback
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

  const products = await prisma.product.findMany({
    skip,
    take: limitNum,
    where,
    orderBy,
    include: { vendor: { select: { id: true, name: true } } },
  });

  let total = skip + products.length;
  if (pageNum > 1 || products.length === limitNum) {
    total = await prisma.product.count({ where });
  }

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
  const catalog = await getOrFetchActiveCatalog();
  if (catalog) {
    const matched = catalog
      .filter(
        (p: any) =>
          (p.name || "").toLowerCase().includes(cleanQ) ||
          (p.category || "").toLowerCase().includes(cleanQ)
      )
      .slice(0, limit)
      .map((p: any) => ({ id: p.id, name: p.name }));
    searchCache.set(suggCacheKey, { data: matched, timestamp: Date.now() });
    return res.json(matched);
  }

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
