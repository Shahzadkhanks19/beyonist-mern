/**
 * Lightweight first-visit storefront preloader.
 *
 * The previous implementation imported the full animation runtime into every
 * public route. This version keeps the approved visual treatment with CSS-only
 * transitions so it does not compete with route/LCP JavaScript.
 */
import { useEffect, useState } from "react";

export default function Preloader() {
  const [visible, setVisible] = useState(() => {
    try {
      return window.sessionStorage.getItem("beyonist_intro_seen") !== "1";
    } catch {
      return true;
    }
  });
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reducedMotion) {
      setVisible(false);
      return undefined;
    }

    const leaveTimer = window.setTimeout(() => setLeaving(true), 120);
    const removeTimer = window.setTimeout(() => {
      setVisible(false);
      try {
        window.sessionStorage.setItem("beyonist_intro_seen", "1");
      } catch {
        // The intro still dismisses when storage is unavailable.
      }
    }, 270);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[120] overflow-hidden bg-[#d13c3c] text-white transition duration-150 ease-out ${leaving ? "pointer-events-none opacity-0" : "opacity-100"}`}
      aria-label="Loading Beyonist"
      role="status"
    >
      <div className="pointer-events-none absolute inset-0 z-[2] opacity-25" aria-hidden="true">
        <div className="beyonist-preloader-ring absolute left-1/2 top-1/2 aspect-square w-[72vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
        <div className="beyonist-preloader-ring absolute left-1/2 top-1/2 aspect-square w-[43vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 [animation-delay:40ms]" />
      </div>

      <div className="relative z-[3] flex h-full flex-col justify-between px-[clamp(24px,5vw,72px)] py-[clamp(24px,4vw,52px)]">
        <div className="flex items-start justify-between gap-6">
          <span className="text-[7px] font-semibold uppercase tracking-[.2em] text-white/90">Beyonist / Loading</span>
          <span className="text-[7px] uppercase tracking-[.18em] text-white/90">Skin beyond ordinary</span>
        </div>

        <div className="mx-auto w-full max-w-[900px] text-center">
          <img
            src="/brand/beyonist-wordmark-white.webp"
            srcSet="/brand/beyonist-wordmark-white-320.webp 320w, /brand/beyonist-wordmark-white-640.webp 640w, /brand/beyonist-wordmark-white.webp 720w"
            sizes="(max-width: 600px) 70vw, 340px"
            alt="Beyonist"
            loading="eager"
            className="mx-auto w-[clamp(185px,28vw,340px)]"
            width="720"
            height="112"
            decoding="async"
          />
          <p className="mt-7 font-[Georgia] text-[clamp(28px,4.2vw,54px)] font-normal tracking-[-.035em]">
            Skin beyond <em className="font-normal text-black">ordinary.</em>
          </p>
          <div className="mx-auto mt-8 h-px max-w-[430px] overflow-hidden bg-white/25">
            <div className="h-full w-full origin-left scale-x-100 bg-white transition-transform duration-200" />
          </div>
        </div>

        <div className="flex items-end justify-between gap-6 text-[7px] uppercase tracking-[.16em] text-white/90">
          <span>Formula-led skincare</span>
          <span className="font-[Georgia] text-[18px] normal-case tracking-normal">01</span>
        </div>
      </div>
    </div>
  );
}
