/**
 * Reusable admin UI component for admin auth shell. Keeps admin presentation and interaction patterns consistent across dashboard pages.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Link } from "react-router-dom";
import { motion } from "motion/react";

/**
 * Renders the Admin Auth Shell component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminAuthShell({ eyebrow, title, accent, copy, children, footer }) {
  return (
    <main className="min-h-dvh bg-[#0c0c0c] text-white">
      <div className="grid min-h-dvh grid-cols-[.92fr_1.08fr] max-[900px]:grid-cols-1">
        {/* Section 1: Page section 1. */}
        <section className="relative overflow-hidden border-r border-white/10 bg-[#cf1f2e] px-[clamp(28px,5vw,72px)] py-[clamp(30px,5vw,64px)] max-[900px]:min-h-[360px] max-[600px]:min-h-[320px] max-[900px]:border-b max-[900px]:border-r-0">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
            <div className="absolute left-1/2 top-1/2 aspect-square w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
            <div className="absolute inset-y-0 left-1/3 w-px bg-white/10" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-white/10" />
          </div>

          <div className="relative z-[2] flex h-full min-h-[calc(100dvh-120px)] flex-col justify-between max-[900px]:min-h-[300px]">
            <div className="flex items-start justify-between gap-6">
              <img src="/brand/beyonist-wordmark-white.webp" srcSet="/brand/beyonist-wordmark-white-320.webp 320w, /brand/beyonist-wordmark-white-640.webp 640w, /brand/beyonist-wordmark-white.webp 720w" sizes="(max-width: 600px) 70vw, 225px" alt="Beyonist" loading="eager" className="w-[clamp(150px,16vw,215px)]"  width="720" height="112" decoding="async"/>
              <span className="text-[6px] font-semibold uppercase tracking-[.18em] text-white/90">Admin / Secure access</span>
            </div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
              <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-black/65">{eyebrow}</span>
              <h1 className="mt-5 max-w-[720px] font-[Georgia] text-[clamp(48px,7vw,96px)] font-normal leading-[.82] tracking-[-.065em]">
                {title}<br/><em className="font-normal text-black">{accent}</em>
              </h1>
              <p className="mt-5 max-w-[560px] text-[11px] leading-6 text-white/90">{copy}</p>
            </motion.div>

            <div className="flex items-center justify-between border-t border-white/20 pt-5 text-[6px] uppercase tracking-[.15em] text-white/90">
              <span>Private administration</span><span>Session / 12h</span>
            </div>
          </div>
        </section>

        {/* Section 2: Beyonist Control Room. */}

        <section className="relative grid place-items-center overflow-hidden bg-[#111] px-[clamp(18px,6vw,90px)] py-[clamp(34px,7vw,92px)]">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -right-[28%] -top-[30%] aspect-square w-[72vw] rounded-full border border-white/10" />
            <div className="absolute right-[7%] top-[10%] aspect-square w-[36vw] rounded-full border border-white/[.06]" />
          </div>

          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .45, delay: .08 }} className="relative z-[2] w-full max-w-[620px]">
            <div className="mb-8 flex items-center justify-between gap-5 border-b border-white/10 pb-5">
              <span className="text-[7px] font-semibold uppercase tracking-[.18em] text-[#cf1f2e]">Beyonist Control Room</span>
              <Link to="/" className="text-[7px] uppercase tracking-[.13em] text-white/90 transition hover:text-white">Storefront ↗</Link>
            </div>
            {children}
            {footer ? <div className="mt-7">{footer}</div> : null}
          </motion.div>
        </section>
      </div>
    </main>
  );
}
