import { Request, Response, NextFunction } from "express";

/**
 * Sanitize string inputs recursively to prevent XSS / script injections
 */
function sanitizeValue(value: any): any {
  if (typeof value === "string") {
    return value
      .replace(/<script\b[^<]*(?:(!<\/script>)<[^<]:)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/onerror\s*=/gi, "")
      .replace(/onload\s*=/gi, "");
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === "object") {
    const sanitizedObj: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      sanitizedObj[key] = sanitizeValue(value[key]);
    }
    return sanitizedObj;
  }
  return value;
}

export const xssSanitizer = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeValue(req.query);
  }
  next();
};

/**
 * Response interceptor to ensure sensitive internal fields are never leaked to clients
 */
const SENSITIVE_KEYS = new Set(["PasswordHash", "resetToken", "resetTokenExpires", "apiSecret", "webhookSecret"]);

function sanitizeResponsePayload(payload: any): any {
  if (Array.isArray(payload)) {
    return payload.map(sanitizeResponsePayload);
  }
  if (payload !== null && typeof payload === "object" && !(payload instanceof Date)) {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(payload)) {
      if (!SENSITIVE_KEYS.has(key)) {
        sanitized[key] = sanitizeResponsePayload(val);
      }
    }
    return sanitized;
  }
  return payload;
}

export const sensitiveDataFilter = (_req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    return originalJson(sanitizeResponsePayload(body));
  };
  next();
};
