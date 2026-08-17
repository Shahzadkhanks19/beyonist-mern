/**
 * Express router for admin management routes. Defines HTTP endpoints, authorization boundaries, validation, and orchestration for this API area.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Router } from "express";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Post from "../models/Post.js";
import ContactMessage from "../models/ContactMessage.js";
import Lead from "../models/Lead.js";
import AdminSession from "../models/AdminSession.js";
import Coupon from "../models/Coupon.js";
import ProductReview from "../models/ProductReview.js";
import OrderReview from "../models/OrderReview.js";
import { getCommerceSettings } from "../services/pricingService.js";
import { clearAdminCookie, requireAdmin, publicAdmin } from "../services/adminSession.js";
import { hashPasswordAsync, verifyPasswordAsync } from "../services/passwordService.js";
import { sendOrderStatusEmail } from "../services/emailService.js";
import { emitAdmin } from "../services/realtime.js";
import { ensureReviewInvitation, recalculateProductRating } from "../services/reviewService.js";
import { ensureInvoiceNumber } from "../services/invoiceService.js";

const router = Router();

router.use(requireAdmin);

const ORDER_STATUSES = ["placed", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "cod_pending", "paid", "failed", "refunded"];
const CONTACT_STATUSES = ["new", "read", "replied", "closed"];
const LEAD_STATUSES = ["subscribed", "unsubscribed"];

/**
 * Implements the clean operation used by this module.
 */
function clean(value, max = 5000) {
  return String(value ?? "").trim().slice(0, max);
}

/**
 * Implements the escape regex operation used by this module.
 */
function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Implements the slugify operation used by this module.
 */
