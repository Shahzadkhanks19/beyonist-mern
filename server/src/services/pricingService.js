/**
 * Server service for pricing service. Encapsulates reusable business/security logic outside route handlers.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import Coupon from "../models/Coupon.js";
import StoreSettings from "../models/StoreSettings.js";

/**
 * Implements the money round operation used by this module.
 */
const moneyRound = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

/**
 * Loads commerce settings data for the current flow.
 */
export async function getCommerceSettings() {
  let settings = await StoreSettings.findOne({ key: "commerce" });

  // Migration safety:
  // If a StoreSettings document was created before the singleton `key`
  // field existed, reuse that document instead of creating a conflicting one.
  if (!settings) {
    const legacy = await StoreSettings.findOne({
      $or: [
        { key: { $exists: false } },
        { key: null },
        { key: "" },
      ],
    });

    if (legacy) {
      legacy.key = "commerce";
      settings = await legacy.save();
    }
  }

  if (!settings) {
    try {
      settings = await StoreSettings.create({ key: "commerce" });
    } catch (error) {
      // Handles the rare case where two first requests create the singleton
      // at the same time.
      if (error?.code === 11000) {
        settings = await StoreSettings.findOne({ key: "commerce" });
      } else {
        throw error;
      }
    }
  }

  if (!settings) {
    throw new Error("Commerce settings could not be initialised.");
  }

  return settings;
}

/**
 * Validates coupon and returns a normalized result for downstream logic.
 */
export async function validateCoupon({ code, subtotal, customerAccount = null }) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return { valid: false, coupon: null, discountAmount: 0, message: "" };

  const coupon = await Coupon.findOne({ code: normalized });
  if (!coupon || !coupon.isActive) {
    return { valid: false, coupon: null, discountAmount: 0, message: "This coupon is not valid." };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, coupon: null, discountAmount: 0, message: "This coupon is not active yet." };
  }
  if (coupon.endsAt && coupon.endsAt < now) {
    return { valid: false, coupon: null, discountAmount: 0, message: "This coupon has expired." };
  }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, coupon: null, discountAmount: 0, message: "This coupon has reached its usage limit." };
  }
  if (coupon.membersOnly && !customerAccount) {
    return { valid: false, coupon: null, discountAmount: 0, message: "This coupon is available to signed-in customers only." };
  }
  if (subtotal < coupon.minimumSubtotal) {
    return {
      valid: false,
      coupon: null,
      discountAmount: 0,
      message: `Spend ₹${coupon.minimumSubtotal.toLocaleString("en-IN")} or more to use this coupon.`,
    };
  }

  let discountAmount = coupon.discountType === "percentage"
    ? subtotal * (coupon.value / 100)
    : coupon.value;

  if (coupon.maximumDiscount) discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
  discountAmount = moneyRound(Math.min(discountAmount, subtotal));

  return { valid: true, coupon, discountAmount, message: "Coupon applied." };
}

/**
 * Implements the calculate pricing operation used by this module.
 */
export function calculatePricing({ subtotal, settings, discountAmount = 0 }) {
  const safeSubtotal = moneyRound(Math.max(Number(subtotal) || 0, 0));
  const safeDiscount = moneyRound(Math.min(Math.max(Number(discountAmount) || 0, 0), safeSubtotal));
  const discountedSubtotal = moneyRound(safeSubtotal - safeDiscount);

  const shippingAmount = settings.deliveryEnabled
    ? (settings.freeDeliveryEnabled && discountedSubtotal >= settings.freeDeliveryThreshold
        ? 0
        : moneyRound(settings.standardDeliveryPrice))
    : 0;

  let taxableAmount = discountedSubtotal;
  let taxAmount = 0;
  const taxRate = settings.taxEnabled ? Number(settings.taxRate || 0) : 0;

  if (settings.taxEnabled && taxRate > 0) {
    if (settings.taxMode === "inclusive") {
      taxAmount = moneyRound(discountedSubtotal * (taxRate / (100 + taxRate)));
      taxableAmount = moneyRound(discountedSubtotal - taxAmount);
    } else {
      taxableAmount = discountedSubtotal;
      taxAmount = moneyRound(discountedSubtotal * (taxRate / 100));
    }
  }

  const total = moneyRound(
    discountedSubtotal +
    shippingAmount +
    (settings.taxEnabled && settings.taxMode === "exclusive" ? taxAmount : 0)
  );

  return {
    subtotal: safeSubtotal,
    discountAmount: safeDiscount,
    discountedSubtotal,
    shippingAmount,
    taxEnabled: Boolean(settings.taxEnabled),
    taxRate,
    taxMode: settings.taxMode,
    taxableAmount,
    taxAmount,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
    total,
  };
}

/**
 * Implements the reserve coupon usage operation used by this module.
 */
export async function reserveCouponUsage(coupon) {
  if (!coupon) return null;

  const now = new Date();
  const filter = {
    _id: coupon._id,
    isActive: true,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  };

  if (coupon.usageLimit) {
    filter.usageCount = { $lt: coupon.usageLimit };
  }

  return Coupon.findOneAndUpdate(
    filter,
    { $inc: { usageCount: 1 } },
    { returnDocument: "after" }
  );
}

/**
 * Implements the release coupon usage operation used by this module.
 */
export async function releaseCouponUsage(couponId) {
  if (!couponId) return;
  await Coupon.updateOne(
    { _id: couponId, usageCount: { $gt: 0 } },
    { $inc: { usageCount: -1 } }
  );
}
