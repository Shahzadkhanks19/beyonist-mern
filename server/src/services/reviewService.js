/** Shared review, moderation, rating, and email-invitation helpers. */
import crypto from "node:crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ProductReview from "../models/ProductReview.js";

export function reviewDisplayName(name = "Customer") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Verified customer";
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts.at(-1)[0]}.`;
}

export function hashReviewToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

export async function ensureReviewInvitation(order) {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  order.reviewAccessTokenHash = hashReviewToken(rawToken);
  order.reviewAccessExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  await order.save();
  return rawToken;
}

export async function resolveReviewInvitation(orderNumber, rawToken) {
  const order = await Order.findOne({ orderNumber: String(orderNumber || "").trim().toUpperCase(), status: "delivered" })
    .select("+reviewAccessTokenHash");
  if (!order || !order.reviewAccessTokenHash || !order.reviewAccessExpiresAt || order.reviewAccessExpiresAt <= new Date()) return null;
  const supplied = Buffer.from(hashReviewToken(rawToken));
  const stored = Buffer.from(order.reviewAccessTokenHash);
  if (supplied.length !== stored.length || !crypto.timingSafeEqual(supplied, stored)) return null;
  return order;
}

export async function recalculateProductRating(productId) {
  const stats = await ProductReview.aggregate([
    { $match: { product: productId, status: "published" } },
    { $group: { _id: null, rating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Product.updateOne(
    { _id: productId },
    { $set: { rating: stats[0]?.rating || 0, reviewCount: stats[0]?.count || 0 } },
  );
}
