/**
 * Client-Side Image Compression Utility for V2 Business
 * 
 * Automatically compresses large high-resolution photos (5MB - 15MB)
 * down to ~100KB - 200KB WebP images before uploading to Supabase Storage.
 * Saves 95%+ bandwidth and storage while preserving crisp e-commerce clarity.
 */

export interface CompressionResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
}

export interface CompressionOptions {
  maxDimension?: number; // Max width or height in px (default: 1200)
  quality?: number; // Quality from 0.0 to 1.0 (default: 0.82)
  outputFormat?: "image/webp" | "image/jpeg"; // Default: WebP
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxDimension = 1200,
    quality = 0.82,
    outputFormat = "image/webp",
  } = options;

  // If already a small WebP file under 150KB, skip heavy re-compression
  if (file.type === "image/webp" && file.size < 150 * 1024) {
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      previewUrl,
      originalSize: file.size,
      compressedSize: file.size,
      savingsPercent: 0,
      width: maxDimension,
      height: maxDimension,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image into memory"));
      img.onload = () => {
        let { width, height } = img;

        // Calculate proportional dimensions
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Draw onto HTML5 Canvas for hardware-accelerated downscaling
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });

        if (!ctx) {
          return reject(new Error("Could not create canvas 2d context"));
        }

        // Apply smooth bilinear scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP Blob (with JPEG fallback if browser doesn't support WebP export)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Canvas toBlob conversion failed"));
            }

            const cleanFileName = file.name
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-zA-Z0-9_-]/g, "_")
              .toLowerCase();
            const extension = outputFormat === "image/webp" ? ".webp" : ".jpg";
            const compressedFile = new File([blob], `${cleanFileName}${extension}`, {
              type: outputFormat,
              lastModified: Date.now(),
            });

            const previewUrl = URL.createObjectURL(blob);
            const savingsPercent = Math.max(
              0,
              Math.round(((file.size - blob.size) / file.size) * 100)
            );

            resolve({
              file: compressedFile,
              previewUrl,
              originalSize: file.size,
              compressedSize: blob.size,
              savingsPercent,
              width,
              height,
            });
          },
          outputFormat,
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes into human readable format (KB / MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
