import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
const db = prisma as any;

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const getInvoices = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  let whereClause = {};
  if (user.role === 'VENDOR') {
    whereClause = { vendorId: userId };
  } else if (user.role === 'CUSTOMER') {
    whereClause = { customerId: userId };
  } // Admin sees all if calling the admin endpoint

  const invoices = await db.invoice.findMany({
    where: whereClause,
    include: {
      vendor: { select: { id: true, name: true, email: true } },
      customer: { select: { id: true, name: true, email: true } },
      invoiceItems: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(invoices || []);
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).userId;
  
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      vendor: { select: { id: true, name: true, email: true } },
      customer: { select: { id: true, name: true, email: true } },
      invoiceItems: { include: { product: true } },
      order: true
    }
  });

  if (!invoice) return res.status(404).json({ error: "Invoice not found" });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== 'ADMIN' && invoice.vendorId !== userId && invoice.customerId !== userId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  res.json(invoice);
});

export default {
  getInvoices,
  getInvoiceById
};
