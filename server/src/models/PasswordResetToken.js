/**
 * Mongoose model for password reset token. Defines persisted fields, validation rules, indexes, and defaults for this domain entity.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";

// Schema definition: validation/defaults here are the database-level safety net for this entity.
const passwordResetTokenSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  usedAt: { type: Date, default: null },
}, { timestamps: true });

passwordResetTokenSchema.index({ customer: 1, createdAt: -1 });

export default mongoose.model("PasswordResetToken", passwordResetTokenSchema);
