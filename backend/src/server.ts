import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import authRouter from "./routes/auth";
import productRouter from "./routes/product";
import orderRouter from "./routes/order";
import cartRouter from "./routes/cart";
import wishlistRouter from "./routes/wishlist";
import reviewRouter from "./routes/review";
import couponRouter from "./routes/coupon";
import notificationRouter from "./routes/notification";
import adminRouter from "./routes/admin";
import paymentRouter from "./routes/payment";
import uploadRouter from "./routes/upload";
import searchRouter from "./routes/search";
import userRouter from "./routes/users";
import deliveryRouter from "./routes/delivery";
import invoiceRouter from "./routes/invoice";
import { apiLimiter, authLimiter } from "./middleware/rateLimit";
import { auditLogger } from "./middleware/auditMiddleware";

dotenv.config();

// Export prisma for use in other modules
export { prisma };

const app = express();
const PORT = process.env.PORT ?? 5000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:8080", credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Audit logging
app.use(auditLogger);

// Rate limiting
app.use("/api/auth", authLimiter);
app.use(apiLimiter);
app.use("/api/", apiLimiter);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/search", searchRouter);
app.use("/api/users", userRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/invoices", invoiceRouter);

// 404
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
