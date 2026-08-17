/**
 * Express router for site page routes. Defines HTTP endpoints, authorization boundaries, validation, and orchestration for this API area.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Router } from "express";
import SitePage from "../models/SitePage.js";

const router = Router();

// API: GET /:slug — handles the slug request and returns a normalized JSON response.

router.get("/:slug", async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim().slice(0, 180);
    const page = await SitePage.findOne({ slug, published: true }).lean();
    if (!page) return res.status(404).json({ success: false, message: "Page content not found" });
    return res.json({ success: true, data: page });
  } catch (error) {
    return next(error);
  }
});

export default router;
