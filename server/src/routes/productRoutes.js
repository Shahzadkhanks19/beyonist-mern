/**
 * Express router for product routes. Defines HTTP endpoints, authorization boundaries, validation, and orchestration for this API area.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Router } from "express";
import Product from "../models/Product.js";
import ProductReview from "../models/ProductReview.js";

const router = Router();
const CARD_FIELDS = "slug name category shortDescription price compareAtPrice stock isActive images badge rating reviewCount isFeatured featuredOrder tags";
const SORTS = {
  featured: { isFeatured: -1, featuredOrder: 1, createdAt: -1 },
  newest: { createdAt: -1 },
  "price-asc": { price: 1, name: 1 },
  "price-desc": { price: -1, name: 1 },
  rating: { rating: -1, reviewCount: -1 },
};

/**
 * Implements the escape regex operation used by this module.
 */
function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// API: GET /meta — handles the meta request and returns a normalized JSON response.

router.get("/meta", async (_req, res, next) => {
  try {
    const [categories, prices] = await Promise.all([
      Product.distinct("category", { isActive: true }),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        categories: categories.filter(Boolean).sort(),
        priceRange: prices[0] ? { min: prices[0].min, max: prices[0].max } : { min: 0, max: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
});

// API: GET / — handles the router root request and returns a normalized JSON response.

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 48);
    const filter = { isActive: true };

    if (req.query.category) filter.category = String(req.query.category).trim().slice(0, 100);

    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
      filter.price = {};
      if (Number.isFinite(minPrice)) filter.price.$gte = Math.max(minPrice, 0);
      if (Number.isFinite(maxPrice)) filter.price.$lte = Math.max(maxPrice, 0);
    }

    const q = String(req.query.q || "").trim().slice(0, 80);
    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");
      filter.$or = [
        { name: regex },
        { shortDescription: regex },
        { description: regex },
        { tags: regex },
        { category: regex },
      ];
    }

    const sort = SORTS[req.query.sort] || SORTS.featured;
    const [products, total] = await Promise.all([
      Product.find(filter).select(CARD_FIELDS).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(Math.ceil(total / limit), 1),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});


// API: GET /availability — handles the availability request and returns a normalized JSON response.


router.get("/availability", async (req, res, next) => {
  try {
    const slugs = [...new Set(
      String(req.query.slugs || "")
        .split(",")
        .map((slug) => slug.trim().slice(0, 180))
        .filter(Boolean)
    )].slice(0, 80);

    if (!slugs.length) {
      return res.json({ success: true, data: [] });
    }

    const products = await Product.find({ slug: { $in: slugs } })
      .select("slug name price compareAtPrice stock isActive images category")
      .lean();

    const productMap = new Map(products.map((product) => [product.slug, product]));

    return res.json({
      success: true,
      data: slugs.map((slug) => {
        const product = productMap.get(slug);

        if (!product) {
          return {
            slug,
            exists: false,
            isActive: false,
            stock: 0,
            available: false,
          };
        }

        return {
          slug: product.slug,
          exists: true,
          isActive: Boolean(product.isActive),
          stock: Math.max(Number(product.stock) || 0, 0),
          available: Boolean(product.isActive) && Number(product.stock) > 0,
          name: product.name,
          category: product.category,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          image: product.images?.[0] || "",
        };
      }),
    });
  } catch (error) {
    next(error);
  }
});

// API: GET /:slug — handles the slug request and returns a normalized JSON response.

router.get("/:slug", async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim().slice(0, 180);
    const product = await Product.findOne({ slug, isActive: true }).lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const relatedFilter = {
      _id: { $ne: product._id },
      isActive: true,
    };

    const reviewsPromise = ProductReview.find({ product: product._id, status: "published" })
      .select("displayName rating title body source verifiedPurchase createdAt")
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    const sameCategory = await Product.find({ ...relatedFilter, category: product.category })
      .select(CARD_FIELDS)
      .sort({ isFeatured: -1, featuredOrder: 1, rating: -1 })
      .limit(4)
      .lean();

    let related = sameCategory;
    if (related.length < 4) {
      const existingIds = related.map((item) => item._id);
      const fill = await Product.find({
        ...relatedFilter,
        _id: { $ne: product._id, $nin: existingIds },
      })
        .select(CARD_FIELDS)
        .sort({ isFeatured: -1, featuredOrder: 1, rating: -1 })
        .limit(4 - related.length)
        .lean();
      related = [...related, ...fill];
    }

    const reviews = await reviewsPromise;
    const publishedReviewCount = reviews.length;
    const publishedRating = publishedReviewCount
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / publishedReviewCount
      : 0;

    return res.json({
      success: true,
      data: {
        ...product,
        rating: publishedRating,
        reviewCount: publishedReviewCount,
      },
      related,
      reviews,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
