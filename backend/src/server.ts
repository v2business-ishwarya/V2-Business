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
import categoryRouter from "./routes/category";
import { apiLimiter, authLimiter } from "./middleware/rateLimit";
import { auditLogger } from "./middleware/auditMiddleware";

dotenv.config();

// Export prisma for use in other modules
export { prisma };

const app = express();
const PORT = process.env.PORT ?? 5000;

// Middleware
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map(o => o.trim()) : ["*"];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }
      return callback(null, origin); // Allow all Vercel previews & custom domains dynamically
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(cookieParser());

// Audit logging
app.use(auditLogger);

// Rate limiting
app.use("/api/auth", authLimiter);
app.use("/auth", authLimiter);
app.use(apiLimiter);

// Health check
const healthHandler = (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
};
app.get("/api/health", healthHandler);
app.get("/health", healthHandler);
app.get("/", healthHandler);

// Mount routes on both /api/* and /* for maximum compatibility
const routeModules = [
  { path: "auth", router: authRouter },
  { path: "products", router: productRouter },
  { path: "orders", router: orderRouter },
  { path: "cart", router: cartRouter },
  { path: "wishlist", router: wishlistRouter },
  { path: "reviews", router: reviewRouter },
  { path: "coupons", router: couponRouter },
  { path: "notifications", router: notificationRouter },
  { path: "admin", router: adminRouter },
  { path: "payment", router: paymentRouter },
  { path: "upload", router: uploadRouter },
  { path: "search", router: searchRouter },
  { path: "users", router: userRouter },
  { path: "delivery", router: deliveryRouter },
  { path: "invoices", router: invoiceRouter },
  { path: "categories", router: categoryRouter },
];

routeModules.forEach(({ path, router }) => {
  app.use(`/api/${path}`, router);
  app.use(`/${path}`, router);
});

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
