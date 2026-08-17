/** Public delivered-order review invitation and published testimonial routes. */
import { Router } from "express";
import Product from "../models/Product.js";
import ProductReview from "../models/ProductReview.js";
import OrderReview from "../models/OrderReview.js";
import { emitAdmin } from "../services/realtime.js";
import { recalculateProductRating, resolveReviewInvitation, reviewDisplayName } from "../services/reviewService.js";

const router = Router();

function parseReviewBody(body = {}) {
  const rating = Number(body.rating);
  const title = String(body.title || "").trim().slice(0, 120);
  const text = String(body.body || "").trim().slice(0, 1500);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Choose a rating from 1 to 5." };
  if (text.length < 10) return { error: "Write at least 10 characters in your review." };
  return { rating, title, body: text };
}

router.get("/invite", async (req, res, next) => {
  try {
    const order = await resolveReviewInvitation(req.query.order, req.query.token);
    if (!order) return res.status(403).json({ success: false, message: "This review link is invalid or has expired." });

    const [productReviews, orderReview] = await Promise.all([
      ProductReview.find({ orderNumber: order.orderNumber }).select("productSlug rating title body status").lean(),
      OrderReview.findOne({ orderNumber: order.orderNumber }).select("rating title body status").lean(),
    ]);
    const reviewed = new Map(productReviews.map((review) => [review.productSlug, review]));

    return res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        items: order.items.map((item) => ({
          slug: item.slug,
          name: item.name,
          image: item.image,
          review: reviewed.get(item.slug) || null,
        })),
        orderReview: orderReview || null,
      },
    });
  } catch (error) { next(error); }
});

router.post("/invite/product", async (req, res, next) => {
  try {
    const order = await resolveReviewInvitation(req.body?.orderNumber, req.body?.token);
    if (!order) return res.status(403).json({ success: false, message: "This review link is invalid or has expired." });
    const parsed = parseReviewBody(req.body);
    if (parsed.error) return res.status(400).json({ success: false, message: parsed.error });

    const productSlug = String(req.body?.productSlug || "").trim();
    const item = order.items.find((entry) => entry.slug === productSlug);
    if (!item) return res.status(403).json({ success: false, message: "That product was not part of this delivered order." });
    const product = await Product.findOne({ slug: productSlug }).lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    const review = await ProductReview.findOneAndUpdate(
      { orderNumber: order.orderNumber, productSlug },
      {
        $set: {
          customer: order.customerAccount || undefined,
          product: product._id,
          productName: item.name,
          productImage: item.image,
          displayName: reviewDisplayName(order.customer.name),
          source: "email",
          verifiedPurchase: true,
          rating: parsed.rating,
          title: parsed.title,
          body: parsed.body,
          status: "pending",
        },
        $setOnInsert: { orderNumber: order.orderNumber, productSlug },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    emitAdmin("review:created", { type: "product", id: review._id, orderNumber: order.orderNumber });
    return res.status(201).json({ success: true, data: review });
  } catch (error) { next(error); }
});

router.post("/invite/order", async (req, res, next) => {
  try {
    const order = await resolveReviewInvitation(req.body?.orderNumber, req.body?.token);
    if (!order) return res.status(403).json({ success: false, message: "This review link is invalid or has expired." });
    const parsed = parseReviewBody(req.body);
    if (parsed.error) return res.status(400).json({ success: false, message: parsed.error });

    const review = await OrderReview.findOneAndUpdate(
      { orderNumber: order.orderNumber },
      {
        $set: {
          customer: order.customerAccount || null,
          order: order._id,
          displayName: reviewDisplayName(order.customer.name),
          source: "email",
          verifiedPurchase: true,
          rating: parsed.rating,
          title: parsed.title,
          body: parsed.body,
          status: "pending",
        },
        $setOnInsert: { orderNumber: order.orderNumber },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    emitAdmin("review:created", { type: "order", id: review._id, orderNumber: order.orderNumber });
    return res.status(201).json({ success: true, data: review });
  } catch (error) { next(error); }
});

router.get("/testimonials", async (req, res, next) => {
  try {
    const reviews = await OrderReview.find({ status: "published" }).sort({ createdAt: -1 }).limit(18).lean();
    return res.json({ success: true, data: reviews });
  } catch (error) { next(error); }
});

export default router;
