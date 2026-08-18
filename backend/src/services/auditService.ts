import { prisma } from "../server";
import { Prisma } from "../generated/client";

type AuditLogParams = {
  action: string;
  details?: Prisma.InputJsonValue;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

type AuditLogQuery = {
  page?: number;
  limit?: number;
  action?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
};

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {string} params.action - Action performed (e.g., 'CREATE_PRODUCT', 'UPDATE_ORDER')
 * @param {Object} [params.details] - Additional details about the action
 * @param {string} [params.userId] - ID of the user who performed the action (optional for system actions)
 * @param {string} [params.ipAddress] - IP address of the user
 * @param {string} [params.userAgent] - User agent of the user
 * @returns {Promise<Object>} Created audit log entry
 */
export const createAuditLog = async ({
  action,
  details = {},
  userId,
  ipAddress,
  userAgent,
}: AuditLogParams) => {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        action,
        details,
        userId: userId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    return auditLog;
  } catch (error) {
    // Log error but don't throw - we don't want audit logging failures to break the app
    console.error("Failed to create audit log:", error);
    return null;
  }
};

/**
 * Get audit logs with filtering and pagination
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=20] - Items per page
 * @param {string} [params.action] - Filter by action
 * @param {string} [params.userId] - Filter by user ID
 * @param {Date} [params.startDate] - Filter by start date
 * @param {Date} [params.endDate] - Filter by end date
 * @returns {Promise<Object>} Audit logs with pagination
 */
export const getAuditLogs = async ({
  page = 1,
  limit = 20,
  action,
  userId,
  startDate,
  endDate,
}: AuditLogQuery) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (action) {
    where.action = action;
  }

  if (userId) {
    where.userId = userId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const [auditLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: auditLogs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export default {
  createAuditLog,
  getAuditLogs,
};
