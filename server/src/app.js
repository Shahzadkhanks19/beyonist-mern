/**
 * Express application factory. Registers global middleware, API routers, health handling, and final error responses.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import sitePageRoutes from "./routes/sitePageRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminManagementRoutes from "./routes/adminManagementRoutes.js";
import commerceRoutes from "./routes/commerceRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import {
  corsOptions,
  createRateLimiter,
  rejectUnsafeInput,
  requireJsonBody,
  requireTrustedOrigin,
  securityHeaders,
} from "./middleware/security.js";

const app = express();

app.disable("x-powered-by");
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(securityHeaders);
app.use(cors(corsOptions()));
app.use(express.json({ limit: "64kb", strict: true }));
app.use(requireJsonBody);
app.use(rejectUnsafeInput);
app.use(requireTrustedOrigin);

const publicLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 300, prefix: "public" });
const customerAuthLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 25, prefix: "customer-auth" });
const adminAuthLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 12, prefix: "admin-auth" });
const resetLimiter = createRateLimiter({ windowMs: 30 * 60 * 1000, max: 6, prefix: "password-reset" });
const contactLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 6, prefix: "contact" });
const leadLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 10, prefix: "lead" });
const orderLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 12, prefix: "order-create" });
const trackLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, prefix: "order-track" });

app.use("/api", publicLimiter);
app.use("/api/auth/login", customerAuthLimiter);
app.use("/api/auth/signup", customerAuthLimiter);
app.use("/api/auth/forgot-password", resetLimiter);
app.use("/api/auth/reset-password", resetLimiter);
app.use("/api/admin/auth/login", adminAuthLimiter);
app.use("/api/admin/auth/forgot-password", resetLimiter);
app.use("/api/admin/auth/reset-password", resetLimiter);
app.use("/api/contact", contactLimiter);
app.use("/api/leads", leadLimiter);
app.use("/api/orders/track", trackLimiter);
app.post("/api/orders", orderLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, service: "beyonist-api" });
});

app.use("/api/products", productRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/site-pages", sitePageRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/commerce", commerceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminManagementRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, code: "NOT_FOUND", message: "Route not found" });
});

app.use((error, req, res, _next) => {
  const requestId = String(req.headers["x-request-id"] || "").slice(0, 100);
  console.error(`[server] ${req.method} ${req.originalUrl}${requestId ? ` request=${requestId}` : ""}`, error?.stack || error);

  if (error?.type === "entity.too.large") {
    return res.status(413).json({ success: false, code: "PAYLOAD_TOO_LARGE", message: "The request is too large." });
  }

  if (error instanceof SyntaxError && error?.status === 400 && "body" in error) {
    return res.status(400).json({ success: false, code: "INVALID_JSON", message: "The request body contains invalid JSON." });
  }

  if (error?.name === "ValidationError") {
    const message = Object.values(error.errors || {})
      .map((entry) => entry.message)
      .filter(Boolean)
      .join(" ");

    return res.status(400).json({ success: false, code: "VALIDATION_ERROR", message: message || "The submitted values are invalid." });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({ success: false, code: "INVALID_VALUE", message: "One of the submitted values is invalid." });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ success: false, code: "DUPLICATE_VALUE", message: "That value already exists." });
  }

  return res.status(500).json({
    success: false,
    code: "SERVER_ERROR",
    message: process.env.NODE_ENV === "production" ? "Something went wrong on the server." : error?.message || "Something went wrong on the server.",
  });
});

export default app;
