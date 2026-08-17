/**
 * Express router for order routes. Defines HTTP endpoints, authorization boundaries, validation, and orchestration for this API area.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Router } from "express";
import crypto from "node:crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { resolveCustomerSession } from "../services/customerSession.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";
import { calculatePricing, getCommerceSettings, releaseCouponUsage, reserveCouponUsage, validateCoupon } from "../services/pricingService.js";
import { emitAdmin } from "../services/realtime.js";

const router = Router();

/**
 * Builds order number from normalized inputs.
 */
function makeOrderNumber() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const token = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `BEY-${date}-${token}`;
}

// API: POST / — handles the router root request and returns a normalized JSON response.

router.post("/", async (req, res, next) => {
  try {
    const customer = req.body?.customer || {};
    const shippingAddress = req.body?.shippingAddress || {};
    const requestedItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const paymentMethod = String(req.body?.paymentMethod || "").trim();

    const name = String(customer.name || "").trim();
    const email = String(customer.email || "").trim().toLowerCase();
    const phone = String(customer.phone || "").replace(/\D/g, "").slice(-10);

    if (name.length < 2) return res.status(400).json({ success: false, message: "Please enter your full name." });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ success: false, message: "Please enter a valid Indian mobile number." });
    if (!requestedItems.length) return res.status(400).json({ success: false, message: "Your cart is empty." });
    if (requestedItems.length > 50) return res.status(400).json({ success: false, code: "CART_TOO_LARGE", message: "Your cart contains too many line items." });

    if (paymentMethod === "online") {
      return res.status(501).json({
        success: false,
        code: "PAYMENT_GATEWAY_NOT_CONFIGURED",
        message: "Online payment is not available until a live payment gateway is configured.",
      });
    }

    if (paymentMethod !== "cod") {
      return res.status(400).json({ success: false, message: "Please choose a valid payment method." });
    }

    const addressLine1 = String(shippingAddress.addressLine1 || "").trim();
    const city = String(shippingAddress.city || "").trim();
    const state = String(shippingAddress.state || "").trim();
    const postalCode = String(shippingAddress.postalCode || "").trim();

    if (addressLine1.length < 5 || city.length < 2 || !state || !/^\d{6}$/.test(postalCode)) {
      return res.status(400).json({ success: false, message: "Please complete the delivery address." });
    }

    const slugs = [...new Set(requestedItems.map((item) => String(item.slug || "").trim()).filter(Boolean))];
    const products = await Product.find({ slug: { $in: slugs }, isActive: true }).lean();
    const productMap = new Map(products.map((product) => [product.slug, product]));

    const items = [];
    for (const requested of requestedItems) {
      const slug = String(requested.slug || "").trim();
      const product = productMap.get(slug);
      if (!product) return res.status(400).json({ success: false, message: `A product in your cart is no longer available: ${slug}` });

      const parsedQuantity = Number.parseInt(requested.quantity, 10);
      if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 99) {
        return res.status(400).json({ success: false, code: "INVALID_QUANTITY", message: `Choose a valid quantity for ${product.name}.` });
      }
      const quantity = parsedQuantity;

      if (Number(product.stock) <= 0) {
        return res.status(409).json({
          success: false,
          code: "OUT_OF_STOCK",
          message: `${product.name} is currently out of stock. Remove it from your cart before checkout.`,
        });
      }

      if (quantity > Number(product.stock)) {
        return res.status(409).json({
          success: false,
          code: "INSUFFICIENT_STOCK",
          message: `Only ${product.stock} unit(s) of ${product.name} are currently available.`,
        });
      }

      items.push({
        product: product._id,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        quantity,
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const signedIn = await resolveCustomerSession(req, { touch: false });
    const settings = await getCommerceSettings();

    const couponResult = req.body?.couponCode
      ? await validateCoupon({
          code: req.body.couponCode,
          subtotal,
          customerAccount: signedIn?.customer?._id || null,
        })
      : { valid: false, coupon: null, discountAmount: 0, message: "" };

    if (req.body?.couponCode && !couponResult.valid) {
      return res.status(400).json({ success: false, code: "INVALID_COUPON", message: couponResult.message });
    }

    const pricing = calculatePricing({
      subtotal,
      settings,
      discountAmount: couponResult.valid ? couponResult.discountAmount : 0,
    });

    let orderNumber;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = makeOrderNumber();
      if (!(await Order.exists({ orderNumber: candidate }))) {
        orderNumber = candidate;
        break;
      }
    }
    if (!orderNumber) throw new Error("Unable to generate a unique order number");

    // Atomically reserve inventory immediately before creating the order.
    // This prevents two simultaneous checkouts from purchasing the same last unit.
    const reservations = [];

    for (const item of items) {
      const reserved = await Product.findOneAndUpdate(
        {
          _id: item.product,
          isActive: true,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        {
          returnDocument: "after",
        }
      );

      if (!reserved) {
        if (reservations.length) {
          await Product.bulkWrite(
            reservations.map((entry) => ({
              updateOne: {
                filter: { _id: entry.product },
                update: { $inc: { stock: entry.quantity } },
              },
            }))
          );
        }

        return res.status(409).json({
          success: false,
          code: "OUT_OF_STOCK",
          message: `${item.name} became unavailable while you were checking out. Your cart has not been charged.`,
        });
      }

      reservations.push({ product: item.product, quantity: item.quantity });
    }

    let reservedCoupon = null;
    if (couponResult.valid && couponResult.coupon) {
      reservedCoupon = await reserveCouponUsage(couponResult.coupon);
      if (!reservedCoupon) {
        if (reservations.length) {
          await Product.bulkWrite(
            reservations.map((entry) => ({
              updateOne: { filter: { _id: entry.product }, update: { $inc: { stock: entry.quantity } } },
            }))
          );
        }
        return res.status(409).json({ success: false, code: "COUPON_UNAVAILABLE", message: "This coupon is no longer available." });
      }
    }

    let order;
    try {
      order = await Order.create({
      orderNumber,
      customerAccount: signedIn?.customer?._id || null,
      customer: { name, email, phone },
      email,
      shippingAddress: {
        addressLine1,
        addressLine2: String(shippingAddress.addressLine2 || "").trim(),
        city,
        state,
        postalCode,
        country: "India",
      },
      items,
      note: String(req.body?.note || "").trim().slice(0, 1000),
      subtotal: pricing.subtotal,
      couponCode: couponResult.coupon?.code || "",
      discountAmount: pricing.discountAmount,
      discountedSubtotal: pricing.discountedSubtotal,
      taxEnabled: pricing.taxEnabled,
      taxRate: pricing.taxRate,
      taxMode: pricing.taxMode,
      taxableAmount: pricing.taxableAmount,
      taxAmount: pricing.taxAmount,
      shippingAmount: pricing.shippingAmount,
      freeDeliveryThreshold: pricing.freeDeliveryThreshold,
      total: pricing.total,
      paymentMethod: "cod",
      paymentStatus: "cod_pending",
      status: "placed",
      });
    } catch (createError) {
      if (reservations.length) {
        await Product.bulkWrite(
          reservations.map((entry) => ({
            updateOne: {
              filter: { _id: entry.product },
              update: { $inc: { stock: entry.quantity } },
            },
          }))
        );
      }
      if (reservedCoupon) await releaseCouponUsage(reservedCoupon._id);
      throw createError;
    }


    emitAdmin("order:created", { orderNumber: order.orderNumber, status: order.status, paymentStatus: order.paymentStatus, total: order.total, createdAt: order.createdAt });

    const notification = await sendOrderConfirmationEmail(order);
    if (notification.sent) {
      order.confirmationEmailSentAt = new Date();
      await order.save();
    }

    return res.status(201).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        couponCode: order.couponCode,
        discountAmount: order.discountAmount,
        discountedSubtotal: order.discountedSubtotal,
        taxEnabled: order.taxEnabled,
        taxRate: order.taxRate,
        taxMode: order.taxMode,
        taxAmount: order.taxAmount,
        shippingAmount: order.shippingAmount,
        total: order.total,
        emailNotification: notification.sent ? "sent" : notification.reason || "not_sent",
      },
    });
  } catch (error) {
    return next(error);
  }
});

// API: GET /track — handles the track request and returns a normalized JSON response.

router.get("/track", async (req, res, next) => {
  try {
    const orderNumber = String(req.query.orderNumber || "").trim().toUpperCase().slice(0, 80);
    const email = String(req.query.email || "").trim().toLowerCase().slice(0, 180);

    if (orderNumber.length < 8 || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Enter both the order number and the email used for the order." });
    }

    const order = await Order.findOne({ orderNumber, email })
      .select("orderNumber status trackingNumber courier paymentMethod paymentStatus total createdAt updatedAt")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "We could not find an order matching those details." });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    return next(error);
  }
});

export default router;
