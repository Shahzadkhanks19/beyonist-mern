/**
 * Mongoose model for order. Defines persisted fields, validation rules, indexes, and defaults for this domain entity.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";

// Schema definition: validation/defaults here are the database-level safety net for this entity.
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  slug: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  image: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const addressSchema = new mongoose.Schema({
  addressLine1: { type: String, required: true, trim: true, maxlength: 180 },
  addressLine2: { type: String, trim: true, maxlength: 180, default: "" },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  postalCode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
  country: { type: String, default: "India", trim: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
  invoiceNumber: { type: String, unique: true, sparse: true, index: true, uppercase: true, trim: true, default: undefined },
  invoiceIssuedAt: { type: Date, default: null },
  customerAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null, index: true },
  customer: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
  },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  shippingAddress: { type: addressSchema, required: true },
  items: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, "Order requires at least one item"] },
  note: { type: String, trim: true, maxlength: 1000, default: "" },

  subtotal: { type: Number, required: true, min: 0 },
  couponCode: { type: String, uppercase: true, trim: true, default: "" },
  discountAmount: { type: Number, min: 0, default: 0 },
  discountedSubtotal: { type: Number, min: 0, default: 0 },

  taxEnabled: { type: Boolean, default: false },
  taxRate: { type: Number, min: 0, default: 0 },
  taxMode: { type: String, enum: ["inclusive", "exclusive"], default: "inclusive" },
  taxableAmount: { type: Number, min: 0, default: 0 },
  taxAmount: { type: Number, min: 0, default: 0 },

  shippingAmount: { type: Number, required: true, min: 0, default: 0 },
  freeDeliveryThreshold: { type: Number, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 },

  status: {
    type: String,
    enum: ["placed", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"],
    default: "placed",
    index: true,
  },
  paymentMethod: { type: String, enum: ["cod", "online"], required: true },
  paymentStatus: { type: String, enum: ["pending", "cod_pending", "paid", "failed", "refunded"], required: true },
  paymentReference: { type: String, trim: true, default: "" },
  trackingNumber: { type: String, trim: true, default: "" },
  courier: { type: String, trim: true, default: "" },
  confirmationEmailSentAt: { type: Date, default: null },
  lastStatusEmailSentAt: { type: Date, default: null },
  reviewAccessTokenHash: { type: String, select: false, default: "" },
  reviewAccessExpiresAt: { type: Date, default: null },
}, { timestamps: true });

orderSchema.index({ orderNumber: 1, email: 1 });
orderSchema.index({ customerAccount: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1, status: 1 });

export default mongoose.model("Order", orderSchema);
