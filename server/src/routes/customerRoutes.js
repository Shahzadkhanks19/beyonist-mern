/**
 * Express router for customer routes. Defines HTTP endpoints, authorization boundaries, validation, and orchestration for this API area.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Router } from "express";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import CustomerSession from "../models/CustomerSession.js";
import ProductReview from "../models/ProductReview.js";
import OrderReview from "../models/OrderReview.js";
import Product from "../models/Product.js";
import { createCustomerSession, requireCustomer, publicCustomer } from "../services/customerSession.js";
import { hashPasswordAsync, verifyPasswordAsync } from "../services/passwordService.js";
import { emitAdmin } from "../services/realtime.js";
import { recalculateProductRating, reviewDisplayName } from "../services/reviewService.js";
import { ensureInvoiceNumber } from "../services/invoiceService.js";


const router = Router();
router.use(requireCustomer);

/**
 * Implements the customer emails operation used by this module.
 */
function customerEmails(customer) {
  return [...new Set([customer.email, ...(customer.previousEmails || [])].filter(Boolean).map((email) => email.toLowerCase()))];
}

/**
 * Implements the order filter for operation used by this module.
 */
function orderFilterFor(customer) {
  return {
    $or: [
      { customerAccount: customer._id },
      { email: { $in: customerEmails(customer) } },
    ],
  };
}

/**
 * Implements the order summary operation used by this module.
 */
function orderSummary(order) {
  return {
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
    taxableAmount: order.taxableAmount,
    taxAmount: order.taxAmount,
    shippingAmount: order.shippingAmount,
    total: order.total,
    trackingNumber: order.trackingNumber,
    courier: order.courier,
    items: order.items.map((item) => ({
      product: item.product,
      slug: item.slug,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

/**
 * Implements the sanitise address operation used by this module.
 */
function sanitiseAddress(body = {}) {
  return {
    label: String(body.label || "Home").trim().slice(0, 40),
    name: String(body.name || "").trim(),
    phone: String(body.phone || "").replace(/\D/g, "").slice(-10),
    addressLine1: String(body.addressLine1 || "").trim(),
    addressLine2: String(body.addressLine2 || "").trim(),
    city: String(body.city || "").trim(),
    state: String(body.state || "").trim(),
    postalCode: String(body.postalCode || "").trim(),
    country: "India",
    isDefault: Boolean(body.isDefault),
  };
}

/**
 * Validates address and returns a normalized result for downstream logic.
 */
function validateAddress(address) {
  if (address.name.length < 2) return "Enter the recipient name.";
  if (!/^[6-9]\d{9}$/.test(address.phone)) return "Enter a valid Indian mobile number.";
  if (address.addressLine1.length < 5) return "Enter a complete address.";
  if (address.city.length < 2 || !address.state) return "Enter city and state.";
  if (!/^\d{6}$/.test(address.postalCode)) return "Enter a valid 6-digit PIN code.";
  return "";
}

// API: GET /dashboard — handles the dashboard request and returns a normalized JSON response.

router.get("/dashboard", async (req, res, next) => {
  try {
    const customer = req.customer;
    const orderFilter = orderFilterFor(customer);

    const [orders, totalOrders, deliveredOrders, spendAggregate, productReviewCount, orderReviewCount] = await Promise.all([
      Order.find(orderFilter).sort({ createdAt: -1 }).limit(8).lean(),
      Order.countDocuments(orderFilter),
      Order.countDocuments({ $and: [orderFilter, { status: "delivered" }] }),
      Order.aggregate([
        { $match: orderFilter },
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      ProductReview.countDocuments({ customer: customer._id }),
      OrderReview.countDocuments({ customer: customer._id }),
    ]);

    return res.json({
      success: true,
      data: {
        customer: publicCustomer(customer),
        stats: {
          totalOrders,
          deliveredOrders,
          totalSpend: spendAggregate[0]?.total || 0,
          rewardPoints: customer.rewardPoints || 0,
          savedAddresses: customer.addresses?.length || 0,
          reviews: productReviewCount + orderReviewCount,
        },
        recentOrders: orders.map(orderSummary),
      },
    });
  } catch (error) {
    return next(error);
  }
});

// API: GET /orders — handles the orders request and returns a normalized JSON response.

router.get("/orders", async (req, res, next) => {
  try {
    const orders = await Order.find(orderFilterFor(req.customer)).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: orders.map(orderSummary) });
  } catch (error) {
    return next(error);
  }
});


// API: GET /wishlist — returns saved products for the authenticated customer.
router.get("/wishlist", async (req, res, next) => {
  try {
    const slugs = Array.isArray(req.customer.wishlist) ? req.customer.wishlist : [];
    if (!slugs.length) return res.json({ success: true, data: [] });

    const products = await Product.find({ slug: { $in: slugs } }).lean();
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    return res.json({ success: true, data: slugs.map((slug) => bySlug.get(slug)).filter(Boolean) });
  } catch (error) {
    return next(error);
  }
});

// API: PATCH /wishlist/:slug — saves a product once; duplicates are impossible.
router.patch("/wishlist/:slug", async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim().toLowerCase();
    const product = await Product.findOne({ slug }).select("_id slug").lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    const customer = await Customer.findById(req.customer._id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found." });

    if (!(customer.wishlist || []).includes(slug)) {
      if ((customer.wishlist || []).length >= 100) return res.status(400).json({ success: false, message: "Your wishlist is full." });
      customer.wishlist.push(slug);
      await customer.save();
    }

    return res.json({ success: true, data: publicCustomer(customer) });
  } catch (error) {
    return next(error);
  }
});

// API: DELETE /wishlist/:slug — removes a saved product.
router.delete("/wishlist/:slug", async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim().toLowerCase();
    const customer = await Customer.findById(req.customer._id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found." });

    customer.wishlist = (customer.wishlist || []).filter((item) => item !== slug);
    await customer.save();

    return res.json({ success: true, data: publicCustomer(customer) });
  } catch (error) {
    return next(error);
  }
});

// API: GET /addresses — handles the addresses request and returns a normalized JSON response.

router.get("/addresses", async (req, res) => {
  return res.json({ success: true, data: req.customer.addresses || [] });
});

// API: POST /addresses — handles the addresses request and returns a normalized JSON response.

router.post("/addresses", async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    if (customer.addresses.length >= 10) {
      return res.status(400).json({ success: false, code: "ADDRESS_LIMIT", message: "You can save up to 10 delivery addresses." });
    }
    const address = sanitiseAddress(req.body);
    const error = validateAddress(address);
    if (error) return res.status(400).json({ success: false, message: error });

    if (address.isDefault || customer.addresses.length === 0) {
      customer.addresses.forEach((item) => { item.isDefault = false; });
      address.isDefault = true;
    }

    customer.addresses.push(address);
    await customer.save();

    return res.status(201).json({ success: true, data: customer.addresses.at(-1) });
  } catch (error) {
    return next(error);
  }
});

// API: PATCH /addresses/:id — handles the addresses/ id request and returns a normalized JSON response.

router.patch("/addresses/:id", async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    const address = customer.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: "Saved address not found." });

    const nextAddress = sanitiseAddress({ ...address.toObject(), ...req.body });
    const error = validateAddress(nextAddress);
    if (error) return res.status(400).json({ success: false, message: error });

    if (nextAddress.isDefault) {
      customer.addresses.forEach((item) => { item.isDefault = String(item._id) === String(address._id); });
    }

    Object.assign(address, nextAddress);
    await customer.save();

    return res.json({ success: true, data: address });
  } catch (error) {
    return next(error);
  }
});

