/**
 * Customer-facing Product page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import ShopProductCard from "../components/ShopProductCard.jsx";
import { getProduct } from "../services/catalogApi.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import usePageSeo from "../hooks/usePageSeo.js";
import { responsiveImageProps } from "../utils/productImagePath.js";

/**
 * Renders the Heart Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function HeartIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

/**
 * Renders the Minus Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function MinusIcon() {
  return <svg viewBox="0 0 18 18" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.4]" aria-hidden="true"><path d="M4 9h10" /></svg>;
}

/**
 * Renders the Plus Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function PlusIcon() {
  return <svg viewBox="0 0 18 18" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.4]" aria-hidden="true"><path d="M4 9h10M9 4v10" /></svg>;
}

/**
 * Renders the Detail Accordion component and coordinates the state/behavior owned by this UI boundary.
 */
function DetailAccordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-black/[.12]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="text-[8px] font-semibold uppercase tracking-[.17em]">{title}</span>
        <span className={`grid h-7 w-7 place-items-center rounded-full border border-black/15 text-[16px] font-light transition duration-300 ${open ? "rotate-45 bg-black text-white" : ""}`}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="overflow-hidden"
          >
            <div className="max-w-[620px] pb-6 text-[12px] leading-7 text-black/65">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Renders the Product Skeleton component and coordinates the state/behavior owned by this UI boundary.
 */
function ProductSkeleton() {
  return (
    <main className="bg-[#fffaf1] px-[clamp(22px,5vw,78px)] py-[clamp(55px,7vw,95px)]">
      <div className="mx-auto grid max-w-[1440px] animate-pulse grid-cols-[1.05fr_.95fr] gap-[clamp(45px,7vw,110px)] max-[900px]:grid-cols-1">
        <div className="aspect-square bg-black/[.055]" />
        <div className="pt-8">
          <div className="h-2 w-28 bg-black/[.06]" />
          <div className="mt-7 h-24 w-4/5 bg-black/[.06]" />
          <div className="mt-8 h-4 w-32 bg-black/[.06]" />
          <div className="mt-7 h-16 w-full bg-black/[.06]" />
          <div className="mt-10 h-14 w-full bg-black/[.06]" />
        </div>
      </div>
    </main>
  );
}

/**
 * Formats tag for consistent presentation/output.
 */
function formatTag(tag = "") {
  return tag.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * Renders the Detail List component and coordinates the state/behavior owned by this UI boundary.
 */
function DetailList({ items = [] }) {
  if (!items.length) return null;

  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="grid grid-cols-[26px_1fr] gap-3">
          <span className="pt-[2px] text-[7px] font-semibold tracking-[.12em] text-[#d13c3c]">{String(index + 1).padStart(2, "0")}</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Renders the Ingredient List component and coordinates the state/behavior owned by this UI boundary.
 */
function IngredientList({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="rounded-full border border-black/10 bg-white/45 px-3 py-2 text-[8px] leading-4 text-black/60">
          {item}
        </span>
      ))}
    </div>
  );
}

/**
 * Renders the Product component and coordinates the state/behavior owned by this UI boundary.
 */
