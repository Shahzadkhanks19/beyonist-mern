/**
 * Mongoose model for contact message. Defines persisted fields, validation rules, indexes, and defaults for this domain entity.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";

// Schema definition: validation/defaults here are the database-level safety net for this entity.
const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
  phone: { type: String, trim: true, maxlength: 30, default: "" },
  topic: {
    type: String,
    required: true,
    enum: ["Product enquiry", "Order support", "Returns & refunds", "Stockist / business", "General enquiry"],
  },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ["new", "read", "replied", "closed"], default: "new", index: true },
}, { timestamps: true });

contactMessageSchema.index({ createdAt: -1, status: 1 });

export default mongoose.model("ContactMessage", contactMessageSchema);