// API: DELETE /addresses/:id — handles the addresses/ id request and returns a normalized JSON response.

router.delete("/addresses/:id", async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    const address = customer.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: "Saved address not found." });

    const wasDefault = address.isDefault;
    address.deleteOne();

    if (wasDefault && customer.addresses.length) {
      customer.addresses[0].isDefault = true;
    }

    await customer.save();
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

// API: PATCH /profile — handles the profile request and returns a normalized JSON response.

router.patch("/profile", async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer._id).select("+passwordHash");
    const name = String(req.body?.name ?? customer.name).trim();
    const email = String(req.body?.email ?? customer.email).trim().toLowerCase();
    const phone = String(req.body?.phone ?? customer.phone).replace(/\D/g, "").slice(-10);
    const marketingOptIn = Boolean(req.body?.marketingOptIn);

    if (name.length < 2) return res.status(400).json({ success: false, message: "Enter your name." });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: "Enter a valid email address." });
    if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ success: false, message: "Enter a valid Indian mobile number." });

    const emailChanged = email !== customer.email;
    if (emailChanged) {
      const currentPassword = String(req.body?.currentPassword || "");
      if (!await verifyPasswordAsync(currentPassword, customer.passwordHash)) {
        return res.status(401).json({ success: false, code: "PASSWORD_REQUIRED", message: "Enter your current password to change your email." });
      }

      const exists = await Customer.exists({
        _id: { $ne: customer._id },
        $or: [{ email }, { previousEmails: email }],
      });
      if (exists) return res.status(409).json({ success: false, message: "That email is already used by another account." });

      customer.previousEmails = [...new Set([...(customer.previousEmails || []), customer.email])];
      customer.email = email;
    }

    customer.name = name;
    customer.phone = phone;
    customer.marketingOptIn = marketingOptIn;
    await customer.save();

    if (emailChanged) {
      await CustomerSession.deleteMany({ customer: customer._id });
      await createCustomerSession(customer._id, res, req);
    }

    return res.json({ success: true, data: publicCustomer(customer) });
  } catch (error) {
    return next(error);
  }
});

