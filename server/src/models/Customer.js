/**
 * Mongoose model for customer. Defines persisted fields, validation rules, indexes, and defaults for this domain entity.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";

// Schema definition: validation/defaults here are the database-level safety net for this entity.
const savedAddressSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 40 },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 10 },
  addressLine1: { type: String, required: true, trim: true, maxlength: 180 },
  addressLine2: { type: String, trim: true, maxlength: 180, default: "" },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  postalCode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
  country: { type: String, default: "India", trim: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true, maxlength: 180 },
  previousEmails: [{ type: String, lowercase: true, trim: true }],
  phone: { type: String, required: true, trim: true, maxlength: 10 },
  passwordHash: { type: String, required: true, select: false },
  addresses: { type: [savedAddressSchema], default: [] },
  wishlist: { type: [String], default: [], validate: [(items) => items.length <= 100, "Wishlist can contain up to 100 products."] },
  membershipTier: { type: String, enum: ["member"], default: "member" },
  offerAccess: { type: Boolean, default: true },
  discountAccess: { type: Boolean, default: true },
  rewardPoints: { type: Number, default: 0, min: 0 },
  marketingOptIn: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, index: true },
  failedLoginAttempts: { type: Number, default: 0, min: 0 },
  lockedUntil: { type: Date, default: null },
  lastLoginAt: { type: Date, default: null },
  passwordChangedAt: { type: Date, default: null },
}, { timestamps: true });

customerSchema.index({ previousEmails: 1 });

export default mongoose.model("Customer", customerSchema);
