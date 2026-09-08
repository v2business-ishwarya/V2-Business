import * as React from "react";
import { useState, useRef } from "react";
import { uploadProductImage } from "@/lib/supabase-storage";
import { formatBytes } from "@/lib/image-compression";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Star,
  CheckCircle2,
  Loader2,
  Sparkles,
  Plus,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ImageItem {
  id: string;
  url: string;
  originalSize?: number;
  compressedSize?: number;
  savings?: number;
}

interface UploadTask {
  id: string;
  fileName: string;
  progress: number;
  stage: "compressing" | "uploading" | "completed" | "failed";
}

interface ImageUploaderProps {
  value: string[]; // List of image URLs
  onChange: (urls: string[]) => void;
  maxImages?: number;
  folderPrefix?: string;
}

export function ImageUploader({
  value = [],
  onChange,
  maxImages = 8,
  folderPrefix = "products",
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadTask[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUrls = Array.isArray(value) ? value.filter(Boolean) : [];

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      toast.error("Please select valid image files (JPG, PNG, WebP).");
      return;
    }

    if (currentUrls.length + fileArray.length > maxImages) {
      toast.warning(`You can upload a maximum of ${maxImages} images per product.`);
      return;
    }

    // Process each file sequentially or concurrently
    for (const file of fileArray) {
      const taskId = Math.random().toString(36).substring(2, 9);
      const newTask: UploadTask = {
        id: taskId,
        fileName: file.name,
        progress: 10,
        stage: "compressing",
      };

      setUploadQueue((prev) => [...prev, newTask]);

      try {
        const result = await uploadProductImage(file, folderPrefix, (prog, stage) => {
          setUploadQueue((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, progress: prog, stage } : t))
          );
        });

        // Add uploaded URL to product images list
        onChange([...currentUrls, result.url]);
        toast.success(
          `Compressed & uploaded: saved ${result.compression.savingsPercent}% space (${formatBytes(
            result.compression.originalSize
          )} ➔ ${formatBytes(result.compression.compressedSize)})`
        );

        // Remove from upload queue after short delay
        setTimeout(() => {
          setUploadQueue((prev) => prev.filter((t) => t.id !== taskId));
        }, 1200);
      } catch (err: any) {
        toast.error(`Upload failed for ${file.name}: ${err.message || "Network error"}`);
        setUploadQueue((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, stage: "failed", progress: 0 } : t))
        );
        setTimeout(() => {
          setUploadQueue((prev) => prev.filter((t) => t.id !== taskId));
        }, 3000);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (indexToRemove: number) => {
    const updated = currentUrls.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const setAsCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const coverItem = currentUrls[indexToCover];
    const remaining = currentUrls.filter((_, idx) => idx !== indexToCover);
    onChange([coverItem, ...remaining]);
    toast.success("Set as primary cover image");
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;
    if (currentUrls.length >= maxImages) {
      toast.warning(`Maximum ${maxImages} images allowed.`);
      return;
    }
    onChange([...currentUrls, cleanUrl]);
    setUrlInput("");
    setShowUrlInput(false);
    toast.success("Image URL added");
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
          // Reset file input so same file can be re-selected if needed
          e.target.value = "";
        }}
      />

      {/* Drag & Drop Main Zone */}
      {currentUrls.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 transition-all text-center flex flex-col items-center justify-center ${
            isDragging
              ? "border-primary bg-primary/10 scale-[0.99]"
              : "border-border hover:border-primary/60 bg-muted/30 hover:bg-muted/50"
          }`}
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <UploadCloud className="h-7 w-7" />
          </div>

          <p className="font-bold text-sm text-foreground">
            Click to upload photos or drag & drop here
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            PNG, JPG, or WebP up to 15MB each · Up to {maxImages} images
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="gap-1 text-[11px] bg-emerald-500/10 text-emerald-700 border-emerald-500/20 font-medium">
              <Sparkles className="h-3 w-3" /> Auto-compressed WebP
            </Badge>
            <Badge variant="secondary" className="text-[11px]">
              ⚡ Global CDN Delivery
            </Badge>
          </div>
        </div>
      )}

      {/* Upload Tasks Progress Bars */}
      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <div className="space-y-2">
            {uploadQueue.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm text-xs"
              >
                {task.stage === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                )}

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="truncate">{task.fileName}</span>
                    <span className="text-muted-foreground capitalize">{task.stage}...</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Uploaded Images Preview Grid */}
      {currentUrls.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Product Photos ({currentUrls.length}/{maxImages})
            </span>
            <span className="text-xs text-muted-foreground">
              First image is the <strong>Main Cover</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {currentUrls.map((url, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={`${url}-${index}`}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border-2 bg-muted transition-all shadow-sm ${
                    isCover ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Product angle ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    {isCover ? (
                      <Badge className="bg-primary text-primary-foreground text-[10px] font-bold shadow-md gap-1">
                        <Star className="h-3 w-3 fill-current" /> Cover
                      </Badge>
                    ) : (
                      <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Actions Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7 rounded-lg shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {!isCover && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="w-full text-xs font-bold rounded-lg bg-white/90 text-black hover:bg-white shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsCover(index);
                        }}
                      >
                        Set as Cover
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick Add Button inside grid if not max */}
            {currentUrls.length < maxImages && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 flex flex-col items-center justify-center gap-1 transition-all text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-6 w-6" />
                <span className="text-xs font-semibold">Add More</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manual URL Input Option */}
      <div className="pt-1">
        {!showUrlInput ? (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <LinkIcon className="h-3.5 w-3.5" /> Or add image by URL
          </button>
        ) : (
          <form onSubmit={handleAddUrl} className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="text-xs h-9"
            />
            <Button type="submit" size="sm" className="h-9 font-semibold">
              Add URL
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-muted-foreground"
              onClick={() => setShowUrlInput(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ImageUploader;
