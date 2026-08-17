/**
 * Express router for commerce routes. Defines HTTP endpoints, authorization boundaries, validation, and orchestration for this API area.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Router } from "express";
import { calculatePricing, getCommerceSettings, validateCoupon } from "../services/pricingService.js";
import { resolveCustomerSession } from "../services/customerSession.js";

const router = Router();

// API: GET /settings — handles the settings request and returns a normalized JSON response.

router.get("/settings", async (_req, res, next) => {
  try {
    const settings = await getCommerceSettings();
    res.json({
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
    next(error);
  }
});

// API: POST /quote — handles the quote request and returns a normalized JSON response.

router.post("/quote", async (req, res, next) => {
  try {
    const subtotal = Math.max(Number(req.body?.subtotal) || 0, 0);
    const code = String(req.body?.couponCode || "").trim();
    const signedIn = await resolveCustomerSession(req, { touch: false });
    const settings = await getCommerceSettings();

    let coupon = { valid: false, coupon: null, discountAmount: 0, message: "" };
    if (code) {
      coupon = await validateCoupon({
        code,
        subtotal,
        customerAccount: signedIn?.customer?._id || null,
      });
    }

    const pricing = calculatePricing({
      subtotal,
      settings,
      discountAmount: coupon.valid ? coupon.discountAmount : 0,
    });

    res.json({
      success: true,
      data: {
        ...pricing,
        coupon: code ? {
          code: coupon.coupon?.code || code.toUpperCase(),
          valid: coupon.valid,
          message: coupon.message,
          discountType: coupon.coupon?.discountType || null,
          value: coupon.coupon?.value || null,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