function slugify(value) {
  return clean(value, 180)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Implements the array from operation used by this module.
 */
function arrayFrom(value) {
  if (Array.isArray(value)) return value.map((item) => clean(item, 1000)).filter(Boolean);
  return clean(value, 10000).split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function contentBlocksFrom(value) {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(["paragraph", "heading2", "heading3", "quote", "bullets", "numbered", "image", "divider"]);
  return value.slice(0, 120).map((block, index) => {
    const type = allowed.has(block?.type) ? block.type : "paragraph";
    return {
      id: clean(block?.id || `block-${index + 1}`, 80),
      type,
      text: clean(block?.text, 12000),
      items: Array.isArray(block?.items) ? block.items.slice(0, 100).map((item) => clean(item, 1000)).filter(Boolean) : undefined,
      url: clean(block?.url, 1000),
      alt: clean(block?.alt, 220),
      caption: clean(block?.caption, 500),
    };
  });
}

/**
 * Implements the pagination operation used by this module.
 */
function pagination(req, max = 100) {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 30, 1), max);
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Implements the number value operation used by this module.
 */
function numberValue(value, { min = 0, max = Number.POSITIVE_INFINITY, fallback = 0 } = {}) {
  if (value === "" || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Implements the optional positive integer operation used by this module.
 */
function optionalPositiveInteger(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Implements the optional date operation used by this module.
 */
function optionalDate(value) {
  if (value === "" || value === null || value === undefined) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// API: GET /dashboard — handles the dashboard request and returns a normalized JSON response.

router.get("/dashboard", async (_req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      activeOrders,
      totalCustomers,
      activeProducts,
      publishedPosts,
      newMessages,
      subscribedLeads,
      revenue,
      monthlyRevenue,
      recentOrders,
      recentMessages,
      pendingReviews,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: { $nin: ["delivered", "cancelled"] } }),
      Customer.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Post.countDocuments({ published: true }),
      ContactMessage.countDocuments({ status: "new" }),
      Lead.countDocuments({ status: "subscribed" }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: monthStart }, status: { $ne: "cancelled" }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(6).select("orderNumber customer status paymentStatus total createdAt").lean(),
      ContactMessage.find().sort({ createdAt: -1 }).limit(5).select("name email topic status createdAt").lean(),
      Promise.all([ProductReview.countDocuments({ status: "pending" }), OrderReview.countDocuments({ status: "pending" })]).then(([product, order]) => product + order),
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          totalOrders,
          activeOrders,
          totalCustomers,
          activeProducts,
          publishedPosts,
          newMessages,
          subscribedLeads,
          revenue: revenue[0]?.total || 0,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
          pendingReviews,
        },
        recentOrders,
        recentMessages,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ORDERS
// API: GET /orders — handles the orders request and returns a normalized JSON response.
router.get("/orders", async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req);
    const q = clean(req.query.q, 180);
    const searchRegex = q ? new RegExp(escapeRegex(q), "i") : null;
    const status = clean(req.query.status, 40);
    const paymentStatus = clean(req.query.paymentStatus, 40);
    const filter = {};

    if (q) {
      filter.$or = [
        { orderNumber: searchRegex },
        { "customer.name": searchRegex },
        { email: searchRegex },
        { "customer.phone": searchRegex },
      ];
    }
    if (ORDER_STATUSES.includes(status)) filter.status = status;
    if (PAYMENT_STATUSES.includes(paymentStatus)) filter.paymentStatus = paymentStatus;

    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

// API: GET /orders/:orderNumber — handles the orders/ order number request and returns a normalized JSON response.

router.get("/orders/:orderNumber", async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: clean(req.params.orderNumber, 80).toUpperCase() }).lean();
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// API: PATCH /orders/:orderNumber — handles the orders/ order number request and returns a normalized JSON response.

router.patch("/orders/:orderNumber", async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: clean(req.params.orderNumber, 80).toUpperCase() });
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    const previousStatus = order.status;
    const status = clean(req.body?.status, 40);
    const paymentStatus = clean(req.body?.paymentStatus, 40);

    if (status && !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status." });
    }
    if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: "Invalid payment status." });
    }

    if (status && status !== previousStatus) {
      if (status === "cancelled" && previousStatus !== "cancelled") {
        await Product.bulkWrite(
          order.items.map((item) => ({
            updateOne: {
              filter: { _id: item.product },
              update: { $inc: { stock: item.quantity } },
            },
          }))
        );
      }

      if (previousStatus === "cancelled" && status !== "cancelled") {
        const reservations = [];

        for (const item of order.items) {
          const reserved = await Product.findOneAndUpdate(
            { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { returnDocument: "after" }
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
              code: "INSUFFICIENT_STOCK",
              message: `Cannot reopen this order because ${item.name} does not have enough stock.`,
            });
          }

          reservations.push({ product: item.product, quantity: item.quantity });
        }
      }

      order.status = status;
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (req.body?.trackingNumber !== undefined) order.trackingNumber = clean(req.body.trackingNumber, 120);
    if (req.body?.courier !== undefined) order.courier = clean(req.body.courier, 120);

    await order.save();

    let emailNotification = "not_required";
    if (status && status !== previousStatus) {
      if (status === "delivered") await ensureInvoiceNumber(order);
      const reviewToken = status === "delivered" ? await ensureReviewInvitation(order) : "";
      const delivery = await sendOrderStatusEmail(order, previousStatus, { reviewToken });
      emailNotification = delivery.sent ? "sent" : delivery.reason || "not_sent";
      if (delivery.sent) {
        order.lastStatusEmailSentAt = new Date();
        await order.save();
      }
    }

    emitAdmin("order:updated", { orderNumber: order.orderNumber, status: order.status, paymentStatus: order.paymentStatus, updatedAt: order.updatedAt });
    res.json({ success: true, data: order.toObject(), emailNotification });
  } catch (error) {
    next(error);
  }
});

// API: GET /orders/:orderNumber/bill — handles the orders/ order number/bill request and returns a normalized JSON response.

router.get("/orders/:orderNumber/bill", async (req, res, next) => {
  try {
    const orderDocument = await Order.findOne({ orderNumber: clean(req.params.orderNumber, 80).toUpperCase() });
    if (!orderDocument) return res.status(404).json({ success: false, message: "Order not found." });
    await ensureInvoiceNumber(orderDocument);
    const order = orderDocument.toObject();

    res.json({
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
  } catch (error) {
    next(error);
  }
});

// CUSTOMERS
// API: GET /customers — handles the customers request and returns a normalized JSON response.
router.get("/customers", async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req);
    const q = clean(req.query.q, 180);
    const searchRegex = q ? new RegExp(escapeRegex(q), "i") : null;
    const filter = q ? {
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ],
    } : {};

    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-passwordHash").lean(),
      Customer.countDocuments(filter),
    ]);

    const ids = customers.map((customer) => customer._id);
    const orderStats = ids.length ? await Order.aggregate([
      { $match: { customerAccount: { $in: ids }, status: { $ne: "cancelled" } } },
      { $group: { _id: "$customerAccount", orders: { $sum: 1 }, spend: { $sum: "$total" } } },
    ]) : [];
    const statsMap = new Map(orderStats.map((stat) => [String(stat._id), stat]));

    const data = customers.map((customer) => ({
      ...customer,
      orderCount: statsMap.get(String(customer._id))?.orders || 0,
      totalSpend: statsMap.get(String(customer._id))?.spend || 0,
    }));

    res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

