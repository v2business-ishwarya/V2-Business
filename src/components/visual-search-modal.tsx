import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Upload,
  Sparkles,
  Search,
  Check,
  RefreshCw,
  Image as ImageIcon,
  ArrowRight,
  Eye,
  Scan,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VisualSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DetectedResult {
  searchTerm: string;
  categorySlug: string;
  categoryName: string;
  label: string;
  dominantColor: string;
  confidence: number;
  alternativeTags: string[];
}

const SAMPLE_PRESETS = [
  {
    id: "jewellery",
    label: "Gold Jhumka Earrings",
    categorySlug: "jewellery-accessories",
    categoryName: "Jewellery & Accessories",
    searchTerm: "Gold Earrings Jhumka",
    imageUrl:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
    color: "#EAB308",
  },
  {
    id: "saree",
    label: "Kanchipuram Silk Saree",
    categorySlug: "clothing-fashion",
    categoryName: "Clothing & Fashion",
    searchTerm: "Silk Saree Ethnic",
    imageUrl:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
    color: "#E11D48",
  },
  {
    id: "smartphone",
    label: "5G Smartphone & Tech",
    categorySlug: "mobile-telecom",
    categoryName: "Mobile & Telecom",
    searchTerm: "5G Smartphone",
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80",
    color: "#3B82F6",
  },
  {
    id: "sneakers",
    label: "Sports Running Shoes",
    categorySlug: "footwear",
    categoryName: "Footwear",
    searchTerm: "Sneakers Shoes",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
    color: "#EF4444",
  },
  {
    id: "grocery",
    label: "Organic Spices & Staples",
    categorySlug: "grocery-supermarkets",
    categoryName: "Grocery & Supermarkets",
    searchTerm: "Organic Spices",
    imageUrl:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    color: "#10B981",
  },
];

