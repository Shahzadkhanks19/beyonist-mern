/**
 * Customer-facing Cart page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../context/CartContext.jsx";
import { responsiveImageProps } from "../utils/productImagePath.js";

const FREE_SHIPPING_THRESHOLD = 999;

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
 * Renders the Trash Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function TrashIcon() {
  return <svg viewBox="0 0 18 18" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.4]" aria-hidden="true"><path d="M3.5 5h11M7 5V3.5h4V5M5.2 5l.7 9.2h6.2l.7-9.2M7.4 7.5v4.2M10.6 7.5v4.2" /></svg>;
}

/**
 * Renders the Cart Item component and coordinates the state/behavior owned by this UI boundary.
 */
function CartItem({ item, setQuantity, removeItem, index }) {
  const unavailable = item.available === false || item.isActive === false || Number(item.stock) <= 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: .25 }}
      className="grid grid-cols-[170px_minmax(0,1fr)_auto] gap-[clamp(18px,3vw,36px)] border-b border-black/10 py-7 max-[720px]:grid-cols-[110px_1fr] max-[720px]:gap-4"
    >
      <Link to={`/product/${item.slug}`} className="relative grid aspect-square place-items-center overflow-hidden bg-[#eee6dc]">
        <img {...responsiveImageProps(item.image, "180px")} alt={item.name} className={`h-full w-full object-contain p-2 ${unavailable ? "opacity-40 grayscale-[.15]" : ""}`}  width="800" height="800" loading="lazy" decoding="async" />
        {unavailable ? <span className="absolute inset-x-2 bottom-2 bg-black px-2 py-2 text-center text-[6px] font-semibold uppercase tracking-[.12em] text-white">Out of stock</span> : null}
        <span className="absolute left-2 top-2 bg-[#ffffff] px-2 py-1.5 text-[6px] uppercase tracking-[.13em]">{String(index + 1).padStart(2, "0")}</span>
      </Link>

      <div className="flex min-w-0 flex-col justify-between py-1">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-[#d13c3c]">{item.category}</span>
              <h2 className="mt-2 font-[Georgia] text-[clamp(25px,3vw,38px)] font-normal leading-[1] tracking-[-.035em]">
                <Link to={`/product/${item.slug}`} className="transition hover:text-[#d13c3c]">{item.name}</Link>
              </h2>
            </div>
            <button type="button" onClick={() => removeItem(item.slug)} aria-label={`Remove ${item.name} from cart`} className="hidden items-center gap-2 border border-[#d13c3c]/25 px-3 py-2 text-[7px] font-semibold uppercase tracking-[.12em] text-[#d13c3c] transition hover:bg-[#d13c3c] hover:text-white min-[721px]:flex"><TrashIcon /> Remove</button>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <strong className="text-[12px] font-semibold">₹{item.price}</strong>
            {item.compareAtPrice > item.price ? <span className="text-[9px] text-black/65 line-through">₹{item.compareAtPrice}</span> : null}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div className={`grid h-10 w-[116px] grid-cols-3 border border-black/15 bg-white/45 ${unavailable ? "pointer-events-none opacity-35" : ""}`}>
            <button type="button" onClick={() => setQuantity(item.slug, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={`Decrease ${item.name} quantity`} className="grid place-items-center transition hover:bg-white disabled:opacity-25"><MinusIcon /></button>
            <span className="grid place-items-center border-x border-black/10 font-[Georgia] text-[15px]">{item.quantity}</span>
            <button type="button" onClick={() => setQuantity(item.slug, item.quantity + 1)} disabled={item.quantity >= Math.max(item.stock || 99, 1)} aria-label={`Increase ${item.name} quantity`} className="grid place-items-center transition hover:bg-white disabled:opacity-25"><PlusIcon /></button>
          </div>
          <span className={`text-[7px] font-semibold uppercase tracking-[.13em] ${unavailable ? "text-[#d13c3c]" : "text-black/65"}`}>
            {unavailable ? "Out of stock — remove to checkout" : item.stock <= 5 ? `Only ${item.stock} left` : "In stock"}
          </span>
          <button type="button" onClick={() => removeItem(item.slug)} aria-label={`Remove ${item.name} from cart`} className="flex items-center gap-2 border border-[#d13c3c]/25 px-3 py-2 text-[7px] font-semibold uppercase tracking-[.12em] text-[#d13c3c] min-[721px]:hidden"><TrashIcon /> Remove item</button>
        </div>
      </div>

      <div className="min-w-[92px] pt-1 text-right max-[720px]:col-start-2 max-[720px]:min-w-0 max-[720px]:pt-0 max-[720px]:text-left">
        <span className="text-[6px] uppercase tracking-[.14em] text-black/65">Line total</span>
        <strong className="mt-2 block font-[Georgia] text-[22px] font-normal">₹{item.price * item.quantity}</strong>
      </div>
    </motion.article>
  );
}

/**
 * Renders the Cart component and coordinates the state/behavior owned by this UI boundary.
 */
export default function Cart() {
  const { items, itemCount, subtotal, savings, hasUnavailableItems, unavailableItems, setQuantity, removeItem, clearCart, refreshAvailability } = useCart();
  const [promo, setPromo] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const shippingUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const estimatedTotal = subtotal;

  /**
   * Removes unavailable items from the current workflow.
   */
  const removeUnavailableItems = () => {
    unavailableItems.forEach((item) => removeItem(item.slug));
  };

  useEffect(() => {
    refreshAvailability().catch(() => {});
  }, []);

  /**
   * Implements the apply promo operation used by this module.
   */
  const applyPromo = (event) => {
    event.preventDefault();
    if (!promo.trim()) {
      setPromoMessage("Enter a promo code first.");
      return;
    }
    setPromoMessage("Promo codes will be validated securely during checkout.");
  };

  const ritualSummary = useMemo(() => {
    const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];
    return categories.slice(0, 3).join(" · ");
  }, [items]);

  if (!items.length) {
    return (
      <main className="bg-[#fffaf1]">
        {/* Section 1: Your Cart / Empty. */}
        <section className="relative overflow-hidden bg-[#111] px-[clamp(22px,5vw,78px)] min-h-[540px] py-[clamp(44px,5vw,68px)] text-white">
          <div className="pointer-events-none absolute inset-0 opacity-25">
            <div className="absolute left-1/2 top-1/2 aspect-square w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[.12]" />
            <div className="absolute left-1/2 top-1/2 aspect-square w-[36vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[.08]" />
          </div>
          <div className="relative mx-auto grid max-w-[1320px] grid-cols-[.8fr_1.2fr] items-center gap-[clamp(45px,8vw,120px)] max-[850px]:grid-cols-1">
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#d13c3c]">Your Cart / Empty</span>
              <h1 className="mt-5 font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.82] tracking-[-.065em]">Nothing here.<br/><em className="font-normal text-[#d13c3c]">Yet.</em></h1>
              <p className="mt-5 max-w-[520px] text-[13px] leading-7 text-black/65">Build a smaller, clearer ritual from the Beyonist collection.</p>
              <Link to="/shop" className="mt-9 inline-flex min-w-[225px] items-center justify-between bg-[#d13c3c] px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em] text-white"><span>Explore the collection</span><span>↗</span></Link>
            </div>
            <div className="relative grid min-h-[420px] place-items-center overflow-hidden bg-[#d6b9bc] max-[600px]:min-h-[360px]">
              <img src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist skincare collection" loading="lazy" className="relative z-[2] h-full w-full object-contain p-[clamp(24px,6vw,78px)] drop-shadow-[0_35px_45px_rgba(0,0,0,.2)]"  width="1000" height="1000" decoding="async"/>
              <span className="absolute right-5 top-5 bg-black px-4 py-3 text-[7px] uppercase tracking-[.15em]">Start your ritual / 01</span>
            </div>
          </div>
        </section>
        <div className="h-3 bg-[#d13c3c]" />
      </main>
    );
  }

  return (
    <main className="bg-[#fffaf1]">
      {/* Section 2: Your ritual,. */}
      <section className="border-b border-black/10 bg-[#d13c3c] px-[clamp(22px,5vw,78px)] py-[clamp(52px,6vw,82px)] text-white">
        <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-10 max-[720px]:items-start max-[720px]:flex-col">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.19em] text-white/90">Your Cart / {String(itemCount).padStart(2, "0")} items</span>
            <h1 className="mt-4 font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.84] tracking-[-.06em]">Your ritual,<br/><em className="font-normal text-black">so far.</em></h1>
          </div>
          <div className="max-w-[420px] pb-2">
            <p className="text-[11px] leading-6 text-white/90">{ritualSummary || "Beyonist skincare"} — review quantities before moving into checkout.</p>
            <button type="button" onClick={clearCart} className="mt-4 border-b border-white/55 pb-1 text-[7px] font-semibold uppercase tracking-[.14em]">Clear cart</button>
          </div>
        </div>
      </section>

      {/* Section 3: Cart needs attention. */}

      <section className="px-[clamp(22px,5vw,78px)] py-[clamp(55px,7vw,96px)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1.35fr)_minmax(330px,.65fr)] gap-[clamp(45px,6vw,90px)] max-[980px]:grid-cols-1">
          <div>
            {hasUnavailableItems ? (
              <div className="mb-5 border border-[#d13c3c]/25 bg-[#d13c3c]/[.06] p-4">
                <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-[#d13c3c]">Cart needs attention</span>
                <div className="flex items-end justify-between gap-4 max-[620px]:items-start max-[620px]:flex-col">
                  <p className="mt-2 text-[9px] leading-5 text-black/65">{unavailableItems.length} item(s) are out of stock or no longer available. Remove them before checkout.</p>
                  <button type="button" onClick={removeUnavailableItems} className="shrink-0 border border-[#d13c3c]/25 px-3 py-2 text-[7px] font-semibold uppercase tracking-[.12em] text-[#d13c3c] transition hover:bg-[#d13c3c] hover:text-white">Remove unavailable</button>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between border-b border-black pb-4">
              <span className="text-[8px] font-semibold uppercase tracking-[.17em]">Bag / {itemCount} items</span>
              <Link to="/shop" className="text-[7px] font-semibold uppercase tracking-[.13em] text-black/65 transition hover:text-black">Continue shopping ↗</Link>
            </div>

            <AnimatePresence initial={false}>
              {items.map((item, index) => (
                <CartItem key={item.slug} item={item} index={index} setQuantity={setQuantity} removeItem={removeItem} />
              ))}
            </AnimatePresence>
          </div>

          <aside className="self-start min-[981px]:sticky min-[981px]:top-[140px]">
            <div className="overflow-hidden border border-black/10 bg-[#ffffff] shadow-[0_24px_65px_rgba(0,0,0,.06)]">
              <div className="bg-[#111] px-6 py-6 text-white">
                <span className="text-[7px] font-semibold uppercase tracking-[.16em] text-[#d13c3c]">Order summary / 01</span>
                <h2 className="mt-3 font-[Georgia] text-[35px] font-normal leading-none">Almost yours.</h2>
              </div>

              <div className="p-6">
                <div className="border-b border-black/10 pb-5">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-black/65">Subtotal</span>
                    <strong>₹{subtotal}</strong>
                  </div>
                  {savings > 0 ? (
                    <div className="mt-3 flex items-center justify-between text-[9px] text-[#d13c3c]">
                      <span>Product savings</span><strong>−₹{savings}</strong>
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between text-[9px]">
                    <span className="text-black/65">Shipping</span>
                    <strong>{shippingUnlocked ? "Complimentary" : "Calculated at checkout"}</strong>
                  </div>
                </div>

                <div className="py-5">
                  <div className="flex items-center justify-between text-[7px] uppercase tracking-[.13em]">
                    <span className={shippingUnlocked ? "text-[#d13c3c]" : "text-black/65"}>
                      {shippingUnlocked ? "Complimentary shipping unlocked" : `₹${remaining} away from complimentary shipping`}
                    </span>
                    <span>{Math.round(shippingProgress)}%</span>
                  </div>
                  <div className="mt-3 h-1 overflow-hidden bg-black/10">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${shippingProgress}%` }} className="h-full bg-[#d13c3c]" />
                  </div>
                </div>

                <form onSubmit={applyPromo} className="border-y border-black/10 py-5">
                  <span className="text-[7px] font-semibold uppercase tracking-[.14em] text-black/65">Promo code</span>
                  <div className="mt-3 grid grid-cols-[1fr_auto] border border-black/15 bg-white">
                    <input value={promo} onChange={(event) => { setPromo(event.target.value.toUpperCase()); setPromoMessage(""); }} placeholder="ENTER CODE" className="min-w-0 bg-transparent px-4 py-3 text-[9px] uppercase tracking-[.12em] outline-none placeholder:text-black/65" />
                    <button className="bg-black px-4 text-[7px] font-semibold uppercase tracking-[.13em] text-white transition hover:bg-[#d13c3c]">Apply</button>
                  </div>
                  {promoMessage ? <p className="mt-2 text-[8px] leading-4 text-black/65">{promoMessage}</p> : null}
                </form>

                <div className="flex items-end justify-between gap-4 py-6">
                  <div>
                    <span className="text-[7px] uppercase tracking-[.14em] text-black/65">Estimated total</span>
                    <p className="mt-1 text-[8px] text-black/65">Taxes and shipping finalised at checkout.</p>
                  </div>
                  <strong className="font-[Georgia] text-[32px] font-normal">₹{estimatedTotal}</strong>
                </div>

                {hasUnavailableItems ? (
                  <button type="button" onClick={removeUnavailableItems} className="flex w-full items-center justify-between bg-[#d13c3c] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.15em] text-white transition hover:bg-black">
                    <span>Remove out-of-stock items</span><TrashIcon />
                  </button>
                ) : (
                  <Link to="/checkout" className="group flex w-full items-center justify-between bg-[#d13c3c] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.15em] text-white transition hover:bg-black">
                    <span>Continue to checkout</span><span className="transition-transform group-hover:translate-x-1">↗</span>
                  </Link>
                )}

                <div className="mt-4 flex items-center justify-center gap-3 text-[6px] uppercase tracking-[.12em] text-black/65">
                  <span>Secure checkout</span><i className="h-px w-4 bg-black/15" /><span>India</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 border-l border-t border-black/10 bg-[#ffffff]">
              <Link to="/shipping-policy" className="border-b border-r border-black/10 p-5 transition hover:bg-white">
                <span className="text-[6px] uppercase tracking-[.14em] text-black/65">01 / Delivery</span>
                <strong className="mt-5 block font-[Georgia] text-[20px] font-normal">Shipping policy ↗</strong>
              </Link>
              <Link to="/return-refund-policy" className="border-b border-r border-black/10 p-5 transition hover:bg-white">
                <span className="text-[6px] uppercase tracking-[.14em] text-black/65">02 / Care</span>
                <strong className="mt-5 block font-[Georgia] text-[20px] font-normal">Returns & refunds ↗</strong>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Section 4: Need another formula. */}

      <section className="bg-[#111] px-[clamp(22px,5vw,78px)] py-[clamp(58px,7vw,90px)] text-white">
        <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-10 max-[700px]:items-start max-[700px]:flex-col">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Need another formula?</span>
            <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">Keep the ritual<br/><em className="font-normal text-[#d13c3c]">intentional.</em></h2>
          </div>
          <Link to="/shop" className="inline-flex min-w-[220px] items-center justify-between border border-white/20 px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em] transition hover:bg-white hover:text-black"><span>Back to shop</span><span>↗</span></Link>
        </div>
      </section>

      <div className="h-3 bg-[#d13c3c]" aria-hidden="true" />
    </main>
  );
}