// API: GET /customers/:id — handles the customers/ id request and returns a normalized JSON response.

router.get("/customers/:id", async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-passwordHash").lean();
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found." });
    const orders = await Order.find({ customerAccount: customer._id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: { customer, orders } });
  } catch (error) {
    next(error);
  }
});

// API: PATCH /customers/:id — handles the customers/ id request and returns a normalized JSON response.

router.patch("/customers/:id", async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found." });
    if (typeof req.body?.isActive === "boolean") customer.isActive = req.body.isActive;
    if (typeof req.body?.offerAccess === "boolean") customer.offerAccess = req.body.offerAccess;
    if (typeof req.body?.discountAccess === "boolean") customer.discountAccess = req.body.discountAccess;
    if (req.body?.rewardPoints !== undefined) {
      customer.rewardPoints = Math.max(Number.parseInt(req.body.rewardPoints, 10) || 0, 0);
    }
    await customer.save();
    res.json({ success: true, data: customer.toObject() });
  } catch (error) {
    next(error);
  }
});

// PRODUCTS CMS
// API: GET /products — handles the products request and returns a normalized JSON response.
router.get("/products", async (req, res, next) => {
  try {
    const q = clean(req.query.q, 180);
    const searchRegex = q ? new RegExp(escapeRegex(q), "i") : null;
    const filter = q ? {
      $or: [
        { name: searchRegex },
        { category: searchRegex },
        { slug: searchRegex },
      ],
    } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

// API: POST /products — handles the products request and returns a normalized JSON response.

router.post("/products", async (req, res, next) => {
  try {
    const name = clean(req.body?.name, 140);
    const slug = slugify(req.body?.slug || name);
    if (!name || !slug) return res.status(400).json({ success: false, message: "Product name is required." });
    if (await Product.exists({ slug })) return res.status(409).json({ success: false, message: "That product slug already exists." });

    const product = await Product.create({
      name,
      slug,
      shortDescription: clean(req.body?.shortDescription, 220),
      description: clean(req.body?.description, 10000),
      ingredients: arrayFrom(req.body?.ingredients),
      howToUse: arrayFrom(req.body?.howToUse),
      benefits: arrayFrom(req.body?.benefits),
      cautions: arrayFrom(req.body?.cautions),
      category: clean(req.body?.category, 100),
      concern: clean(req.body?.concern, 100),
      price: Math.max(Number(req.body?.price) || 0, 0),
      compareAtPrice: req.body?.compareAtPrice ? Math.max(Number(req.body.compareAtPrice) || 0, 0) : undefined,
      images: arrayFrom(req.body?.images),
      stock: Math.max(Number.parseInt(req.body?.stock, 10) || 0, 0),
      badge: clean(req.body?.badge, 50),
      tags: arrayFrom(req.body?.tags).map((tag) => tag.toLowerCase()),
      isActive: req.body?.isActive !== false,
      isFeatured: Boolean(req.body?.isFeatured),
      featuredOrder: Math.max(Number.parseInt(req.body?.featuredOrder, 10) || 999, 0),
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// API: PATCH /products/:id — handles the products/ id request and returns a normalized JSON response.

router.patch("/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    if (req.body?.name !== undefined) product.name = clean(req.body.name, 140);
    if (req.body?.slug !== undefined) {
      const slug = slugify(req.body.slug);
      const duplicate = await Product.exists({ slug, _id: { $ne: product._id } });
      if (duplicate) return res.status(409).json({ success: false, message: "That product slug already exists." });
      product.slug = slug;
    }
    for (const field of ["shortDescription", "description", "category", "concern", "badge"]) {
      if (req.body?.[field] !== undefined) product[field] = clean(req.body[field], field === "description" ? 10000 : 220);
    }
    for (const field of ["ingredients", "howToUse", "benefits", "cautions", "images", "tags"]) {
      if (req.body?.[field] !== undefined) product[field] = arrayFrom(req.body[field]);
    }
    if (req.body?.price !== undefined) product.price = Math.max(Number(req.body.price) || 0, 0);
    if (req.body?.compareAtPrice !== undefined) product.compareAtPrice = req.body.compareAtPrice === "" ? undefined : Math.max(Number(req.body.compareAtPrice) || 0, 0);
    if (req.body?.stock !== undefined) product.stock = Math.max(Number.parseInt(req.body.stock, 10) || 0, 0);
    if (typeof req.body?.isActive === "boolean") product.isActive = req.body.isActive;
    if (typeof req.body?.isFeatured === "boolean") product.isFeatured = req.body.isFeatured;
    if (req.body?.featuredOrder !== undefined) product.featuredOrder = Math.max(Number.parseInt(req.body.featuredOrder, 10) || 999, 0);

    await product.save();
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// API: DELETE /products/:id — handles the products/ id request and returns a normalized JSON response.

router.delete("/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// BLOG CMS
// API: GET /posts — handles the posts request and returns a normalized JSON response.
router.get("/posts", async (req, res, next) => {
  try {
    const q = clean(req.query.q, 180);
    const searchRegex = q ? new RegExp(escapeRegex(q), "i") : null;
    const filter = q ? {
      $or: [
        { title: searchRegex },
        { category: searchRegex },
        { slug: searchRegex },
      ],
    } : {};
    const posts = await Post.find(filter).sort({ publishedAt: -1, createdAt: -1 }).lean();
    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
});

// API: POST /posts — handles the posts request and returns a normalized JSON response.

router.post("/posts", async (req, res, next) => {
  try {
    const title = clean(req.body?.title, 180);
    const slug = slugify(req.body?.slug || title);
    if (!title || !slug) return res.status(400).json({ success: false, message: "Post title is required." });
    if (await Post.exists({ slug })) return res.status(409).json({ success: false, message: "That post slug already exists." });

    const post = await Post.create({
      title,
      slug,
      excerpt: clean(req.body?.excerpt, 320),
      content: clean(req.body?.content, 60000),
      contentBlocks: contentBlocksFrom(req.body?.contentBlocks),
      category: clean(req.body?.category, 100),
      image: clean(req.body?.image, 1000),
      imageAlt: clean(req.body?.imageAlt, 220),
      author: clean(req.body?.author || "Beyonist Editorial", 120),
      tags: arrayFrom(req.body?.tags).slice(0, 30),
      seoTitle: clean(req.body?.seoTitle, 70),
      seoDescription: clean(req.body?.seoDescription, 180),
      readingTime: Math.max(Number.parseInt(req.body?.readingTime, 10) || 4, 1),
      featured: Boolean(req.body?.featured),
      published: req.body?.published !== false,
      publishedAt: req.body?.publishedAt ? new Date(req.body.publishedAt) : new Date(),
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
});

// API: PATCH /posts/:id — handles the posts/ id request and returns a normalized JSON response.

router.patch("/posts/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    if (req.body?.title !== undefined) post.title = clean(req.body.title, 180);
    if (req.body?.slug !== undefined) {
      const slug = slugify(req.body.slug);
      const duplicate = await Post.exists({ slug, _id: { $ne: post._id } });
      if (duplicate) return res.status(409).json({ success: false, message: "That post slug already exists." });
      post.slug = slug;
    }
    for (const field of ["excerpt", "content", "category", "image", "imageAlt", "author", "seoTitle", "seoDescription"]) {
      if (req.body?.[field] !== undefined) post[field] = clean(req.body[field], field === "content" ? 60000 : 1000);
    }
    if (req.body?.contentBlocks !== undefined) post.contentBlocks = contentBlocksFrom(req.body.contentBlocks);
    if (req.body?.tags !== undefined) post.tags = arrayFrom(req.body.tags).slice(0, 30);
    if (req.body?.readingTime !== undefined) post.readingTime = Math.max(Number.parseInt(req.body.readingTime, 10) || 1, 1);
    if (typeof req.body?.featured === "boolean") post.featured = req.body.featured;
    if (typeof req.body?.published === "boolean") {
      const wasPublished = post.published;
      post.published = req.body.published;
      if (!wasPublished && post.published && !req.body?.publishedAt) post.publishedAt = new Date();
    }
    if (req.body?.publishedAt) post.publishedAt = new Date(req.body.publishedAt);

    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
});

// API: DELETE /posts/:id — handles the posts/ id request and returns a normalized JSON response.

router.delete("/posts/:id", async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// CONTACT MESSAGES
// API: GET /messages — handles the messages request and returns a normalized JSON response.
router.get("/messages", async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req);
    const q = clean(req.query.q, 180);
    const searchRegex = q ? new RegExp(escapeRegex(q), "i") : null;
    const status = clean(req.query.status, 30);
    const filter = {};
    if (q) filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { topic: searchRegex },
      { message: searchRegex },
    ];
    if (CONTACT_STATUSES.includes(status)) filter.status = status;

    const [items, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ContactMessage.countDocuments(filter),
    ]);
    res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

// API: PATCH /messages/:id — handles the messages/ id request and returns a normalized JSON response.

router.patch("/messages/:id", async (req, res, next) => {
  try {
    const status = clean(req.body?.status, 30);
    if (!CONTACT_STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid message status." });
    const item = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { returnDocument: "after" });
    if (!item) return res.status(404).json({ success: false, message: "Message not found." });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// API: DELETE /messages/:id — handles the messages/ id request and returns a normalized JSON response.

router.delete("/messages/:id", async (req, res, next) => {
  try {
    const item = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Message not found." });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// LEADS
// API: GET /leads — handles the leads request and returns a normalized JSON response.
router.get("/leads", async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req, 200);
    const q = clean(req.query.q, 180);
    const searchRegex = q ? new RegExp(escapeRegex(q), "i") : null;
    const status = clean(req.query.status, 30);
    const filter = q ? { email: searchRegex } : {};
    if (LEAD_STATUSES.includes(status)) filter.status = status;

    const [items, total] = await Promise.all([
      Lead.find(filter).sort({ lastCapturedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(filter),
    ]);
    res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

// API: PATCH /leads/:id — handles the leads/ id request and returns a normalized JSON response.

router.patch("/leads/:id", async (req, res, next) => {
  try {
    const status = clean(req.body?.status, 30);
    if (!LEAD_STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid lead status." });
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status, marketingConsent: status === "subscribed" }, { returnDocument: "after" });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });
    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
});

// API: DELETE /leads/:id — handles the leads/ id request and returns a normalized JSON response.

router.delete("/leads/:id", async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// COUPONS
// API: GET /coupons — handles the coupons request and returns a normalized JSON response.
router.get("/coupons", async (req, res, next) => {
  try {
    const q = clean(req.query.q, 80);
    const searchRegex = q ? new RegExp(escapeRegex(q), "i") : null;
    const filter = q ? { code: searchRegex } : {};
    const items = await Coupon.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
});

// API: POST /coupons — handles the coupons request and returns a normalized JSON response.

router.post("/coupons", async (req, res, next) => {
  try {
    const code = clean(req.body?.code, 40).toUpperCase().replace(/\s+/g, "");
    const discountType = clean(req.body?.discountType, 30);
    const value = numberValue(req.body?.value, { min: 0, max: discountType === "percentage" ? 100 : Number.POSITIVE_INFINITY });
    const startsAt = optionalDate(req.body?.startsAt);
    const endsAt = optionalDate(req.body?.endsAt);

    if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
      return res.status(400).json({ success: false, message: "Enter a valid coupon code." });
    }
    if (!["percentage", "fixed"].includes(discountType)) {
      return res.status(400).json({ success: false, message: "Choose a valid discount type." });
    }
    if (value <= 0 || (discountType === "percentage" && value > 100)) {
      return res.status(400).json({ success: false, message: "Enter a valid coupon value." });
    }
    if (req.body?.startsAt && !startsAt) {
      return res.status(400).json({ success: false, message: "Enter a valid coupon start date." });
    }
    if (req.body?.endsAt && !endsAt) {
      return res.status(400).json({ success: false, message: "Enter a valid coupon end date." });
    }
    if (startsAt && endsAt && endsAt <= startsAt) {
      return res.status(400).json({ success: false, message: "Coupon end date must be after the start date." });
    }
    if (await Coupon.exists({ code })) {
      return res.status(409).json({ success: false, message: "That coupon code already exists." });
    }

    const item = await Coupon.create({
      code,
      description: clean(req.body?.description, 220),
      discountType,
      value,
      minimumSubtotal: numberValue(req.body?.minimumSubtotal, { min: 0 }),
      maximumDiscount:
        req.body?.maximumDiscount === "" || req.body?.maximumDiscount == null
          ? null
          : numberValue(req.body.maximumDiscount, { min: 0 }),
      startsAt,
      endsAt,
      usageLimit: optionalPositiveInteger(req.body?.usageLimit),
      membersOnly: Boolean(req.body?.membersOnly),
      isActive: req.body?.isActive !== false,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
});

// API: PATCH /coupons/:id — handles the coupons/ id request and returns a normalized JSON response.

router.patch("/coupons/:id", async (req, res, next) => {
  try {
    const item = await Coupon.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Coupon not found." });

    if (req.body?.code !== undefined) {
      const code = clean(req.body.code, 40).toUpperCase().replace(/\s+/g, "");
      if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
        return res.status(400).json({ success: false, message: "Enter a valid coupon code." });
      }
      if (await Coupon.exists({ code, _id: { $ne: item._id } })) {
        return res.status(409).json({ success: false, message: "That coupon code already exists." });
      }
      item.code = code;
    }

    if (req.body?.description !== undefined) {
      item.description = clean(req.body.description, 220);
    }

    if (req.body?.discountType !== undefined) {
      const type = clean(req.body.discountType, 30);
      if (!["percentage", "fixed"].includes(type)) {
        return res.status(400).json({ success: false, message: "Choose a valid discount type." });
      }
      item.discountType = type;
    }

    if (req.body?.value !== undefined) {
      const value = numberValue(req.body.value, {
        min: 0,
        max: item.discountType === "percentage" ? 100 : Number.POSITIVE_INFINITY,
      });
      if (value <= 0) {
        return res.status(400).json({ success: false, message: "Coupon value must be greater than zero." });
      }
      item.value = value;
    }

    if (item.discountType === "percentage" && item.value > 100) {
      return res.status(400).json({ success: false, message: "Percentage coupons cannot exceed 100%." });
    }

    if (req.body?.minimumSubtotal !== undefined) {
      item.minimumSubtotal = numberValue(req.body.minimumSubtotal, { min: 0 });
    }

    if (req.body?.maximumDiscount !== undefined) {
      item.maximumDiscount =
        req.body.maximumDiscount === "" || req.body.maximumDiscount == null
          ? null
          : numberValue(req.body.maximumDiscount, { min: 0 });
    }

    if (req.body?.usageLimit !== undefined) {
      item.usageLimit = optionalPositiveInteger(req.body.usageLimit);
    }

    if (req.body?.startsAt !== undefined) {
      const date = optionalDate(req.body.startsAt);
      if (req.body.startsAt && !date) {
        return res.status(400).json({ success: false, message: "Enter a valid coupon start date." });
      }
      item.startsAt = date;
    }

    if (req.body?.endsAt !== undefined) {
      const date = optionalDate(req.body.endsAt);
      if (req.body.endsAt && !date) {
        return res.status(400).json({ success: false, message: "Enter a valid coupon end date." });
      }
      item.endsAt = date;
    }

    if (item.startsAt && item.endsAt && item.endsAt <= item.startsAt) {
      return res.status(400).json({ success: false, message: "Coupon end date must be after the start date." });
    }

    if (typeof req.body?.membersOnly === "boolean") item.membersOnly = req.body.membersOnly;
    if (typeof req.body?.isActive === "boolean") item.isActive = req.body.isActive;

    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// API: DELETE /coupons/:id — handles the coupons/ id request and returns a normalized JSON response.

router.delete("/coupons/:id", async (req, res, next) => {
  try {
    const item = await Coupon.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Coupon not found." });
    res.json({ success: true });
  } catch (error) { next(error); }
});

// COMMERCE SETTINGS
// API: GET /commerce-settings — handles the commerce settings request and returns a normalized JSON response.
router.get("/commerce-settings", async (_req, res, next) => {
  try {
    const settings = await getCommerceSettings();
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
});

// API: PATCH /commerce-settings — handles the commerce settings request and returns a normalized JSON response.

router.patch("/commerce-settings", async (req, res, next) => {
  try {
    const settings = await getCommerceSettings();

    const next = {
      deliveryEnabled:
        typeof req.body?.deliveryEnabled === "boolean"
          ? req.body.deliveryEnabled
          : settings.deliveryEnabled,
      standardDeliveryPrice:
        req.body?.standardDeliveryPrice !== undefined
          ? numberValue(req.body.standardDeliveryPrice, { min: 0 })
          : settings.standardDeliveryPrice,
      freeDeliveryEnabled:
        typeof req.body?.freeDeliveryEnabled === "boolean"
          ? req.body.freeDeliveryEnabled
          : settings.freeDeliveryEnabled,
      freeDeliveryThreshold:
        req.body?.freeDeliveryThreshold !== undefined
          ? numberValue(req.body.freeDeliveryThreshold, { min: 0 })
          : settings.freeDeliveryThreshold,
      taxEnabled:
        typeof req.body?.taxEnabled === "boolean"
          ? req.body.taxEnabled
          : settings.taxEnabled,
      taxRate:
        req.body?.taxRate !== undefined
          ? numberValue(req.body.taxRate, { min: 0, max: 100 })
          : settings.taxRate,
      taxMode: ["inclusive", "exclusive"].includes(req.body?.taxMode)
        ? req.body.taxMode
        : settings.taxMode,
    };

    if (next.taxEnabled && next.taxRate <= 0) {
      return res.status(400).json({
        success: false,
        code: "INVALID_TAX_RATE",
        message: "Enter a tax rate greater than 0% before enabling tax.",
      });
    }

    settings.set(next);
    await settings.save();

    res.json({
      success: true,
      data: settings.toObject(),
      message: "Commerce pricing settings saved.",
    });
  } catch (error) {
    next(error);
  }
});

// ANALYTICS
// API: GET /analytics — handles the analytics request and returns a normalized JSON response.
router.get("/analytics", async (req, res, next) => {
  try {
    const requestedDays = Number.parseInt(req.query.days, 10) || 30;
    const days = [7, 30, 90, 365].includes(requestedDays) ? requestedDays : 30;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const nonCancelledMatch = {
      createdAt: { $gte: start },
      status: { $ne: "cancelled" },
    };

    const [
      orders,
      customerCount,
      productCount,
      leadCount,
      couponUsage,
      topProducts,
      statusBreakdown,
    ] = await Promise.all([
      Order.find(nonCancelledMatch)
        .select("createdAt total subtotal discountAmount taxAmount shippingAmount couponCode status paymentStatus customerAccount email items")
        .lean(),
      Customer.countDocuments({ createdAt: { $gte: start } }),
      Product.countDocuments({ isActive: true }),
      Lead.countDocuments({ firstCapturedAt: { $gte: start } }),
      Order.aggregate([
        { $match: { ...nonCancelledMatch, couponCode: { $ne: "" } } },
        {
          $group: {
            _id: "$couponCode",
            orders: { $sum: 1 },
            discount: { $sum: "$discountAmount" },
            orderValue: { $sum: "$total" },
          },
        },
        { $sort: { orders: -1 } },
        { $limit: 8 },
      ]),
      Order.aggregate([
        { $match: nonCancelledMatch },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.slug",
            name: { $first: "$items.name" },
            quantity: { $sum: "$items.quantity" },
            orderValue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 8 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const buckets = new Map();
    for (let i = 0; i < days; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      buckets.set(key, {
        date: key,
        orders: 0,
        orderValue: 0,
        collectedRevenue: 0,
      });
    }

    let collectedRevenue = 0;
    let orderValue = 0;
    let grossProductSales = 0;
    let discounts = 0;
    let taxOnOrders = 0;
    let shippingOnOrders = 0;
    let paidOrders = 0;
    const uniqueCustomers = new Set();

    for (const order of orders) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      const isPaid = order.paymentStatus === "paid";

      if (bucket) {
        bucket.orders += 1;
        bucket.orderValue += order.total || 0;
        if (isPaid) bucket.collectedRevenue += order.total || 0;
      }

      orderValue += order.total || 0;
      grossProductSales += order.subtotal || 0;
      discounts += order.discountAmount || 0;
      taxOnOrders += order.taxAmount || 0;
      shippingOnOrders += order.shippingAmount || 0;

      if (isPaid) {
        paidOrders += 1;
        collectedRevenue += order.total || 0;
      }

      uniqueCustomers.add(
        order.customerAccount
          ? String(order.customerAccount)
          : `guest:${order.email}`
      );
    }

    const orderCount = orders.length;

    res.json({
      success: true,
      data: {
        rangeDays: days,
        summary: {
          revenue: collectedRevenue,
          orderValue,
          grossSales: grossProductSales,
          discounts,
          taxCollected: taxOnOrders,
          shippingCollected: shippingOnOrders,
          orders: orderCount,
          paidOrders,
          averageOrderValue: orderCount ? orderValue / orderCount : 0,
          uniqueCustomers: uniqueCustomers.size,
          newCustomers: customerCount,
          activeProducts: productCount,
          newLeads: leadCount,
        },
        daily: [...buckets.values()],
        topProducts,
        couponUsage,
        statusBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
});


// REVIEWS / MODERATION
router.get("/reviews", async (req, res, next) => {
  try {
    const status = clean(req.query.status, 30);
    const type = clean(req.query.type, 30) || "all";
    const filter = status && ["pending", "published", "rejected"].includes(status) ? { status } : {};
    const [productReviews, orderReviews] = await Promise.all([
      type !== "order" ? ProductReview.find(filter).populate("customer", "name email").sort({ createdAt: -1 }).limit(500).lean() : [],
      type !== "product" ? OrderReview.find(filter).populate("customer", "name email").sort({ createdAt: -1 }).limit(500).lean() : [],
    ]);
    return res.json({ success: true, data: { productReviews, orderReviews } });
  } catch (error) { next(error); }
});

router.patch("/reviews/:type/:id", async (req, res, next) => {
  try {
    const status = clean(req.body?.status, 30);
    if (!["pending", "published", "rejected"].includes(status)) return res.status(400).json({ success: false, message: "Invalid review status." });
    const Model = req.params.type === "product" ? ProductReview : req.params.type === "order" ? OrderReview : null;
    if (!Model) return res.status(400).json({ success: false, message: "Invalid review type." });
    const review = await Model.findByIdAndUpdate(req.params.id, { $set: { status } }, { returnDocument: "after" });
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    if (req.params.type === "product") await recalculateProductRating(review.product);
    emitAdmin("review:updated", { type: req.params.type, id: review._id, status });
    return res.json({ success: true, data: review });
  } catch (error) { next(error); }
});

router.delete("/reviews/:type/:id", async (req, res, next) => {
  try {
    const Model = req.params.type === "product" ? ProductReview : req.params.type === "order" ? OrderReview : null;
    if (!Model) return res.status(400).json({ success: false, message: "Invalid review type." });
    const review = await Model.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    if (req.params.type === "product") await recalculateProductRating(review.product);
    emitAdmin("review:updated", { type: req.params.type, id: review._id, orderNumber: review.orderNumber, status: "deleted" });
    return res.json({ success: true });
  } catch (error) { next(error); }
});

// ADMIN SETTINGS
// API: GET /settings — handles the settings request and returns a normalized JSON response.
router.get("/settings", async (req, res) => {
  res.json({ success: true, data: publicAdmin(req.admin) });
});

// API: PATCH /settings/profile — handles the settings/profile request and returns a normalized JSON response.

router.patch("/settings/profile", async (req, res, next) => {
  try {
    const admin = req.admin;
    const name = clean(req.body?.name, 100);
    const email = clean(req.body?.email, 180).toLowerCase();
    const currentPassword = String(req.body?.currentPassword || "");

    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid name and email." });
    }

    const emailChanged = email !== admin.email;
    if (emailChanged) {
      const withPassword = await admin.constructor.findById(admin._id).select("+passwordHash");
      if (!currentPassword || !await verifyPasswordAsync(currentPassword, withPassword.passwordHash)) {
        return res.status(400).json({ success: false, message: "Current password is required to change the admin email." });
      }
      const exists = await admin.constructor.exists({ email, _id: { $ne: admin._id } });
      if (exists) return res.status(409).json({ success: false, message: "That admin email is already in use." });
    }

    admin.name = name;
    admin.email = email;
    await admin.save();

    if (emailChanged) {
      await AdminSession.deleteMany({ admin: admin._id, _id: { $ne: req.adminSession._id } });
    }

    res.json({ success: true, data: publicAdmin(admin) });
  } catch (error) {
    next(error);
  }
});

// API: PATCH /settings/password — handles the settings/password request and returns a normalized JSON response.

router.patch("/settings/password", async (req, res, next) => {
  try {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (newPassword.length < 10 || newPassword.length > 128) {
      return res.status(400).json({ success: false, message: "New admin password must be between 10 and 128 characters." });
    }

    const admin = await req.admin.constructor.findById(req.admin._id).select("+passwordHash");
    if (!await verifyPasswordAsync(currentPassword, admin.passwordHash)) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }
    if (await verifyPasswordAsync(newPassword, admin.passwordHash)) {
      return res.status(400).json({ success: false, message: "Choose a password different from the current password." });
    }

    admin.passwordHash = await hashPasswordAsync(newPassword);
    admin.passwordChangedAt = new Date();
    await admin.save();

    // Keep the current request valid until response, but revoke all sessions afterward.
    await AdminSession.deleteMany({ admin: admin._id });
    clearAdminCookie(res);
    res.json({ success: true, signedOut: true, message: "Password changed. Sign in again with the new password." });
  } catch (error) {
    next(error);
  }
});

export default router;
