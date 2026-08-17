/**
 * Mongoose model for product. Defines persisted fields, validation rules, indexes, and defaults for this domain entity.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";

// Schema definition: validation/defaults here are the database-level safety net for this entity.
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  shortDescription: { type: String, trim: true, maxlength: 220 },
  description: { type: String, required: true, trim: true },
  ingredients: [{ type: String, trim: true }],
  howToUse: [{ type: String, trim: true }],
  benefits: [{ type: String, trim: true }],
  cautions: [{ type: String, trim: true }],
  category: { type: String, required: true, trim: true, index: true },
  concern: { type: String, trim: true, index: true },
  price: { type: Number, required: true, min: 0, index: true },
  compareAtPrice: { type: Number, min: 0 },
  images: [{ type: String, trim: true }],
  stock: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5, index: true },
  reviewCount: { type: Number, default: 0, min: 0 },
  badge: { type: String, trim: true, maxlength: 50 },
  tags: [{ type: String, trim: true, lowercase: true }],
  isActive: { type: Boolean, default: true, index: true },
  isFeatured: { type: Boolean, default: false, index: true },
  featuredOrder: { type: Number, default: 999, min: 0 },
}, { timestamps: true });

productSchema.index({ name: "text", shortDescription: "text", description: "text", tags: "text" });
productSchema.index({ isActive: 1, category: 1, concern: 1, price: 1 });

export default mongoose.model("Product", productSchema);
