/**
 * Express router for commerce routes. Defines public pricing/settings endpoints and
 * checkout address assistance. Pricing and order validation remain server-authoritative.
 */

import { Router } from "express";
import { calculatePricing, getCommerceSettings, validateCoupon } from "../services/pricingService.js";
import { resolveCustomerSession } from "../services/customerSession.js";

const router = Router();
const PINCODE_TIMEOUT_MS = 4500;

router.get("/settings", async (_req, res, next) => {
  try {
    const settings = await getCommerceSettings();
    return res.json({
      success: true,
      data: {
        deliveryEnabled: settings.deliveryEnabled,
        standardDeliveryPrice: settings.standardDeliveryPrice,
        freeDeliveryEnabled: settings.freeDeliveryEnabled,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
        taxEnabled: settings.taxEnabled,
        taxRate: settings.taxRate,
        taxMode: settings.taxMode,
        currency: settings.currency,
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Address-assistance lookup. This does not replace checkout validation; it only
 * helps the customer fill district/city and state from a valid Indian PIN.
 */
router.get("/pincode/:postalCode", async (req, res, next) => {
  try {
    const postalCode = String(req.params.postalCode || "").replace(/\D/g, "").slice(0, 6);
    if (!/^\d{6}$/.test(postalCode)) {
      return res.status(400).json({ success: false, code: "INVALID_PINCODE", message: "Enter a valid 6-digit PIN code." });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PINCODE_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response?.ok) {
      return res.status(404).json({ success: false, code: "PINCODE_NOT_FOUND", message: "We could not locate that PIN code. Enter city and state manually." });
    }

    const payload = await response.json().catch(() => null);
    const result = Array.isArray(payload) ? payload[0] : null;
    const offices = Array.isArray(result?.PostOffice) ? result.PostOffice : [];
    const usable = offices.find((office) => office?.District && office?.State) || offices[0];

    if (String(result?.Status || "").toLowerCase() !== "success" || !usable?.District || !usable?.State) {
      return res.status(404).json({ success: false, code: "PINCODE_NOT_FOUND", message: "We could not locate that PIN code. Enter city and state manually." });
    }

    return res.json({
      success: true,
      data: {
        postalCode,
        city: String(usable.District).trim(),
        district: String(usable.District).trim(),
        state: String(usable.State).trim(),
        postOffice: String(usable.Name || "").trim(),
      },
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      return res.status(504).json({ success: false, code: "PINCODE_LOOKUP_TIMEOUT", message: "PIN lookup took too long. Enter city and state manually." });
    }
    return next(error);
  }
});

router.post("/quote", async (req, res, next) => {
  try {
    const rawSubtotal = Number(req.body?.subtotal);
    if (!Number.isFinite(rawSubtotal) || rawSubtotal < 0 || rawSubtotal > 10_000_000) {
      return res.status(400).json({ success: false, code: "INVALID_SUBTOTAL", message: "Invalid cart subtotal." });
    }

    const subtotal = rawSubtotal;
    const code = String(req.body?.couponCode || "").trim().toUpperCase().slice(0, 60);
    const signedIn = await resolveCustomerSession(req, { touch: false });
    const settings = await getCommerceSettings();

    let coupon = { valid: false, coupon: null, discountAmount: 0, message: "" };
    if (code) {
      coupon = await validateCoupon({ code, subtotal, customerAccount: signedIn?.customer?._id || null });
    }

    const pricing = calculatePricing({ subtotal, settings, discountAmount: coupon.valid ? coupon.discountAmount : 0 });

    return res.json({
      success: true,
      data: {
        ...pricing,
        coupon: code ? {
          code: coupon.coupon?.code || code,
          valid: coupon.valid,
          message: coupon.message,
          discountType: coupon.coupon?.discountType || null,
          value: coupon.coupon?.value || null,
        } : null,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
