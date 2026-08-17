/**
 * Customer-facing Payment Failure page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";

/**
 * Renders the Payment Failure component and coordinates the state/behavior owned by this UI boundary.
 */
export default function PaymentFailure() {
  const { state } = useLocation();
  const title = state?.title || "The payment did not complete.";
  const message = state?.message || "No charge should be assumed from this page. Review your payment method or return to checkout and try again.";
  const returnTo = state?.returnTo || "/checkout";

  return (
    <main className="relative grid min-h-[74vh] place-items-center overflow-hidden bg-[#111] px-[clamp(22px,5vw,78px)] py-[clamp(64px,9vw,96px)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -right-[15%] -top-[45%] aspect-square w-[75vw] rounded-full border border-[#d13c3c]/60" />
        <div className="absolute right-[8%] top-[2%] aspect-square w-[38vw] rounded-full border border-white/15" />
      </div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto grid w-full max-w-[1180px] grid-cols-[.85fr_1.15fr] items-center gap-[clamp(45px,8vw,110px)] max-[820px]:grid-cols-1">
        <div>
          <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#d13c3c]">Payment / Not completed</span>
          <h1 className="mt-6 font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.84] tracking-[-.06em]">Not quite<br/><em className="font-normal text-[#d13c3c]">there.</em></h1>
        </div>

        <div className="border border-white/15 bg-white/[.04] p-[clamp(28px,5vw,58px)] backdrop-blur">
          <span className="text-[7px] font-semibold uppercase tracking-[.16em] text-white/90">What happened</span>
          <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4.5vw,58px)] font-normal leading-[.98]">{title}</h2>
          <p className="mt-6 max-w-[620px] text-[12px] leading-7 text-white/90">{message}</p>

          <div className="mt-8 border-y border-white/10 py-5 text-[9px] leading-5 text-white/90">
            Your cart has not been cleared by this failure state. You can return to checkout without rebuilding it.
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={returnTo} className="inline-flex min-w-[210px] flex-1 items-center justify-between bg-[#d13c3c] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white"><span>Return to checkout</span><span>↗</span></Link>
            <Link to="/contact" className="inline-flex min-w-[180px] flex-1 items-center justify-between border border-white/20 px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em]"><span>Get help</span><span>↗</span></Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
