import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import { prisma } from "../server";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "fallback_access_secret";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret";
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/**
 * Parse strings like '7d', '15m' to milliseconds
 */
function parseMs(str: string): number {
  const match = str.match(/^(\d+)([smhdw])$/);
  if (!match) return 1000 * 60 * 60 * 24 * 7; // default 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "w":
      return value * 7 * 24 * 60 * 60 * 1000;
    default:
      return value * 1000;
  }
}

/**
 * Generate signed JWT access token
 */
export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET as Secret, {
    expiresIn: ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"],
  });
};

/**
 * Verify access token and return payload
 */
export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

/**
 * Generate a random refresh token string (high entropy)
 */
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString("hex");
};

/**
 * Hash refresh token for storage
 */
export const hashRefreshToken = async (token: string): Promise<string> => {
  return bcrypt.hash(token, 10);
};

/**
 * Store hashed refresh token linked to user
 */
export const storeRefreshToken = async (userId: string, token: string) => {
  const hashed = await hashRefreshToken(token);
  const expiresAt = new Date(Date.now() + parseMs(REFRESH_TOKEN_EXPIRY));

  await prisma.refreshToken.create({
    data: {
      token: hashed,
      userId,
      expiresAt,
    },
  });
};

/**
 * Find and validate a refresh token; returns userId if valid & not expired
 */
export const verifyRefreshToken = async (token: string): Promise<{ userId: string } | null> => {
  const hashed = await hashRefreshToken(token);

  const stored = await prisma.refreshToken.findFirst({
    where: {
      token: hashed,
      revoked: false,
    },
    include: {
      user: true,
    },
  });

  if (!stored) return null;

  const now = new Date();
  if (stored.expiresAt < now) {
    // Optionally revoke expired token
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });
    return null;
  }

  return { userId: stored.userId };
};

/**
 * Rotate refresh token: mark old as used, create new
 */
export const rotateRefreshToken = async (token: string) => {
  const hashed = await hashRefreshToken(token);
  const existing = await prisma.refreshToken.findFirst({
    where: {
      token: hashed,
      revoked: false,
    },
    include: {
      user: true,
    },
  });

  if (!existing) throw new Error("Invalid refresh token");

  // Mark as used (revoked)
  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revoked: true },
  });

  // Generate new token
  const newToken = generateRefreshToken();
  await storeRefreshToken(existing.userId, newToken);

  return { newToken, userId: existing.userId };
};

/**
 * Remove refresh token (logout)
 */
export const removeRefreshToken = async (token: string) => {
  const hashed = await hashRefreshToken(token);
  await prisma.refreshToken.updateMany({
    where: { token: hashed },
    data: { revoked: true },
  });
};

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
export const revokeRefreshTokensForUser = async (userId: string) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
};

export default {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  rotateRefreshToken,
  removeRefreshToken,
  revokeRefreshTokensForUser,
};
