import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
const db = prisma as any;

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const getShipments = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  let whereClause = {};
  if (user.role === 'VENDOR') {
    whereClause = { vendorId: userId };
  } else if (user.role === 'CUSTOMER') {
    whereClause = { order: { userId: userId } };
  }

  const shipments = await db.shipment.findMany({
    where: whereClause,
    include: { order: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json(shipments);
});

export const updateShipmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;
  const userId = (req as any).userId;
  
  const shipment = await db.shipment.findUnique({ where: { id } });
  if (!shipment) return res.status(404).json({ error: "Shipment not found" });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== 'ADMIN' && shipment.vendorId !== userId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const updated = await db.shipment.update({
    where: { id },
    data: { 
      status, 
      trackingNumber,
      ...(status === 'delivered' ? { actualDelivery: new Date() } : {})
    }
  });

  res.json(updated);
});

export const getVendorDeliveryConfig = asyncHandler(async (req, res) => {
  const vendorId = (req as any).userId;
  const configs = await db.vendorDeliveryConfig.findMany({
    where: { vendorId }
  });
  res.json(configs);
});

export const updateVendorDeliveryConfig = asyncHandler(async (req, res) => {
  const vendorId = (req as any).userId;
  const { provider, isEnabled, credentials } = req.body;
  
  const config = await db.vendorDeliveryConfig.upsert({
    where: { id: req.body.id || 'new' },
    update: { isEnabled, credentials },
    create: { vendorId, provider, isEnabled, credentials }
  });

  res.json(config);
});

export default {
  getShipments,
  updateShipmentStatus,
  getVendorDeliveryConfig,
  updateVendorDeliveryConfig
};
