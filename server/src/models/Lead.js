/**
 * Mongoose model for lead. Defines persisted fields, validation rules, indexes, and defaults for this domain entity.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";

// Schema definition: validation/defaults here are the database-level safety net for this entity.
const leadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
    maxlength: 180,
  },
  source: {
    type: String,
    enum: ["footer", "contact", "checkout", "manual"],
    default: "footer",
    index: true,
  },
  status: {
    type: String,
    enum: ["subscribed", "unsubscribed"],
    default: "subscribed",
    index: true,
  },
  marketingConsent: {
    type: Boolean,
    default: true,
  },
  firstCapturedAt: {
    type: Date,
    default: Date.now,
  },
  lastCapturedAt: {
    type: Date,
    default: Date.now,
  },
  captureCount: {
    type: Number,
    default: 1,
    min: 1,
  },
}, { timestamps: true });

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ source: 1, createdAt: -1 });

export default mongoose.model("Lead", leadSchema);
