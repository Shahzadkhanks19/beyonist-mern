/**
 * Express router for contact routes. Defines HTTP endpoints, authorization boundaries, validation, and orchestration for this API area.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Router } from "express";
import ContactMessage from "../models/ContactMessage.js";

const router = Router();

// API: POST / — handles the router root request and returns a normalized JSON response.

router.post("/", async (req, res, next) => {
  try {
    if (String(req.body?.company || "").trim()) {
      return res.status(201).json({ success: true, message: "Thanks — your note has reached Beyonist." });
    }

    const name = String(req.body?.name || "").trim().slice(0, 100);
    const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 180);
    const phone = String(req.body?.phone || "").trim().slice(0, 30);
    const topic = String(req.body?.topic || "General enquiry").trim().slice(0, 80);
    const message = String(req.body?.message || "").trim().slice(0, 3000);

    if (name.length < 2) return res.status(400).json({ success: false, message: "Please enter your name." });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    if (message.length < 10) return res.status(400).json({ success: false, message: "Please add a little more detail to your message." });

    const allowedTopics = ["Product enquiry", "Order support", "Returns & refunds", "Stockist / business", "General enquiry"];
    if (!allowedTopics.includes(topic)) return res.status(400).json({ success: false, message: "Please choose a valid enquiry topic." });

    await ContactMessage.create({ name, email, phone, topic, message });

    return res.status(201).json({
      success: true,
      message: "Thanks — your note has reached Beyonist.",
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