// API: PATCH /password — handles the password request and returns a normalized JSON response.

router.patch("/password", async (req, res, next) => {
  try {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({ success: false, message: "New password must be between 8 and 128 characters." });
    }

    const customer = await Customer.findById(req.customer._id).select("+passwordHash");
    if (!await verifyPasswordAsync(currentPassword, customer.passwordHash)) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    if (await verifyPasswordAsync(newPassword, customer.passwordHash)) {
      return res.status(400).json({ success: false, message: "Choose a password different from your current password." });
    }

    customer.passwordHash = await hashPasswordAsync(newPassword);
    customer.passwordChangedAt = new Date();
    customer.failedLoginAttempts = 0;
    customer.lockedUntil = null;
    await customer.save();

    await CustomerSession.deleteMany({ customer: customer._id });
    await createCustomerSession(customer._id, res, req);

    return res.json({ success: true, message: "Password updated successfully. Other signed-in sessions were revoked." });
  } catch (error) {
    return next(error);
  }
});

// Delivered customers can retrieve the immutable order snapshot used by the premium invoice renderer.
router.get("/orders/:orderNumber/invoice", async (req, res, next) => {
  try {
    const orderDocument = await Order.findOne({
      $and: [orderFilterFor(req.customer), { orderNumber: String(req.params.orderNumber || "").trim().toUpperCase(), status: "delivered" }],
    });
    if (!orderDocument) return res.status(404).json({ success: false, message: "Invoice is available after this order is delivered." });
    await ensureInvoiceNumber(orderDocument);
    const order = orderDocument.toObject();

    return res.json({
      success: true,
      data: {
        documentType: "ORDER INVOICE",
        seller: {
          name: "Beyonist Skincare Pvt. Ltd.",
          email: "contact@beyonist.com",
          phone: "+91 85279 99563",
          address: "3rd Floor Landmark Tower, South City 1, Sector 41, Gurugram, Haryana 122001",
        },
        order,
        generatedAt: new Date(),
      },
    });
  } catch (error) { next(error); }
});

// API: GET /reviews — handles the reviews request and returns a normalized JSON response.

router.get("/reviews", async (req, res, next) => {
  try {
    const customer = req.customer;
    const deliveredOrders = await Order.find({ $and: [orderFilterFor(customer), { status: "delivered" }] }).sort({ createdAt: -1 }).lean();
    const deliveredOrderNumbers = deliveredOrders.map((order) => order.orderNumber);
    if (deliveredOrderNumbers.length) {
      await Promise.all([
        ProductReview.updateMany({ customer: null, orderNumber: { $in: deliveredOrderNumbers } }, { $set: { customer: customer._id } }),
        OrderReview.updateMany({ customer: null, orderNumber: { $in: deliveredOrderNumbers } }, { $set: { customer: customer._id } }),
      ]);
    }
    const [reviews, orderReviews] = await Promise.all([
      ProductReview.find({ customer: customer._id }).sort({ createdAt: -1 }).lean(),
      OrderReview.find({ customer: customer._id }).sort({ createdAt: -1 }).lean(),
    ]);

    const reviewedKeys = new Set(reviews.map((review) => `${review.orderNumber}:${review.productSlug}`));
    const eligible = [];

    deliveredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = `${order.orderNumber}:${item.slug}`;
        if (!reviewedKeys.has(key)) {
          eligible.push({
            orderNumber: order.orderNumber,
            product: item.product,
            productSlug: item.slug,
            productName: item.name,
            productImage: item.image,
          });
        }
      });
    });

    const reviewedOrders = new Set(orderReviews.map((review) => review.orderNumber));
    const eligibleOrders = deliveredOrders
      .filter((order) => !reviewedOrders.has(order.orderNumber))
      .map((order) => ({ orderNumber: order.orderNumber, createdAt: order.createdAt, items: order.items.map((item) => ({ slug: item.slug, name: item.name, image: item.image })) }));

    return res.json({ success: true, data: { reviews, eligible, orderReviews, eligibleOrders } });
  } catch (error) {
    return next(error);
  }
});

// API: POST /reviews — handles the reviews request and returns a normalized JSON response.

