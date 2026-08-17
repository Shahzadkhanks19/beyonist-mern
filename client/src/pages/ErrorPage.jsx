/**
 * Customer-facing Error Page page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Link } from "react-router-dom";
import { motion } from "motion/react";

/**
 * Renders the Error Page component and coordinates the state/behavior owned by this UI boundary.
 */
export default function ErrorPage({
  title = "Something slipped out of place.",
  message = "This part of Beyonist could not load correctly. Your cart and account data have not been intentionally cleared.",
  onRetry,
  compact = false,
}) {
  return (
    <main className={`relative overflow-hidden bg-[#fffaf1] text-[#111] ${compact ? "min-h-[66vh]" : "min-h-[calc(100dvh-112px)]"}`}>
      {/* Section 1: Page section 1. */}
      <section className="relative grid min-h-[inherit] place-items-center px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-[12%] -top-[38%] aspect-square w-[68vw] rounded-full border border-black/[.07]" />
          <div className="absolute right-[7%] top-[3%] aspect-square w-[38vw] rounded-full border border-black/[.045]" />
          <div className="absolute inset-y-0 left-1/4 w-px bg-black/[.035]" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-black/[.035]" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-black/[.035]" />
        </div>

        <div className="relative mx-auto grid w-full max-w-[1300px] grid-cols-[.8fr_1.2fr] items-center gap-[clamp(48px,8vw,110px)] max-[860px]:grid-cols-1">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .5 }}
          >
            <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#d13c3c]">Error / Recoverable</span>

            <div className="mt-7 flex items-end gap-5">
              <span className="font-[Georgia] text-[clamp(120px,15vw,220px)] font-normal leading-[.64] tracking-[-.08em] text-[#d13c3c]">!</span>
              <div className="pb-3">
                <span className="block text-[7px] uppercase tracking-[.16em] text-black/65">Interface status</span>
                <strong className="mt-2 block font-[Georgia] text-[clamp(24px,3vw,38px)] font-normal">Needs attention.</strong>
              </div>
            </div>

            <h1 className="mt-8 max-w-[720px] font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.88] tracking-[-.055em]">
              {title}
            </h1>

            <p className="mt-7 max-w-[620px] text-[11px] leading-7 text-black/65">{message}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="group inline-flex min-w-[210px] items-center justify-between bg-[#d13c3c] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white transition hover:bg-black"
                >
                  <span>Try again</span><span className="transition-transform group-hover:rotate-45">↻</span>
                </button>
              ) : null}

              <Link
                to="/"
                className="group inline-flex min-w-[190px] items-center justify-between border border-black px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em]"
              >
                <span>Return home</span><span className="transition-transform group-hover:translate-x-1">↗</span>
              </Link>

              <Link
                to="/contact"
                className="group inline-flex min-w-[190px] items-center justify-between border border-black/15 px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] transition hover:border-black"
              >
                <span>Get help</span><span className="transition-transform group-hover:translate-x-1">↗</span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22, rotate: 1.8 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: .58, delay: .08 }}
            className="relative min-h-[540px] max-[600px]:min-h-[390px]"
          >
            <div className="absolute inset-[4%_8%_8%_2%] -rotate-2 bg-[#d13c3c]" />
            <div className="absolute inset-[8%_3%_3%_9%] rotate-[1.5deg] bg-[#d8c0c2]" />

            <div className="absolute inset-[7%_7%] z-[2] overflow-hidden border border-black/[.06] bg-[#efe3da]">
              <div className="absolute left-1/2 top-1/2 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[.07]" />
              <img
                src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw"
                alt="Beyonist skincare collection" loading="eager" fetchPriority="high"
                className="relative z-[2] h-full w-full object-contain p-[clamp(28px,7vw,90px)] drop-shadow-[0_34px_45px_rgba(0,0,0,.18)]"
               width="1000" height="1000" decoding="async"/>
            </div>

            <div className="absolute left-[3%] top-[9%] z-[4] border-[6px] border-[#ffffff] bg-[#ffffff] p-2 text-black shadow-[0_22px_55px_rgba(0,0,0,.14)]">
              <span className="block text-[6px] uppercase tracking-[.14em] text-black/65">System note / 01</span>
              <strong className="mt-2 block max-w-[180px] font-[Georgia] text-[22px] font-normal leading-[1.05]">The shelf is still here.</strong>
            </div>

            <div className="absolute bottom-[8%] right-[2%] z-[4] bg-black px-5 py-4 text-white">
              <span className="block text-[6px] uppercase tracking-[.15em] text-white/90">Recovery</span>
              <strong className="mt-1 block font-[Georgia] text-[21px] font-normal">Retry or continue elsewhere. ↗</strong>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[6px] uppercase tracking-[.16em] text-black/65">
          Beyonist / Recoverable interface state
        </div>
      </section>

      <div className="h-3 bg-[#d13c3c]" />
    </main>
  );
}
