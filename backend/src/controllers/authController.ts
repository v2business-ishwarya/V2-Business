import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import bcrypt from "bcryptjs";
import * as tokenService from "../services/tokenService";
import * as emailService from "../services/emailService";
import { z } from "zod";
import crypto from "crypto";

type GoogleProfile = {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
};

// Zod schemas for validation
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Password reset token expiry (1 hour)
const PASSWORD_RESET_TOKEN_EXPIRY = 3600000; // 1 hour in ms

// User update schema (allowed fields)
const userUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const parsedBody = registerSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }
    const { email, password, name } = parsedBody.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user.id);
    const refreshToken = tokenService.generateRefreshToken();
    await tokenService.storeRefreshToken(user.id, refreshToken);

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Email delivery must not undo an already-created account.
    emailService.sendWelcomeEmail(user).catch((emailError) => {
      console.error("Welcome email could not be sent", emailError);
    });

    // Return access token and user info (without password)
    res.status(201).json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedBody = loginSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }
    const { email, password } = parsedBody.data;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Validate password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user.id);
    const refreshToken = tokenService.generateRefreshToken();
    await tokenService.storeRefreshToken(user.id, refreshToken);

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Return access token and user info
    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token not provided" });
    }

    const payload = await tokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    const { userId } = payload;

    // Rotate refresh token for security
    const { newToken } = await tokenService.rotateRefreshToken(refreshToken);

    // Set new refresh token in httpOnly cookie
    res.cookie("refreshToken", newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Generate new access token
    const accessToken = tokenService.generateAccessToken(userId);

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await tokenService.removeRefreshToken(refreshToken);
    }
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal that email doesn't exist for security
      return res.status(200).json({ message: "If the email exists, a reset link has been sent" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY);

    // Save token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires: expires,
      },
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    next(error);
  }
};

// Reset password with token
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Find user by token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    next(error);
  }
};

export const googleRedirect = async (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const backendUrl = process.env.BACKEND_URL || "https://v2-business.onrender.com";
  const redirectUri = `${backendUrl}/auth/google/callback`;
  const frontendUrl = process.env.FRONTEND_URL || "https://v2business.in";

  if (!clientId) {
    return res.redirect(`${frontendUrl}/auth?error=google_not_configured`);
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;
  res.redirect(authUrl);
};

// Google OAuth callback
export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  const frontendUrl = process.env.FRONTEND_URL || "https://v2business.in";
  try {
    const code = req.query.code as string;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const backendUrl = process.env.BACKEND_URL || "https://v2-business.onrender.com";
    const redirectUri = `${backendUrl}/auth/google/callback`;

    let email = "";
    let name = "";
    let picture = "";
    let googleId = "";

    if (code && clientId && clientSecret) {
      // Exchange code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData: any = await tokenRes.json();
      if (tokenData.access_token) {
        // Fetch user profile from Google
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData: any = await userRes.json();
        email = userData.email;
        name = userData.name || userData.given_name || "";
        picture = userData.picture || "";
        googleId = userData.id || "";
      }
    } else {
      const userPayload = (req as any).user ?? {};
      email = userPayload.email;
      name = userPayload.name;
      picture = userPayload.picture;
      googleId = userPayload.sub;
    }

    if (!email) {
      return res.redirect(`${frontendUrl}/auth?error=google_auth_failed`);
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user from Google
      user = await prisma.user.create({
        data: {
          email,
          name: name || "",
          avatarUrl: picture || undefined,
          googleId,
          passwordHash: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        },
      });

      // Send welcome email
      await emailService.sendWelcomeEmail(user);
    } else if (!user.googleId && googleId) {
      // Link existing account to Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user.id);
    const refreshToken = tokenService.generateRefreshToken();
    await tokenService.storeRefreshToken(user.id, refreshToken);

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with auth credentials in URL
    const safeUserData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    res.redirect(
      `${frontendUrl}/auth?token=${encodeURIComponent(accessToken)}&user=${encodeURIComponent(
        JSON.stringify(safeUserData)
      )}`
    );
  } catch (error) {
    res.redirect(`${frontendUrl}/auth?error=google_auth_error`);
  }
};

// Get current user (protected)
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId; // Assuming auth middleware sets req.userId
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const becomeVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: "VENDOR" },
      select: { id: true, email: true, name: true, role: true },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Update user profile (name, email)
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    // Ensure user can only update their own profile
    if (id !== userId) {
      return res.status(403).json({ error: "Forbidden: can only update own profile" });
    }

    const parseResult = userUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }
    const data = parseResult.data;

    // If email is being changed, ensure it's unique
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== userId) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    // Remove password hash from response
    const { passwordHash, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
  googleRedirect,
  googleCallback,
  getMe,
  becomeVendor,
  updateUser,
};
