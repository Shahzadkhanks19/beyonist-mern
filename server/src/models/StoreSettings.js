/**
 * Mongoose model for store settings. Defines persisted fields, validation rules, indexes, and defaults for this domain entity.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";

// Schema definition: validation/defaults here are the database-level safety net for this entity.
const storeSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: "commerce",
    trim: true,
  },

  deliveryEnabled: { type: Boolean, default: true },
  standardDeliveryPrice: { type: Number, default: 79, min: 0 },
  freeDeliveryEnabled: { type: Boolean, default: true },
  freeDeliveryThreshold: { type: Number, default: 999, min: 0 },

  taxEnabled: { type: Boolean, default: false },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  taxMode: {
    type: String,
    enum: ["inclusive", "exclusive"],
    default: "inclusive",
  },

  currency: {
    type: String,
    default: "INR",
    enum: ["INR"],
  },
}, {
  timestamps: true,
  strict: true,
});

export default mongoose.model("StoreSettings", storeSettingsSchema);
