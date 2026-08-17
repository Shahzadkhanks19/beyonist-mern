/**
 * Mongoose model for site page. Defines persisted fields, validation rules, indexes, and defaults for this domain entity.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";

// Schema definition: validation/defaults here are the database-level safety net for this entity.
const chapterSchema = new mongoose.Schema({
  number: { type: String, trim: true },
  title: { type: String, trim: true },
  body: { type: String, trim: true },
}, { _id: false });

const sitePageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  eyebrow: { type: String, trim: true },
  title: { type: String, trim: true },
  intro: { type: String, trim: true },
  mission: { type: String, trim: true },
  belief: { type: String, trim: true },
  chapters: [chapterSchema],
  published: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export default mongoose.model("SitePage", sitePageSchema);