router.post("/reviews", async (req, res, next) => {
  try {
    const customer = req.customer;
    const orderNumber = String(req.body?.orderNumber || "").trim().toUpperCase();
    const productSlug = String(req.body?.productSlug || "").trim();
    const rating = Number(req.body?.rating);
    const title = String(req.body?.title || "").trim();
    const body = String(req.body?.body || "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Choose a rating from 1 to 5." });
    }
    if (body.length < 10) return res.status(400).json({ success: false, message: "Write at least 10 characters in your review." });

    const order = await Order.findOne({
      $and: [
        orderFilterFor(customer),
        { orderNumber, status: "delivered", "items.slug": productSlug },
      ],
    }).lean();

    if (!order) return res.status(403).json({ success: false, message: "Only delivered products from your order history can be reviewed." });

    const item = order.items.find((product) => product.slug === productSlug);
    const product = await Product.findOne({ slug: productSlug }).lean();
    if (!item || !product) return res.status(404).json({ success: false, message: "Product not found." });

    const review = await ProductReview.create({
      customer: customer._id,
      product: product._id,
      productSlug,
      productName: item.name,
      productImage: item.image,
      orderNumber,
      displayName: reviewDisplayName(customer.name),
      source: "website",
      verifiedPurchase: true,
      rating,
      title,
      body,
      status: "pending",
    });

    emitAdmin("review:created", { type: "product", id: review._id, orderNumber });
    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "You already reviewed this product from that order." });
    return next(error);
  }
});

router.post("/order-reviews", async (req, res, next) => {
  try {
    const orderNumber = String(req.body?.orderNumber || "").trim().toUpperCase();
    const rating = Number(req.body?.rating);
    const title = String(req.body?.title || "").trim().slice(0, 120);
    const body = String(req.body?.body || "").trim().slice(0, 1500);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Choose a rating from 1 to 5." });
    if (body.length < 10) return res.status(400).json({ success: false, message: "Write at least 10 characters in your review." });

    const order = await Order.findOne({ $and: [orderFilterFor(req.customer), { orderNumber, status: "delivered" }] });
    if (!order) return res.status(403).json({ success: false, message: "Only delivered orders can be reviewed." });

    const review = await OrderReview.create({
      customer: req.customer._id,
      order: order._id,
      orderNumber,
      displayName: reviewDisplayName(req.customer.name),
      source: "website",
      verifiedPurchase: true,
      rating,
      title,
      body,
      status: "pending",
    });
    emitAdmin("review:created", { type: "order", id: review._id, orderNumber });
    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "You already reviewed this order." });
    next(error);
  }
});

router.patch("/order-reviews/:id", async (req, res, next) => {
  try {
    const review = await OrderReview.findOne({ _id: req.params.id, customer: req.customer._id });
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    const rating = Number(req.body?.rating ?? review.rating);
    const body = String(req.body?.body ?? review.body).trim().slice(0, 1500);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || body.length < 10) return res.status(400).json({ success: false, message: "Choose 1-5 stars and write at least 10 characters." });
    review.rating = rating;
    review.title = String(req.body?.title ?? review.title).trim().slice(0, 120);
    review.body = body;
    review.status = "pending";
    await review.save();
    emitAdmin("review:updated", { type: "order", id: review._id, orderNumber: review.orderNumber });
    return res.json({ success: true, data: review });
  } catch (error) { next(error); }
});

router.delete("/order-reviews/:id", async (req, res, next) => {
  try {
    const review = await OrderReview.findOneAndDelete({ _id: req.params.id, customer: req.customer._id });
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    emitAdmin("review:updated", { type: "order", id: review._id, orderNumber: review.orderNumber, status: "deleted" });
    return res.json({ success: true });
  } catch (error) { next(error); }
});

// API: PATCH /reviews/:id — handles the reviews/ id request and returns a normalized JSON response.

router.patch("/reviews/:id", async (req, res, next) => {
  try {
    const review = await ProductReview.findOne({ _id: req.params.id, customer: req.customer._id });
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });

    if (req.body?.rating !== undefined) {
      const rating = Number(req.body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Choose a rating from 1 to 5." });
      }
      review.rating = rating;
    }

    if (req.body?.title !== undefined) review.title = String(req.body.title || "").trim().slice(0, 120);
    if (req.body?.body !== undefined) {
      const body = String(req.body.body || "").trim();
      if (body.length < 10) return res.status(400).json({ success: false, message: "Write at least 10 characters in your review." });
      review.body = body;
    }

    const wasPublished = review.status === "published";
    review.displayName = review.displayName || reviewDisplayName(req.customer.name);
    review.status = "pending";
    await review.save();
    if (wasPublished) await recalculateProductRating(review.product);
    emitAdmin("review:updated", { type: "product", id: review._id, orderNumber: review.orderNumber });
    return res.json({ success: true, data: review });
  } catch (error) {
    return next(error);
  }
});

// API: DELETE /reviews/:id — handles the reviews/ id request and returns a normalized JSON response.

router.delete("/reviews/:id", async (req, res, next) => {
  try {
    const review = await ProductReview.findOneAndDelete({ _id: req.params.id, customer: req.customer._id });
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    if (review.status === "published") await recalculateProductRating(review.product);
    emitAdmin("review:updated", { type: "product", id: review._id, orderNumber: review.orderNumber, status: "deleted" });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
