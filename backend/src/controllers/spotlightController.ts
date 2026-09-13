
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

interface SpotlightAd {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  storeName?: string;
  title: string;
  subtitle?: string;
  bannerUrl: string;
  targetUrl?: string;
  buttonText?: string;
  targetDate: string;
  paymentAmount?: number;
  paymentTxnId?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const SETTING_KEY = "SPOTLIGHT_ADS";

async function getStoredAds(): Promise<SpotlightAd[]> {
  try {
    const setting = await prisma.marketplaceSettings.findUnique({
      where: { key: SETTING_KEY },
    });
    if (setting && setting.value && Array.isArray(setting.value)) {
      return setting.value as unknown as SpotlightAd[];
    }
    return [];
  } catch (err) {
    console.error("[SPOTLIGHT GET ERROR]", err);
    return [];
  }
}

async function saveStoredAds(ads: SpotlightAd[]): Promise<void> {
  await prisma.marketplaceSettings.upsert({
    where: { key: SETTING_KEY },
    update: {
      value: ads as any,
      description: "Spotlight popup advertisements (1 vendor per day)",
    },
    create: {
      key: SETTING_KEY,
      value: ads as any,
      description: "Spotlight popup advertisements (1 vendor per day)",
    },
  });
}

export const getTodaySpotlight = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const ads = await getStoredAds();
    const approvedToday = ads.find(
      (ad) => ad.targetDate === today && (ad.status === "APPROVED" || (ad.status as any) === "qpproved")
    );
    return res.json(approvedToday || null);
  } catch (error) {
    next(error);
  }
};

export const getVendorSpotlightAds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const ads = await getStoredAds();

    if (userRole === "ADMIN") {
      return res.json(ads);
    }

    const filtered = ads.filter((ad) => !userId || ad.vendorId === userId);
    return res.json(filtered);
  } catch (error) {
    next(error);
  }
};

export const createVendorSpotlightAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId || "vendor";
    const user = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);

    const body = req.body || {};
    const newAd: SpotlightAd = {
      id: `ad-1789321340803-sak8`,
      vendorId: userId,
      vendorName: user?.name || body.vendorName || "Store Vendor",
      vendorEmail: user?.email || body.vendorEmail || "vendor@v2business.in",
      storeName: body.storeName || user?.name || "Featured Store",
      title: body.title || "Special Daily Offer",
      subtitle: body.subtitle || "",
      bannerUrl: body.bannerUrl || "",
      targetUrl: body.targetUrl || "/search",
      buttonText: body.buttonText || "Shop Deals Now",
      targetDate: body.targetDate || new Date().toISOString().split("T")[0],
      paymentAmount: Number(body.paymentAmount) || 499,
      paymentTxnId: body.paymentTxnId || "",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ads = await getStoredAds();
    ads.unshift(newAd);
    await saveStoredAds(ads);

    return res.status(201).json(newAd);
  } catch (error) {
    next(error);
  }
};
 
export const getAdminSpotlightAds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ads = await getStoredAds();
    return res.json(ads);
  } catch (error) {
    next(error);
  }
};

export const updateSpotlightAdStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const ads = await getStoredAds();
    let updatedAd: SpotlightAd | null = null;

    const updatedAds = ads.map((ad) => {
      if (ad.id === id) {
        updatedAd = {
          ...ad,
          status: status || ad.status,
          adminNotes: adminNotes !== undefined ? adminNotes : ad.adminNotes,
          updatedAt: new Date().toISOString(),
        };
        return updatedAd;
      }
      return ad;
    });

    if (!updatedAd) {
      return res.status(404).json({ error: "Spotlight ad not found" });
    }

    await saveStoredAds(updatedAds);
    return res.json(updatedAd);
  } catch (error) {
    next(error);
  }
};