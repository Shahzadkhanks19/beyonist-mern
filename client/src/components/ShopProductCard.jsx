/**
 * Reusable storefront component for shop product card. Encapsulates shared UI behavior so page files stay focused on page composition.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { responsiveImageProps } from "../utils/productImagePath.js";

/**
 * Renders the Heart Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function HeartIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px]" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

/**
 * Renders the Shop Product Card component and coordinates the state/behavior owned by this UI boundary.
 */
export default function ShopProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const { customer, isWishlisted, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const image = product.images?.[0] || product.image || "/images/product-hamper.webp";
  const slug = product.slug || product.id;
  const outOfStock = product.isActive === false || Number(product.stock) <= 0;
  const saved = isWishlisted(slug);

  /**
   * Implements the toggle saved operation used by this module.
   */
  const toggleSaved = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const result = await toggleWishlist(slug);
      if (!result?.authenticated) {
        navigate("/login", { state: { from: `${window.location.pathname}${window.location.search}` } });
      }
    } catch {
      // Optimistic wishlist state is reverted by AuthContext when the API fails.
    }
  };

  /**
   * Implements the quick add operation used by this module.
   */
  const quickAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (outOfStock) return;

    const didAdd = addItem(product, 1);
    if (!didAdd) return;

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <motion.article
      className="group store-card flex h-full min-w-0 flex-col overflow-hidden rounded-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.045, 0.25) }}
    >
      <Link to={`/product/${slug}`} className="warm-product-surface relative grid aspect-square place-items-center overflow-hidden border-b border-black/10">
        <img
          {...responsiveImageProps(image, "(max-width: 560px) 92vw, (max-width: 1150px) 46vw, 30vw")}
          alt={product.name}
          loading={index < 3 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : undefined}
          className={`h-full w-full object-contain object-center p-2 transition duration-700 ease-out ${outOfStock ? "opacity-45 grayscale-[.15]" : "group-hover:scale-[1.025]"}`}
         width="800" height="800" decoding="async" />
        {outOfStock ? <div className="pointer-events-none absolute inset-0 z-[5] bg-white/10" /> : null}

        {outOfStock ? (
          <span className="absolute left-3 top-3 z-10 bg-[#111] px-2.5 py-2 text-[7px] font-semibold uppercase tracking-[.14em] text-white">
            Out of stock
          </span>
        ) : product.badge ? (
          <span className="absolute left-3 top-3 z-10 bg-white px-2.5 py-2 text-[7px] font-semibold uppercase tracking-[.14em] text-black">
            {product.badge}
          </span>
        ) : null}

        <button
          type="button"
          onClick={toggleSaved}
          aria-label={!customer ? `Sign in to save ${product.name}` : saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={`absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border bg-white/90 backdrop-blur transition ${saved ? "border-[#d13c3c] text-[#d13c3c]" : "border-black/10 text-black hover:border-black"}`}
        >
          <HeartIcon filled={saved} />
        </button>

        <div className="absolute bottom-3 left-3 hidden text-[7px] uppercase tracking-[.13em] text-black/65 min-[760px]:block">
          {String(index + 1).padStart(2, "0")}
        </div>

        <button
          type="button"
          onClick={quickAdd}
          disabled={outOfStock}
          aria-disabled={outOfStock}
          className={`absolute inset-x-3 bottom-3 z-20 flex items-center justify-between px-4 py-3 text-[8px] font-semibold uppercase tracking-[.14em] text-white transition duration-200 ${
            outOfStock
              ? "cursor-not-allowed bg-black/55"
              : added
                ? "bg-[#337144]"
                : "bg-[#d13c3c] hover:bg-[#171313]"
          }`}
        >
          <span>{outOfStock ? "Out of stock" : added ? "Added to bag" : "Quick add"}</span>
          <span>{outOfStock ? "—" : added ? "✓" : "+"}</span>
        </button>
      </Link>

      <div className="flex min-h-[182px] flex-1 flex-col px-4 pb-4 pt-4 max-[640px]:min-h-[164px]">
        <div className="flex items-start justify-between gap-3 text-[7px] uppercase tracking-[.13em] text-black/65">
          <span>{product.category}</span>
          {product.rating ? <span>★ {Number(product.rating).toFixed(1)}</span> : null}
        </div>
        <h2 className="mt-3 min-h-[2.45em] font-[Georgia] text-[clamp(18px,1.65vw,25px)] font-normal leading-[1.13] tracking-[-.025em]">
          <Link to={`/product/${slug}`} className="transition hover:text-[#d13c3c]">{product.name}</Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-[11px] leading-[1.65] text-black/65 max-[640px]:hidden">{product.shortDescription || product.description}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            {outOfStock ? <span className="mb-1.5 block text-[6.5px] font-semibold uppercase tracking-[.13em] text-[#d13c3c]">Out of stock</span> : null}
            <div className="flex items-baseline gap-2">
            <strong className="text-[12px] font-semibold">₹{product.price}</strong>
            {product.compareAtPrice > product.price ? <span className="text-[9px] text-black/65 line-through">₹{product.compareAtPrice}</span> : null}
            </div>
          </div>
          <Link to={`/product/${slug}`} className="text-[8px] uppercase tracking-[.13em] text-black/65 transition hover:text-black">View ↗</Link>
        </div>
      </div>
    </motion.article>
  );
}
