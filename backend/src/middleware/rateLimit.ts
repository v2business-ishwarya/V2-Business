import rateLimit from "express-rate-limit";

// Helper to reliably extract the client's real IP address behind reverse proxies (Render, Cloudflare, Nginx)
const getClientIp = (req: any): string => {
  const cfIp = req.headers["cf-connecting-ip"];
  if (cfIp) return (Array.isArray(cfIp) ? cfIp[0] : cfIp).trim();
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const list = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return list.split(",")[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (realIp) return (Array.isArray(realIp) ? realIp[0] : realIp).trim();
  return req.ip || req.socket?.remoteAddress || "127.0.0.1";
};

/**
 * General API limiter (applies to all endpoints)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Generous: limit each IP to 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  skip: (req) => req.method === "OPTIONS",
  validate: { xForwardedForHeader: false },
  message: { error: "Too many requests, please try again later." },
});

/**
 * Stricter limiter for auth login/register endpoints (protects brute force while permitting legitimate users)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 auth attempts per 15 minutes per unique IP
  skipSuccessfulRequests: true, // Successful login/signup never penalizes the user!
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  skip: (req) => req.method === "OPTIONS",
  validate: { xForwardedForHeader: false },
  message: { error: "Too many authentication attempts, please try again later." },
});

/**
 * Limiter for password reset requests (prevents email bombing)
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // max 20 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  skip: (req) => req.method === "OPTIONS",
  validate: { xForwardedForHeader: false },
  message: { error: "Too many password reset attempts, please try again in 1 hour." },
});
