/**
 * Express router for lead routes. Defines HTTP endpoints, authorization boundaries, validation, and orchestration for this API area.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Router } from "express";
import Lead from "../models/Lead.js";

const router = Router();

// API: POST / — handles the router root request and returns a normalized JSON response.

router.post("/", async (req, res, next) => {
  try {
    // Honeypot: legitimate footer submissions leave this invisible field blank.
    if (String(req.body?.company || "").trim()) {
      return res.status(201).json({
        success: true,
        message: "You’re on the Beyonist Edit list.",
      });
    }

    const email = String(req.body?.email || "").trim().toLowerCase();
    const source = String(req.body?.source || "footer").trim();

    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 180) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const allowedSources = ["footer", "contact", "checkout", "manual"];
    const safeSource = allowedSources.includes(source) ? source : "footer";

    const existing = await Lead.findOne({ email });

    if (existing) {
      existing.status = "subscribed";
      existing.marketingConsent = true;
      existing.source = safeSource;
      existing.lastCapturedAt = new Date();
      existing.captureCount += 1;
      await existing.save();

      return res.json({
        success: true,
        duplicate: true,
        message: "You’re already on the list — we kept your subscription active.",
      });
    }

    await Lead.create({
      email,
      source: safeSource,
      status: "subscribed",
      marketingConsent: true,
    });

    return res.status(201).json({
      success: true,
      duplicate: false,
      message: "You’re on the Beyonist Edit list.",
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
