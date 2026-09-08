import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import * as z from "zod";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper async wrapper
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Helper to upload buffer to Cloudinary and return secure URL
const uploadToCloudinary = (buffer: Buffer, filename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder: "marketplace/products", resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url ?? "");
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Zod schema for product creation/update
const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative().default(0),
  sku: z.string().optional(),
  weight: z.coerce.number().nonnegative().optional(),
  dimensions: z.record(z.string(), z.number()).optional(),
  images: z.array(z.string()).default([]),
  category: z.string().default("General"),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
});

type TProductCreate = z.infer<typeof productSchema>;

export const createProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Parse non-file fields from body (text fields)
    const parseResult = productSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }
    const data = parseResult.data as TProductCreate;
    const userId = (req as any).userId;

    // Process uploaded images (if any)
    let imageUrls: string[] = data.images ?? []; // start with any URLs provided in body
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const files = req.files as Express.Multer.File[];
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadToCloudinary(file.buffer, file.originalname)),
      );
      // Replace images with newly uploaded ones
      imageUrls = uploadedUrls;
    }
    // Override images field with uploaded URLs
    data.images = imageUrls;

    const product = await prisma.product.create({
      data: {
        ...data,
        vendorId: userId,
      },
    });
    res.status(201).json(product);
  },
);

export const getAllProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Number(req.query.limit ?? 20), 100);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) ?? "";
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { vendor: { name: { contains: search, mode: "insensitive" } } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }
    if (req.query.category) {
      where.category = req.query.category as string;
    }
    if (req.query.vendorId) {
      where.vendorId = req.query.vendorId as string;
    }
    if (req.query.isActive !== undefined) {
      where.isActive = req.query.isActive === "true";
    }
    if (req.query.featured !== undefined) {
      where.featured = req.query.featured === "true";
    }

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
        include: { vendor: { select: { id: true, name: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  },
);

export const getOneProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { vendor: { select: { id: true, name: true } } },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    // Validate non-file fields (partial)
    const parseResult = productSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }
    const data = parseResult.data as Partial<TProductCreate>;
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return res.status(404).json({ error: "Product not found" });
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.role !== "ADMIN" && existingProduct.vendorId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Process uploaded images (if any)
    let imageUrls: string[] = (data.images ?? []) as string[]; // start with any URLs provided in body
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const files = req.files as Express.Multer.File[];
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadToCloudinary(file.buffer, file.originalname)),
      );
      // Replace images with newly uploaded ones
      imageUrls = uploadedUrls;
    }
    // Update the images field if we have new uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      data.images = imageUrls;
    }

    // Update product
    const updated = await prisma.product.update({
      where: { id },
      data,
    });
    res.json(updated);
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.role !== "ADMIN" && product.vendorId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  },
);

export default {
  createProduct,
  getAllProducts,
  getOneProduct,
  updateProduct,
  deleteProduct,
};
