/**
 * Mongoose model for product review. Defines persisted fields, validation rules, indexes, and defaults for this domain entity.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";

// Schema definition: validation/defaults here are the database-level safety net for this entity.
const productReviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  productSlug: { type: String, required: true, trim: true, index: true },
  productName: { type: String, required: true, trim: true },
  productImage: { type: String, trim: true, default: "" },
  orderNumber: { type: String, required: true, trim: true, uppercase: true },
  displayName: { type: String, required: true, trim: true, maxlength: 100 },
  source: { type: String, enum: ["website", "email", "google"], default: "website" },
  verifiedPurchase: { type: Boolean, default: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true, maxlength: 120, default: "" },
  body: { type: String, required: true, trim: true, minlength: 10, maxlength: 1500 },
  status: { type: String, enum: ["pending", "published", "rejected"], default: "pending", index: true },
}, { timestamps: true });

productReviewSchema.index({ orderNumber: 1, productSlug: 1 }, { unique: true });

export default mongoose.model("ProductReview", productReviewSchema);
