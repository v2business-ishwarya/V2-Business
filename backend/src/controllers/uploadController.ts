import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import * as z from "zod";
import { authenticate } from "../middleware/authMiddleware";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Upload file to Cloudinary and return secure URL
export const uploadFile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).userId;
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { buffer, mimetype, originalname, size } = req.file;

  // Optional: validate file size (e.g., max 10MB)
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (size > MAX_SIZE) {
    return res.status(400).json({ error: `File size exceeds ${MAX_SIZE} bytes` });
  }

  // Optional: validate mimetype
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
  ];
  if (!allowedTypes.includes(mimetype)) {
    return res.status(400).json({ error: "File type not allowed" });
  }

  // Upload to Cloudinary as a stream
  const uploadResult = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "marketplace/uploads",
        resource_type: "auto", // auto-detect image/video/raw
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

  // Optionally, store file metadata in DB (optional)
  // await prisma.file.create({
  //   data: {
  //     userId,
  //     publicId: uploadResult.public_id,
  //     url: uploadResult.secure_url,
  //     originalName: originalname,
  //     mimeType: mimetype,
  //     size,
  //   },
  // });

  res.status(200).json({
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    originalName: originalname,
  });
});

export default {
  uploadFile,
};
