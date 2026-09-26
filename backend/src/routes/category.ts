import { Router, Request, Response } from "express";
import { prisma } from "../server";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

let cachedCategories: any = null;
let cachedCategoriesTime = 0;
const CATEGORIES_TTL = 10 * 60 * 1000; // 10 minutes

// GET all categories (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    if (cachedCategories && Date.now() - cachedCategoriesTime < CATEGORIES_TTL) {
      return res.json(cachedCategories);
    }
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });
    cachedCategories = categories;
    cachedCategoriesTime = Date.now();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST category (admin only)
router.post("/", authenticate, authorizeRole(["ADMIN"]), async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl, isActive } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        description,
        imageUrl,
        isActive: isActive ?? true,
      },
    });
    cachedCategories = null; // Invalidate cache
    res.status(201).json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE category (admin only)
router.delete("/:id", authenticate, authorizeRole(["ADMIN"]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    cachedCategories = null; // Invalidate cache
    res.json({ message: "Category deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
