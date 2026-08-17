/**
 * Customer-facing Not Found page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";

const quickLinks = [
  { label: "The Edit", to: "/blogs" },
  { label: "Our Story", to: "/about" },
  { label: "Contact", to: "/contact" },
];

/**
 * Renders the Not Found component and coordinates the state/behavior owned by this UI boundary.
 */
export default function NotFound() {
  const location = useLocation();

  return (
    <main className="relative overflow-hidden bg-[#0c0c0c] text-white">
      {/* Section 1: Page section 1. */}
      <section className="relative min-h-[calc(100dvh-112px)] overflow-hidden px-[clamp(20px,4.8vw,74px)] py-[clamp(42px,5vw,72px)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[49%] top-1/2 aspect-square w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[.055]" />
          <div className="absolute left-[49%] top-1/2 aspect-square w-[45vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[.045]" />
          <div className="absolute left-[49%] top-1/2 aspect-square w-[24vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d13c3c]/20" />

          <div className="absolute inset-y-0 left-1/4 w-px bg-white/[.045]" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/[.045]" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-white/[.045]" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100dvh-185px)] max-w-[1500px] flex-col">
          <header className="flex items-start justify-between gap-8">
            <div>
              <span className="text-[7px] font-semibold uppercase tracking-[.22em] text-[#d13c3c]">
                Beyonist / Error 404
              </span>
              <p className="mt-2 text-[7px] uppercase tracking-[.13em] text-white/28">
                The address exists nowhere on this shelf.
              </p>
            </div>

            <span className="hidden text-[7px] uppercase tracking-[.16em] text-white/90 sm:block">
              Skin beyond ordinary
            </span>
          </header>

          <div className="grid flex-1 grid-cols-[0.86fr_1.14fr] items-center gap-[clamp(34px,5vw,82px)] py-[clamp(28px,4vw,52px)] max-[980px]:grid-cols-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 min-w-0"
            >
              <div className="flex items-end gap-[clamp(16px,2.5vw,34px)]">
                <div className="flex items-baseline font-[Georgia] text-[clamp(104px,10vw,170px)] font-normal leading-[0.68] tracking-[-0.085em] text-[#d13c3c]">
                  <span>4</span>
                  <span className="mx-[0.02em] text-white/16">0</span>
                  <span>4</span>
                </div>

                <div className="hidden pb-2 xl:block">
                  <span className="block text-[6px] uppercase tracking-[.18em] text-white/90">
                    Page status
                  </span>
                  <strong className="mt-2 block font-[Georgia] text-[28px] font-normal">
                    Not found.
                  </strong>
                </div>
              </div>

              <h1 className="mt-[clamp(22px,3vw,38px)] max-w-[650px] font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[0.88] tracking-[-0.055em]">
                You’ve wandered
                <br />
                <em className="font-normal text-white/34">off the shelf.</em>
              </h1>

              <p className="mt-6 max-w-[540px] text-[10px] leading-6 text-white/90">
                We couldn’t find{" "}
                <span className="break-all text-white/90">{location.pathname}</span>.
                The formula may have moved, the link may be outdated, or this page
                never existed.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="group inline-flex min-w-[190px] items-center justify-between bg-[#d13c3c] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white transition hover:bg-white hover:text-black"
                >
                  <span>Return home</span>
                  <span className="transition-transform group-hover:translate-x-1">↗</span>
                </Link>

                <Link
                  to="/shop"
                  className="group inline-flex min-w-[190px] items-center justify-between border border-white/15 px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] transition hover:bg-white hover:text-black"
                >
                  <span>Browse the shelf</span>
                  <span className="transition-transform group-hover:translate-x-1">↗</span>
                </Link>
              </div>

              <nav className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5">
                {quickLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-[7px] font-semibold uppercase tracking-[.13em] text-white/90 transition hover:text-white"
                  >
                    {item.label} ↗
                  </Link>
                ))}
              </nav>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97, rotate: 1.4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.62, delay: 0.08 }}
              className="relative min-h-[clamp(430px,54vh,590px)] max-[980px]:mx-auto max-[980px]:w-full max-[980px]:max-w-[760px]"
            >
              <div className="absolute inset-[3%_6%_8%_2%] -rotate-[1.7deg] bg-[#d13c3c]" />
              <div className="absolute inset-[8%_2%_3%_8%] rotate-[1.6deg] bg-[#d8c0c2]" />

              <div className="absolute inset-[6%_6%] z-[2] overflow-hidden border border-white/10 bg-[#e8d9cf]">
                <div className="absolute left-1/2 top-1/2 aspect-square w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[.07]" />

                <img
                  src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw"
                  alt="Beyonist skincare collection" loading="eager" fetchPriority="high"
                  className="relative z-[2] h-full w-full object-contain p-[clamp(28px,6vw,82px)] drop-shadow-[0_34px_44px_rgba(0,0,0,.20)]"
                 width="1000" height="1000" decoding="async"/>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 14, rotate: -3 }}
                animate={{ opacity: 1, y: 0, rotate: -3 }}
                transition={{ delay: 0.32, duration: 0.42 }}
                className="absolute left-[-1%] top-[8%] z-[4] w-[29%] min-w-[128px] border-[6px] border-[#ffffff] bg-[#ffffff] p-2 text-black shadow-[0_22px_55px_rgba(0,0,0,.22)]"
              >
                <img
                  src="/images/ivy-serum-800.webp" loading="lazy" fetchPriority="low" srcSet="/images/ivy-serum-480.webp 480w, /images/ivy-serum-800.webp 800w, /images/ivy-serum.webp 1080w" sizes="220px"
                  alt=""
                  className="aspect-square w-full object-contain"
                 width="1080" height="1080" decoding="async"/>
                <div className="mt-2 flex justify-between text-[6px] uppercase tracking-[.12em]">
                  <span>Lost formula</span>
                  <span>04</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -14, rotate: 3 }}
                animate={{ opacity: 1, y: 0, rotate: 3 }}
                transition={{ delay: 0.4, duration: 0.42 }}
                className="absolute bottom-[5%] right-[-1%] z-[4] w-[28%] min-w-[124px] border-[6px] border-[#ffffff] bg-[#ffffff] p-2 text-black shadow-[0_22px_55px_rgba(0,0,0,.22)]"
              >
                <img
                  src="/images/gluta-kojic-800.webp" loading="lazy" fetchPriority="low" srcSet="/images/gluta-kojic-480.webp 480w, /images/gluta-kojic-800.webp 800w, /images/gluta-kojic.webp 1080w" sizes="220px"
                  alt=""
                  className="aspect-square w-full object-contain"
                 width="1080" height="1080" decoding="async"/>
                <div className="mt-2 flex justify-between text-[6px] uppercase tracking-[.12em]">
                  <span>Back on shelf</span>
                  <span>04</span>
                </div>
              </motion.div>

              <div className="absolute right-[5%] top-[8%] z-[5] bg-black px-4 py-3">
                <span className="block text-[6px] uppercase tracking-[.16em] text-white/90">
                  404 / Archive note
                </span>
                <strong className="mt-1 block font-[Georgia] text-[18px] font-normal">
                  Nothing to see here.
                </strong>
              </div>
            </motion.div>
          </div>

          <footer className="flex items-center justify-between gap-6 border-t border-white/10 pt-5 text-[6px] uppercase tracking-[.15em] text-white/90 max-[600px]:items-start max-[600px]:flex-col">
            <span>Beyonist skincare / Gurugram, India</span>
            <span>Error 404 / Shelf unavailable</span>
          </footer>
        </div>
      </section>

      <div className="h-3 bg-[#d13c3c]" />
    </main>
  );
}
