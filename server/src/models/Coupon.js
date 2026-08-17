/**
 * Mongoose model for coupon. Defines persisted fields, validation rules, indexes, and defaults for this domain entity.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";

// Schema definition: validation/defaults here are the database-level safety net for this entity.
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true, maxlength: 40 },
  description: { type: String, trim: true, maxlength: 220, default: "" },
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  value: { type: Number, required: true, min: 0 },
  minimumSubtotal: { type: Number, default: 0, min: 0 },
  maximumDiscount: { type: Number, default: null, min: 0 },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  usageLimit: { type: Number, default: null, min: 1 },
  usageCount: { type: Number, default: 0, min: 0 },
  membersOnly: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

couponSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

export default mongoose.model("Coupon", couponSchema);
