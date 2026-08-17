/**
 * Mongoose model for admin. Defines persisted fields, validation rules, indexes, and defaults for this domain entity.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";

// Schema definition: validation/defaults here are the database-level safety net for this entity.
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true, maxlength: 180 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["super_admin", "admin"], default: "super_admin", index: true },
  isActive: { type: Boolean, default: true, index: true },
  failedLoginAttempts: { type: Number, default: 0, min: 0 },
  lockedUntil: { type: Date, default: null },
  lastLoginAt: { type: Date, default: null },
  passwordChangedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema);