export default function Product() {
  const { id } = useParams();
  const { addItem, refreshAvailability } = useCart();
  const { customer, isWishlisted, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  usePageSeo(product ? {
    title: `${product.name} | Beyonist`,
    description: product.shortDescription || product.description?.slice(0, 155) || `Explore ${product.name} by Beyonist.`,
    image: product.images?.[0] || "/images/product-hamper.webp",
    canonicalPath: `/product/${product.slug || id}`,
    type: "product",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.shortDescription || product.description,
      image: product.images || [],
      sku: product.slug || id,
      brand: { "@type": "Brand", name: "Beyonist" },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: Number(product.price || 0),
        availability: Number(product.stock) > 0 && product.isActive !== false
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: `${window.location.origin}/product/${product.slug || id}`,
      },
      ...(Number(product.rating) > 0 && Number(product.reviewCount) > 0 ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: Number(product.rating),
          reviewCount: Number(product.reviewCount),
        },
      } : {}),
    },
  } : null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setProduct(null);
    setRelated([]);
    setReviews([]);
    setQuantity(1);
    setActiveImage(0);

    getProduct(id)
      .then((response) => {
        if (!active) return;
        setProduct(response.data);
        setRelated(response.related || []);
        setReviews(response.reviews || []);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message || "Unable to load this product.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    const productImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    return productImages.length ? productImages : ["/images/product-hamper.webp"];
  }, [product]);

  const tags = useMemo(() => (product?.tags || []).slice(0, 3), [product]);

  /**
   * Implements the add to bag operation used by this module.
   */
  const addToBag = () => {
    if (!product || product.isActive === false || Number(product.stock) <= 0) return;

    const didAdd = addItem(product, quantity);
    if (!didAdd) return;

    setAdded(true);
    refreshAvailability().catch(() => {});
    window.setTimeout(() => setAdded(false), 1500);
  };

  const toggleSavedProduct = async () => {
    try {
      const result = await toggleWishlist(product?.slug || id);
      if (!result?.authenticated) {
        navigate("/login", { state: { from: `/product/${id}` } });
      }
    } catch {
      // AuthContext restores the previous wishlist state on failure.
    }
  };

  if (loading) return <ProductSkeleton />;

  if (error || !product) {
    return (
      <main className="grid min-h-[68vh] place-items-center bg-[#fffaf1] px-6 py-20 text-center">
        <div className="max-w-[760px]">
          <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Product unavailable</span>
          <h1 className="mt-5 font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.9] tracking-[-.055em]">This formula is not on the shelf.</h1>
          <p className="mx-auto mt-6 max-w-xl text-[12px] leading-7 text-black/65">{error || "The product could not be found."}</p>
          <Link to="/shop" className="mt-8 inline-flex min-w-[220px] items-center justify-between bg-black px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em] text-white">
            <span>Return to collection</span><span>↗</span>
          </Link>
        </div>
      </main>
    );
  }

  const hasDiscount = Number(product.compareAtPrice) > Number(product.price);
  const outOfStock = product.isActive === false || Number(product.stock) <= 0;
  const stockLabel = product.stock > 8 ? "In stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of stock";
  const saved = isWishlisted(product.slug || id);

  return (
    <main className="bg-[#fffaf1]">
      {/* Section 1: Home. */}
      <section className="border-b border-black/10 px-[clamp(22px,5vw,78px)]">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 py-4 text-[7px] uppercase tracking-[.14em] text-black/65">
          <Link to="/" className="transition hover:text-black">Home</Link><span>/</span>
          <Link to="/shop" className="transition hover:text-black">Shop</Link><span>/</span>
          <span className="truncate text-black/70">{product.name}</span>
        </div>
      </section>

      {/* Section 2: Page section 2. */}

      <section className="px-[clamp(22px,5vw,78px)] py-[clamp(42px,6vw,88px)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[1.08fr_.92fr] gap-[clamp(42px,7vw,110px)] max-[900px]:grid-cols-1">
          <div className="min-w-0">
            <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-4 max-[620px]:grid-cols-1">
              {images.length > 1 ? (
                <div className="flex flex-col gap-3 max-[620px]:order-2 max-[620px]:flex-row">
                  {images.map((image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      onClick={() => setActiveImage(index)}
                      aria-label={`View image ${index + 1}`}
                      className={`grid aspect-square w-[76px] place-items-center overflow-hidden border bg-[#ffffff] p-1.5 transition max-[620px]:w-[68px] ${activeImage === index ? "border-black" : "border-black/10 hover:border-black/35"}`}
                    >
                      <img {...responsiveImageProps(image, "82px")} alt="" className="h-full w-full object-contain" width="800" height="800" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              ) : null}

              <motion.div
                key={images[activeImage]}
                initial={{ opacity: 0.45, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className={`relative grid aspect-square min-w-0 place-items-center overflow-hidden bg-[#faf6af] ${images.length > 1 ? "" : "col-span-2 max-[620px]:col-span-1"}`}
              >
                <div className="pointer-events-none absolute inset-[8%] rounded-full border border-black/[.07]" />
                <div className="pointer-events-none absolute inset-[22%] rounded-full border border-black/[.06]" />
                <img {...responsiveImageProps(images[activeImage], "(max-width: 900px) 92vw, 48vw")} alt={product.name} className="relative z-[2] h-full w-full object-contain object-center p-[clamp(14px,4vw,50px)] drop-shadow-[0_28px_35px_rgba(60,30,10,.14)]" width="800" height="800" loading="eager" fetchPriority="high" decoding="async" />
                {outOfStock ? (
                  <span className="absolute left-4 top-4 z-10 bg-[#111] px-3 py-2 text-[7px] font-semibold uppercase tracking-[.15em] text-white">Out of stock</span>
                ) : product.badge ? (
                  <span className="absolute left-4 top-4 z-10 bg-white px-3 py-2 text-[7px] font-semibold uppercase tracking-[.15em]">{product.badge}</span>
                ) : null}
                <span className="absolute bottom-4 right-4 z-10 text-[7px] uppercase tracking-[.15em] text-black/65">{String(activeImage + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
              </motion.div>
            </div>

            <div className="mt-5 grid grid-cols-3 border border-black/10 bg-[#ffffff]/45 max-[620px]:grid-cols-1">
              <div className="border-r border-black/10 p-5 max-[620px]:border-b max-[620px]:border-r-0">
                <span className="text-[6px] uppercase tracking-[.16em] text-black/65">Category</span>
                <strong className="mt-2 block font-[Georgia] text-[18px] font-normal">{product.category}</strong>
              </div>
              <div className="border-r border-black/10 p-5 max-[620px]:border-b max-[620px]:border-r-0">
                <span className="text-[6px] uppercase tracking-[.16em] text-black/65">Customer rating</span>
                <strong className="mt-2 block font-[Georgia] text-[18px] font-normal">★ {Number(product.rating || 0).toFixed(1)} <small className="font-sans text-[9px] text-black/65">({product.reviewCount || 0})</small></strong>
              </div>
              <div className="p-5">
                <span className="text-[6px] uppercase tracking-[.16em] text-black/65">Availability</span>
                <strong className={`mt-2 block font-[Georgia] text-[18px] font-normal ${outOfStock ? "text-[#d13c3c]" : "text-black"}`}>{stockLabel}</strong>
              </div>
            </div>
          </div>

          <div className="self-start max-[900px]:pt-5 min-[901px]:sticky min-[901px]:top-[138px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">{product.category} / Beyonist</span>
              <button
                type="button"
                onClick={toggleSavedProduct}
                aria-label={!customer ? "Sign in to save to wishlist" : saved ? "Remove from wishlist" : "Save to wishlist"}
                className={`grid h-10 w-10 place-items-center rounded-full border transition ${saved ? "border-[#d13c3c] bg-[#d13c3c] text-white" : "border-black/15 hover:border-black"}`}
              >
                <HeartIcon filled={saved} />
              </button>
            </div>

            <h1 className="mt-6 max-w-[760px] font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.9] tracking-[-.055em]">{product.name}</h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-black/10 pb-6">
              <div className="flex items-baseline gap-3">
                <strong className="font-[Georgia] text-[26px] font-normal">₹{product.price}</strong>
                {hasDiscount ? <span className="text-[12px] text-black/65 line-through">₹{product.compareAtPrice}</span> : null}
              </div>
              {hasDiscount ? <span className="bg-[#d13c3c] px-2.5 py-1.5 text-[7px] font-semibold uppercase tracking-[.13em] text-white">Save ₹{product.compareAtPrice - product.price}</span> : null}
            </div>

            <p className="mt-7 max-w-[650px] font-[Georgia] text-[clamp(20px,2vw,28px)] leading-[1.35] text-black/75">{product.shortDescription || product.description}</p>
            {product.shortDescription && product.description !== product.shortDescription ? <p className="mt-5 max-w-[620px] text-[12px] leading-7 text-black/65">{product.description}</p> : null}

            {outOfStock ? (
              <div className="mt-7 border border-[#d13c3c]/25 bg-[#d13c3c]/[.06] p-4">
                <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-[#d13c3c]">Out of stock</span>
                <p className="mt-2 text-[10px] leading-5 text-black/65">This formula is currently unavailable and cannot be added to your bag or ordered until stock is restored.</p>
              </div>
            ) : null}

            {tags.length ? (
              <div className="mt-7 flex flex-wrap gap-2">
                {tags.map((tag) => <span key={tag} className="rounded-full border border-black/[.12] bg-white/30 px-3 py-2 text-[7px] uppercase tracking-[.13em] text-black/65">{formatTag(tag)}</span>)}
              </div>
            ) : null}

            <div className="mt-9 grid grid-cols-[132px_minmax(0,1fr)] gap-3 max-[520px]:grid-cols-1">
              <div className={`grid h-[58px] grid-cols-3 border border-black/15 bg-white/35 ${outOfStock ? "pointer-events-none opacity-35" : ""}`}>
                <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid place-items-center transition hover:bg-white disabled:opacity-25"><MinusIcon /></button>
                <span className="grid place-items-center border-x border-black/10 font-[Georgia] text-[17px]">{quantity}</span>
                <button type="button" aria-label="Increase quantity" disabled={quantity >= Math.max(product.stock || 1, 1)} onClick={() => setQuantity((value) => Math.min(Math.max(product.stock || 1, 1), value + 1))} className="grid place-items-center transition hover:bg-white disabled:opacity-25"><PlusIcon /></button>
              </div>
              <button
                type="button"
                disabled={outOfStock}
                onClick={addToBag}
                className={`flex h-[58px] items-center justify-between px-6 text-[8px] font-semibold uppercase tracking-[.15em] text-white transition disabled:cursor-not-allowed disabled:bg-black/30 ${added ? "bg-[#d13c3c]" : "bg-black hover:-translate-y-0.5"}`}
              >
                <span>{outOfStock ? "Out of stock" : added ? `${quantity} added to bag` : `Add to bag · ₹${product.price * quantity}`}</span>
                <span>{added ? "✓" : "↗"}</span>
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[7px] uppercase tracking-[.13em] text-black/65">
              <span>Complimentary shipping over ₹999</span><i className="h-px w-5 bg-black/20" /><span>Securely packed in India</span>
            </div>

            <div className="mt-9 border-t border-black/[.12]">
              <DetailAccordion title="Formula details" defaultOpen>
                <p>{product.description}</p>
              </DetailAccordion>

              {product.ingredients?.length ? (
                <DetailAccordion title={`Ingredients · ${product.ingredients.length}`}>
                  <IngredientList items={product.ingredients} />
                </DetailAccordion>
              ) : null}

              {product.howToUse?.length ? (
                <DetailAccordion title="How to use">
                  <DetailList items={product.howToUse} />
                </DetailAccordion>
              ) : null}

              {product.benefits?.length ? (
                <DetailAccordion title="Benefits">
                  <DetailList items={product.benefits} />
                </DetailAccordion>
              ) : null}

              {product.cautions?.length ? (
                <DetailAccordion title="Cautions">
                  <DetailList items={product.cautions} />
                </DetailAccordion>
              ) : null}

              <DetailAccordion title="Delivery & returns">
                <p>Orders are packed for delivery across India. Complimentary shipping applies to qualifying orders above ₹999. For return eligibility and timelines, review the Returns & Refunds policy before opening or using the product.</p>
              </DetailAccordion>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The formula in context / 01. */}

      <section className="overflow-hidden bg-[#bd3034] px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)] text-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[.78fr_1.22fr] items-center gap-[clamp(50px,8vw,130px)] max-[850px]:grid-cols-1">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-white/90">The formula in context / 01</span>
            <h2 className="mt-6 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.88] tracking-[-.06em]">One formula.<br/><em className="font-normal text-black">A clearer ritual.</em></h2>
            <p className="mt-7 max-w-[520px] text-[13px] leading-7 text-white/90">{product.description}</p>
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="mt-8 inline-flex min-w-[235px] items-center justify-between bg-black px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em]">
              <span>Explore {product.category}</span><span>↗</span>
            </Link>
          </div>
          <div className="relative grid min-h-[520px] place-items-center overflow-hidden bg-[#f1d4bf] max-[600px]:min-h-[380px]">
            <div className="absolute left-1/2 top-1/2 aspect-square w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10" />
            <div className="absolute left-1/2 top-1/2 aspect-square w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10" />
            <img {...responsiveImageProps(images[0], "(max-width: 800px) 92vw, 48vw")} alt="" className="relative z-[2] h-full max-h-[570px] w-full object-contain p-[clamp(24px,6vw,78px)] drop-shadow-[0_35px_45px_rgba(70,0,5,.18)]" width="800" height="800" loading="lazy" decoding="async" />
            <span className="absolute right-5 top-5 bg-white px-3 py-2 text-[7px] uppercase tracking-[.15em] text-black">{product.category}</span>
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf1] px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
        <div className="mx-auto max-w-[1440px]"><div className="grid grid-cols-[1fr_340px] items-end gap-10 border-b border-black/10 pb-8 max-[760px]:grid-cols-1"><div><span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Verified purchase reviews</span><h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.05em]">What buyers say<br/><em className="font-normal text-[#d13c3c]">after delivery.</em></h2></div><div className="pb-2"><strong className="font-[Georgia] text-[44px] font-normal">{Number(product.rating||0).toFixed(1)}</strong><div className="text-[18px] text-[#fbbc04]">{"★".repeat(Math.round(Number(product.rating||0)))}<span className="text-black/10">{"★".repeat(5-Math.round(Number(product.rating||0)))}</span></div><span className="mt-2 block text-[7px] uppercase tracking-[.12em] text-black/65">{product.reviewCount||0} published review(s)</span></div></div>
        {reviews.length?<div className="mt-8 grid grid-cols-3 gap-4 max-[1050px]:grid-cols-2 max-[680px]:grid-cols-1">{reviews.map(review=><article key={review._id} className="border border-black/10 bg-[#ffffff] p-5"><div className="flex items-center justify-between gap-4"><div><strong className="text-[9px]">{review.displayName||"Verified customer"}</strong><span className="mt-1 block text-[6px] uppercase tracking-[.12em] text-[#3b7644]">✓ Verified purchase</span></div><span className="text-[15px] text-[#fbbc04]">{"★".repeat(review.rating)}</span></div><strong className="mt-5 block font-[Georgia] text-[22px] font-normal">{review.title||product.name}</strong><p className="mt-3 text-[10px] leading-6 text-black/65">{review.body}</p><span className="mt-5 block text-[6px] uppercase tracking-[.12em] text-black/65">{new Date(review.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span></article>)}</div>:<div className="mt-8 border border-black/10 bg-[#ffffff] p-8 font-[Georgia] text-[27px]">No published reviews yet. Delivered customers can be the first to review this formula.</div>}
        </div>
      </section>

      {related.length ? (
        <section className="bg-[#ffffff] px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-12 grid grid-cols-[1fr_320px] items-end gap-10 max-[720px]:grid-cols-1">
              <div>
                <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Continue the edit / 02</span>
                <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.05em]">You may also<br/><em className="font-normal text-[#d13c3c]">reach for.</em></h2>
              </div>
              <div className="pb-2 text-[11px] leading-6 text-black/65">
                <p>More formulas from the Beyonist shelf, selected from the live catalogue.</p>
                <Link to="/shop" className="mt-5 inline-block border-b border-black pb-1 text-[8px] uppercase tracking-[.14em] text-black">View all products ↗</Link>
              </div>
            </div>
            <div className={`grid items-stretch gap-x-[clamp(14px,2vw,28px)] gap-y-12 ${related.length >= 4 ? "grid-cols-4 max-[1050px]:grid-cols-2" : "grid-cols-3 max-[900px]:grid-cols-2"} max-[520px]:grid-cols-1`}>
              {related.map((item, index) => <ShopProductCard key={item._id || item.slug} product={item} index={index} />)}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
