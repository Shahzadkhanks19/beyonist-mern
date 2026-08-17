/**
 * Express router for post routes. Defines HTTP endpoints, authorization boundaries, validation, and orchestration for this API area.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Router } from "express";
import Post from "../models/Post.js";

const router = Router();
const POST_CARD_FIELDS = "slug title excerpt category image imageAlt author readingTime tags featured publishedAt createdAt seoTitle seoDescription";

// API: GET / — handles the router root request and returns a normalized JSON response.

router.get("/", async (req, res, next) => {
  try {
    const filter = { published: true };
    if (req.query.category) filter.category = String(req.query.category).trim().slice(0, 100);

    const posts = await Post.find(filter)
      .select(POST_CARD_FIELDS)
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
});

// API: GET /:slug — handles the slug request and returns a normalized JSON response.

router.get("/:slug", async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim().slice(0, 180);
    const post = await Post.findOne({ slug, published: true }).lean();
    if (!post) return res.status(404).json({ success: false, message: "Story not found" });

    const related = await Post.find({
      _id: { $ne: post._id },
      published: true,
    })
      .select(POST_CARD_FIELDS)
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .limit(3)
      .lean();

    return res.json({ success: true, data: post, related });
  } catch (error) {
    return next(error);
  }
});

export default router;
