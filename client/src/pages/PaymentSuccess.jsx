/**
 * Customer-facing Payment Success page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";

/**
 * Renders the Payment Success component and coordinates the state/behavior owned by this UI boundary.
 */
export default function PaymentSuccess() {
  const { state } = useLocation();
  const orderNumber = state?.orderNumber || "—";
  const total = state?.total;
  const method = state?.paymentMethod === "cod" ? "Cash on delivery" : "Online payment";

  return (
    <main className="bg-[#fffaf1]">
      {/* Section 1: Page section 1. */}
      <section className="relative grid min-h-[72vh] place-items-center overflow-hidden bg-[#d13c3c] px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <div className="absolute left-1/2 top-1/2 aspect-square w-[68vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35" />
          <div className="absolute left-1/2 top-1/2 aspect-square w-[38vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }} className="relative mx-auto grid w-full max-w-[1200px] grid-cols-[.8fr_1.2fr] items-center gap-[clamp(45px,8vw,120px)] max-[850px]:grid-cols-1">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-white/90">Order confirmed / 03</span>
            <h1 className="mt-6 font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.82] tracking-[-.065em]">It’s<br/><em className="font-normal text-black">official.</em></h1>
            <p className="mt-7 max-w-[520px] text-[13px] leading-7 text-white/68">Your Beyonist order has been created successfully. Keep the order number below for tracking and customer care.</p>
          </div>

          <div className="border border-white/20 bg-[#ffffff] p-[clamp(28px,5vw,60px)] text-black shadow-[0_35px_90px_rgba(0,0,0,.16)]">
            <span className="text-[7px] font-semibold uppercase tracking-[.16em] text-[#d13c3c]">Order reference</span>
            <strong className="mt-4 block font-[Georgia] text-[clamp(38px,5vw,64px)] font-normal leading-none">{orderNumber}</strong>

            <div className="mt-8 grid grid-cols-2 border-l border-t border-black/10 max-[560px]:grid-cols-1">
              <div className="border-b border-r border-black/10 p-5">
                <span className="text-[6px] uppercase tracking-[.14em] text-black/65">Payment</span>
                <strong className="mt-2 block font-[Georgia] text-[20px] font-normal">{method}</strong>
              </div>
              <div className="border-b border-r border-black/10 p-5">
                <span className="text-[6px] uppercase tracking-[.14em] text-black/65">Total</span>
                <strong className="mt-2 block font-[Georgia] text-[20px] font-normal">{total != null ? `₹${total}` : "Recorded with order"}</strong>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {orderNumber !== "—" ? (
                <Link to={`/track-order?order=${encodeURIComponent(orderNumber)}`} className="inline-flex min-w-[210px] flex-1 items-center justify-between bg-black px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white"><span>Track this order</span><span>↗</span></Link>
              ) : null}
              <Link to="/shop" className="inline-flex min-w-[180px] flex-1 items-center justify-between border border-black px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em]"><span>Back to shop</span><span>↗</span></Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 2: What happens next. */}

      <section className="bg-[#111] px-[clamp(22px,5vw,78px)] py-[clamp(52px,6vw,82px)] text-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-10 max-[700px]:items-start max-[700px]:flex-col">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">What happens next?</span>
            <h2 className="mt-3 font-[Georgia] text-[clamp(38px,4.5vw,60px)] font-normal">Preparation → Dispatch → Delivery.</h2>
          </div>
          <Link to="/contact" className="border-b border-white pb-1 text-[8px] font-semibold uppercase tracking-[.14em]">Need help? ↗</Link>
        </div>
      </section>
    </main>
  );
}