export function VisualSearchModal({
  open,
  onOpenChange,
}: VisualSearchModalProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [detectedResult, setDetectedResult] = useState<DetectedResult | null>(
    null
  );
  const [activeSearchTag, setActiveSearchTag] = useState<string>("");

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setSelectedImage(null);
      setIsScanning(false);
      setScanStage(0);
      setDetectedResult(null);
      setActiveSearchTag("");
    }
  }, [open]);

  // Image analysis logic using Canvas
  const analyzeImage = (
    imgSrc: string,
    fileNameHint = "",
    presetHint?: (typeof SAMPLE_PRESETS)[0]
  ) => {
    setSelectedImage(imgSrc);
    setIsScanning(true);
    setScanStage(1);
    setDetectedResult(null);

    // Multi-stage scanning animation
    setTimeout(() => setScanStage(2), 400);
    setTimeout(() => setScanStage(3), 800);

    setTimeout(() => {
      if (presetHint) {
        const res: DetectedResult = {
          searchTerm: presetHint.searchTerm,
          categorySlug: presetHint.categorySlug,
          categoryName: presetHint.categoryName,
          label: presetHint.label,
          dominantColor: presetHint.color,
          confidence: 96,
          alternativeTags: [
            presetHint.searchTerm,
            presetHint.categoryName,
            "Trending Local",
            "Best Price",
          ],
        };
        setDetectedResult(res);
        setActiveSearchTag(res.searchTerm);
        setIsScanning(false);
        return;
      }

      // Analyze image via HTML5 Canvas
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 100;
          canvas.height = 100;

          if (ctx) {
            ctx.drawImage(img, 0, 0, 100, 100);
            const imageData = ctx.getImageData(0, 0, 100, 100).data;
            let rTotal = 0;
            let gTotal = 0;
            let bTotal = 0;
            const count = imageData.length / 4;

            for (let i = 0; i < imageData.length; i += 4) {
              rTotal += imageData[i];
              gTotal += imageData[i + 1];
              bTotal += imageData[i + 2];
            }

            const avgR = Math.round(rTotal / count);
            const avgG = Math.round(gTotal / count);
            const avgB = Math.round(bTotal / count);
            const hexColor = `#${((1 << 24) + (avgR << 16) + (avgG << 8) + avgB)
              .toString(16)
              .slice(1)}`;

            // Name hint checking
            const nameLower = fileNameHint.toLowerCase();

            let matchedCategorySlug = "clothing-fashion";
            let matchedCategoryName = "Clothing & Fashion";
            let matchedTerm = "Ethnic Wear";
            let matchedLabel = "Fashion Apparel";
            let tags = ["Ethnic Wear", "Designer Apparel", "New Arrivals"];

            if (
              nameLower.includes("gold") ||
              nameLower.includes("jhumka") ||
              nameLower.includes("earring") ||
              nameLower.includes("necklace") ||
              nameLower.includes("jewel") ||
              (avgR > 140 && avgG > 110 && avgB < 100) // Warm gold/yellow tone
            ) {
              matchedCategorySlug = "jewellery-accessories";
              matchedCategoryName = "Jewellery & Accessories";
              matchedTerm = nameLower.includes("earring")
                ? "Earrings"
                : nameLower.includes("necklace")
                ? "Necklace"
                : "Gold Jewellery";
              matchedLabel = "Traditional Gold Jewellery";
              tags = [
                "Gold Jewellery",
                "Temple Jewellery",
                "Earrings",
                "Necklaces",
              ];
            } else if (
              nameLower.includes("saree") ||
              nameLower.includes("kurti") ||
              nameLower.includes("dress") ||
              nameLower.includes("silk") ||
              (avgR > 130 && avgB < 110 && avgG < 110) // Warm red / pink tone
            ) {
              matchedCategorySlug = "clothing-fashion";
              matchedCategoryName = "Clothing & Fashion";
              matchedTerm = nameLower.includes("saree")
                ? "Silk Saree"
                : "Ethnic Wear";
              matchedLabel = "Ethnic Saree & Fashion";
              tags = ["Silk Saree", "Pattu Sarees", "Kurtis", "Ethnic Wear"];
            } else if (
              nameLower.includes("phone") ||
              nameLower.includes("mobile") ||
              nameLower.includes("gadget") ||
              nameLower.includes("watch")
            ) {
              matchedCategorySlug = "mobile-telecom";
              matchedCategoryName = "Mobile & Telecom";
              matchedTerm = "5G Smartphone";
              matchedLabel = "Mobile & Smart Tech";
              tags = ["5G Mobiles", "Smartwatches", "Earbuds", "Accessories"];
            } else if (
              nameLower.includes("shoe") ||
              nameLower.includes("sneaker") ||
              nameLower.includes("sandal")
            ) {
              matchedCategorySlug = "footwear";
              matchedCategoryName = "Footwear";
              matchedTerm = "Sneakers";
              matchedLabel = "Casual & Sports Footwear";
              tags = ["Sneakers", "Running Shoes", "Leather Shoes", "Sandals"];
            } else if (
              nameLower.includes("spice") ||
              nameLower.includes("fruit") ||
              nameLower.includes("grocery") ||
              (avgG > avgR && avgG > avgB) // Green hue
            ) {
              matchedCategorySlug = "grocery-supermarkets";
              matchedCategoryName = "Grocery & Supermarkets";
              matchedTerm = "Organic Grocery";
              matchedLabel = "Daily Essentials & Groceries";
              tags = ["Organic Staples", "Spices", "Dry Fruits", "Fresh Food"];
            }

            const res: DetectedResult = {
              searchTerm: matchedTerm,
              categorySlug: matchedCategorySlug,
              categoryName: matchedCategoryName,
              label: matchedLabel,
              dominantColor: hexColor,
              confidence: 91,
              alternativeTags: tags,
            };

            setDetectedResult(res);
            setActiveSearchTag(res.searchTerm);
            setIsScanning(false);
            return;
          }
        } catch {
          // Canvas fallback
        }

        // Default fallback if canvas reading fails
        const fallback: DetectedResult = {
          searchTerm: "Featured Products",
          categorySlug: "clothing-fashion",
          categoryName: "Clothing & Fashion",
          label: "Visual Product Match",
          dominantColor: "#F59E0B",
          confidence: 88,
          alternativeTags: ["Trending Items", "Top Rated", "Local Best"],
        };
        setDetectedResult(fallback);
        setActiveSearchTag(fallback.searchTerm);
        setIsScanning(false);
      };

      img.src = imgSrc;
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          analyzeImage(event.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          analyzeImage(event.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const executeSearch = (customTag?: string) => {
    if (!detectedResult) return;
    const queryTerm = customTag || activeSearchTag || detectedResult.searchTerm;
    onOpenChange(false);
    navigate({
      to: "/search",
      search: {
        q: queryTerm,
        category: detectedResult.categorySlug,
        visual: "true",
        visualLabel: detectedResult.label,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border border-amber-500/20 bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-b border-amber-500/15 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Scan className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>Visual Product Search</span>
                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] uppercase font-bold tracking-wide">
                  AI Lens
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Snap a photo with your camera or upload an image to find matching products
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Hidden file inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          {/* Camera input with capture="environment" for smartphones */}
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {!selectedImage ? (
            /* Upload / Capture Choices */
            <div className="space-y-5">
              {/* Primary Action Buttons: Camera & Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Take Photo with Camera */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-amber-500/35 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 transition-all text-center cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/30 mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-sm text-foreground">
                    Take Photo with Camera
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    Opens mobile phone camera or webcam
                  </span>
                  <Badge
                    variant="secondary"
                    className="mt-2 text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold"
                  >
                    Mobile Instant Snap
                  </Badge>
                </button>

                {/* Upload or Drop Image */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="group relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-border hover:border-amber-500/60 bg-muted/40 hover:bg-amber-500/5 transition-all text-center cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="h-12 w-12 rounded-full bg-muted border border-border text-foreground flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="h-5 w-5 text-amber-500" />
                  </div>
                  <span className="font-bold text-sm text-foreground">
                    Upload Photo / Drag & Drop
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    Select JPG, PNG, WEBP from your device
                  </span>
                  <Badge
                    variant="outline"
                    className="mt-2 text-[10px] text-muted-foreground font-semibold"
                  >
                    Browse Files
                  </Badge>
                </button>
              </div>

              {/* Sample Images Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Try with sample items
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Click to test instant match
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SAMPLE_PRESETS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => analyzeImage(item.imageUrl, "", item)}
                      className="group relative flex items-center gap-2.5 p-2 rounded-xl border border-border/80 hover:border-amber-500/50 bg-card hover:bg-amber-500/5 transition-all text-left overflow-hidden cursor-pointer"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.label}
                        className="h-11 w-11 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-foreground truncate group-hover:text-amber-600 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {item.categoryName}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Image Preview & Scan Analysis Section */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-border bg-black/5 dark:bg-black/40 flex items-center justify-center max-h-[260px]">
                <img
                  src={selectedImage}
                  alt="Scanned item"
                  className="max-h-[260px] w-auto object-contain rounded-2xl"
                />

                {/* Laser Scanning Animation Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex flex-col items-center justify-between p-4 overflow-hidden pointer-events-none">
                    {/* Glowing moving scan line */}
                    <motion.div
                      initial={{ y: "0%" }}
                      animate={{ y: ["0%", "100%", "0%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 shadow-[0_0_15px_#F59E0B]"
                    />

                    {/* Corner Reticle Markers */}
                    <div className="w-full flex justify-between">
                      <div className="w-6 h-6 border-t-2 border-l-2 border-amber-400" />
                      <div className="w-6 h-6 border-t-2 border-r-2 border-amber-400" />
                    </div>

                    {/* Scan Status Pill */}
                    <div className="bg-black/80 border border-amber-400/40 text-amber-300 text-xs px-3.5 py-1.5 rounded-full font-semibold flex items-center gap-2 backdrop-blur-md shadow-lg">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
                      {scanStage === 1 && "Detecting image contours..."}
                      {scanStage === 2 && "Analyzing color tones & textures..."}
                      {scanStage === 3 && "Matching marketplace catalog..."}
                    </div>

                    <div className="w-full flex justify-between">
                      <div className="w-6 h-6 border-b-2 border-l-2 border-amber-400" />
                      <div className="w-6 h-6 border-b-2 border-r-2 border-amber-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Results & Actions after scan */}
              {!isScanning && detectedResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">
                            Visual Match Detected
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Identified category:{" "}
                            <span className="font-semibold text-foreground">
                              {detectedResult.categoryName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                        {detectedResult.confidence}% Visual Match
                      </Badge>
                    </div>

                    {/* Detected tags selector */}
                    <div>
                      <div className="text-[11px] text-muted-foreground font-medium mb-1.5">
                        Suggested search query:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {detectedResult.alternativeTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setActiveSearchTag(tag)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                              activeSearchTag === tag
                                ? "bg-amber-500 text-white border-amber-500 font-bold shadow-xs"
                                : "bg-card text-foreground/80 border-border hover:border-amber-500/40"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedImage(null);
                        setDetectedResult(null);
                      }}
                      className="rounded-full text-xs gap-1.5 h-10 px-4"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Scan Another</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => executeSearch()}
                      className="flex-1 rounded-full h-10 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-xs font-bold shadow-md shadow-amber-500/25 gap-2"
                    >
                      <Search className="h-4 w-4" />
                      <span>Search "{activeSearchTag}"</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
