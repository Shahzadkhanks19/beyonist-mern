/**
 * Mongoose model for post. Defines persisted fields, validation rules, indexes, and defaults for this domain entity.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";

// Schema definition: validation/defaults here are the database-level safety net for this entity.
const contentBlockSchema = new mongoose.Schema({
  id: { type: String, trim: true, maxlength: 80 },
  type: { type: String, enum: ["paragraph", "heading2", "heading3", "quote", "bullets", "numbered", "image", "divider"], required: true },
  text: { type: String, trim: true, maxlength: 12000, default: "" },
  items: { type: [String], default: undefined },
  url: { type: String, trim: true, maxlength: 1000, default: "" },
  alt: { type: String, trim: true, maxlength: 220, default: "" },
  caption: { type: String, trim: true, maxlength: 500, default: "" },
}, { _id: false });

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  excerpt: { type: String, required: true, trim: true, maxlength: 320 },
  content: { type: String, required: true, trim: true },
  contentBlocks: { type: [contentBlockSchema], default: [] },
  category: { type: String, required: true, trim: true, index: true },
  image: { type: String, required: true, trim: true },
  imageAlt: { type: String, trim: true, maxlength: 220, default: "" },
  author: { type: String, trim: true, maxlength: 120, default: "Beyonist Editorial" },
  tags: { type: [String], default: [] },
  seoTitle: { type: String, trim: true, maxlength: 70, default: "" },
  seoDescription: { type: String, trim: true, maxlength: 180, default: "" },
  readingTime: { type: Number, default: 4, min: 1 },
  featured: { type: Boolean, default: false, index: true },
  published: { type: Boolean, default: true, index: true },
  publishedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

postSchema.index({ title: "text", excerpt: "text", content: "text", category: "text" });

export default mongoose.model("Post", postSchema);
