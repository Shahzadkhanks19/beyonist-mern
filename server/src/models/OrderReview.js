/** Overall delivered-order review submitted by a verified buyer. */
import mongoose from "mongoose";

const orderReviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
  orderNumber: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
  displayName: { type: String, required: true, trim: true, maxlength: 100 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true, maxlength: 120, default: "" },
  body: { type: String, required: true, trim: true, minlength: 10, maxlength: 1500 },
  source: { type: String, enum: ["website", "email", "google"], default: "website" },
  verifiedPurchase: { type: Boolean, default: true },
  status: { type: String, enum: ["pending", "published", "rejected"], default: "pending", index: true },
}, { timestamps: true });

export default mongoose.model("OrderReview", orderReviewSchema);
