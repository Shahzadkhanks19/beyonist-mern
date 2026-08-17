/**
 * Original-inspired Beyonist campaign hero.
 *
 * Keeps the current carousel/swipe/accessibility behavior while returning the
 * visual language to a clearer ecommerce composition: warm cream, Beyonist red,
 * product-first imagery and conventional shopping CTAs.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { responsiveImageProps } from "../utils/productImagePath.js";

const AUTOPLAY_MS = 6500;

const slides = [
  {
    id: "01",
    eyebrow: "BEYONIST / THE SKIN EDIT",
    title: <>Skin <em className="font-normal text-[#d13c3c]">beyond</em><br/>ordinary.</>,
    copy: "Targeted skincare. Sensory rituals. No unnecessary complexity.",
    primary: { label: "Shop the edit", to: "/shop" },
    secondary: { label: "Explore routines", to: "/shop?view=ritual" },
    proof: ["Formula-led", "Daily rituals", "Made in India"],
    background: "bg-[#fffaf1]",
    accent: "bg-[#d13c3c]",
    image: "/images/product-hamper.webp",
    companions: ["/images/gluta-kojic.webp", "/images/sunblock-lotion.webp"],
    imageAlt: "Beyonist skincare collection",
  },
  {
    id: "02",
    eyebrow: "BEYONIST / SERUM EDIT",
    title: <>Three drops.<br/><em className="font-normal text-[#d13c3c]">Three intentions.</em></>,
    copy: "Brighten, hydrate or boost with focused serum care designed for real routines.",
    primary: { label: "Shop serums", to: "/shop?category=serums" },
    secondary: { label: "Find your formula", to: "/shop?view=concerns" },
    proof: ["Lightweight", "Layer-friendly", "Targeted care"],
    background: "bg-[#f8e8e5]",
    accent: "bg-[#d13c3c]",
    image: "/images/ivy-serum.webp",
    companions: ["/images/whitening-serum.webp", "/images/hydra-serum.webp"],
    imageAlt: "Beyonist serum collection",
  },
  {
    id: "03",
    eyebrow: "BEYONIST / DAILY DEFENCE",
    title: <>Morning care,<br/><em className="font-normal text-[#d13c3c]">made easy.</em></>,
    copy: "Hydrate. Protect. Get on with your day. A simple morning routine without the overloaded shelf.",
    primary: { label: "Build your ritual", to: "/shop?view=ritual" },
    secondary: { label: "Shop daily care", to: "/shop?concern=protection" },
    proof: ["Hydrate", "Protect", "Repeat"],
    background: "bg-[#faf6af]",
    accent: "bg-[#d13c3c]",
    image: "/images/sunblock-lotion.webp",
    companions: ["/images/hydra-serum.webp", "/images/milky-coconut.webp"],
    imageAlt: "Beyonist morning skincare ritual",
  },
];

function ProductVisual({ slide }) {
  const companions = slide.companions || ["/images/gluta-kojic.webp", "/images/sunblock-lotion.webp"];

  return (
    <div
      className="relative z-[3] h-[84%] w-[88%] max-w-[760px]"
      role="img"
      aria-label={slide.imageAlt}
    >
      <div className="absolute bottom-[9%] left-[1%] z-[1] h-[64%] w-[34%] -rotate-[5deg] overflow-hidden border border-white/35 bg-white/25 shadow-[0_24px_42px_rgba(64,24,18,.13)]">
        <img
          {...responsiveImageProps(companions[0], "(max-width: 900px) 25vw, 14vw")}
          alt=""
          loading="lazy"
          fetchPriority="low"
          width="800"
          height="800"
          className="h-full w-full object-contain"
          decoding="async"
        />
      </div>

      <div className="absolute bottom-[3%] left-1/2 z-[3] h-[82%] w-[43%] -translate-x-1/2 overflow-hidden border border-white/40 bg-white/20 shadow-[0_30px_48px_rgba(64,24,18,.17)]">
        <img
          {...responsiveImageProps(slide.image, "(max-width: 900px) 34vw, 20vw")}
          alt=""
          loading={slide.id === "01" ? "eager" : "lazy"}
          fetchPriority={slide.id === "01" ? "high" : undefined}
          width="800"
          height="800"
          className="h-full w-full object-contain"
          decoding="async"
        />
      </div>

      <div className="absolute bottom-[9%] right-[1%] z-[2] h-[64%] w-[34%] rotate-[5deg] overflow-hidden border border-white/35 bg-white/25 shadow-[0_24px_42px_rgba(64,24,18,.13)]">
        <img
          {...responsiveImageProps(companions[1], "(max-width: 900px) 25vw, 14vw")}
          alt=""
          loading="lazy"
          fetchPriority="low"
          width="800"
          height="800"
          className="h-full w-full object-contain"
          decoding="async"
        />
      </div>
    </div>
  );
}

export default function CampaignHero() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStart = useRef(null);
  const reducedMotion = useReducedMotion();
  const slide = slides[active];

  const goTo = useCallback((next) => {
    const normalized = (next + slides.length) % slides.length;
    if (normalized === active) return;
    setDirection(normalized > active || (active === slides.length - 1 && normalized === 0) ? 1 : -1);
    setActive(normalized);
  }, [active]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setTimeout(() => {
      setDirection(1);
      setActive((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [active, reducedMotion]);

  const onKeyDown = (event) => {
    if (event.key === "ArrowRight") goTo(active + 1);
    if (event.key === "ArrowLeft") goTo(active - 1);
  };

  const onTouchStart = (event) => { touchStart.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event) => {
    if (touchStart.current == null) return;
    const end = event.changedTouches[0]?.clientX ?? touchStart.current;
    const delta = end - touchStart.current;
    touchStart.current = null;
    if (Math.abs(delta) > 45) goTo(active + (delta < 0 ? 1 : -1));
  };

  return (
    <section
      className={`relative overflow-hidden border-b border-black/10 ${slide.background}`}
      aria-roledescription="carousel"
      aria-label="Beyonist featured campaigns"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
        <div className="absolute -right-[11%] -top-[55%] aspect-square w-[62vw] rounded-full border border-[#d13c3c]/20" />
        <div className="absolute right-[8%] top-[7%] aspect-square w-[36vw] rounded-full border border-black/10" />
      </div>

      <div className="relative mx-auto grid min-h-[540px] max-w-[1540px] grid-cols-[.88fr_1.12fr] items-stretch max-[900px]:grid-cols-1 max-[900px]:min-h-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`copy-${slide.id}`}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 18 }}
            transition={{ duration: reducedMotion ? .2 : .5, ease: [0.22,1,0.36,1] }}
            className="relative z-[4] flex flex-col justify-center px-[clamp(22px,6vw,92px)] py-[clamp(58px,6vw,78px)] max-[900px]:pb-8"
          >
            <span className="text-[8px] font-bold uppercase tracking-[.18em] text-[#d13c3c]">{slide.eyebrow}</span>
            <h1 className="page-display mt-5 max-w-[720px] text-[#171313]">{slide.title}</h1>
            <p className="mt-6 max-w-[470px] text-[13px] leading-6 text-[#615957]">{slide.copy}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={slide.primary.to} className="store-button-primary inline-flex min-w-[190px] items-center justify-between px-5 py-4 text-[8px] font-semibold uppercase tracking-[.13em]">
                {slide.primary.label}<span>→</span>
              </Link>
              <Link to={slide.secondary.to} className="store-button-secondary inline-flex min-w-[175px] items-center justify-between px-5 py-4 text-[8px] font-semibold uppercase tracking-[.13em]">
                {slide.secondary.label}<span>→</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-black/10 pt-5 text-[7px] font-semibold uppercase tracking-[.13em] text-black/65">
              {slide.proof.map((item) => <span key={item}>✓ {item}</span>)}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="relative min-h-[540px] overflow-hidden max-[900px]:min-h-[430px] max-[600px]:min-h-[360px]">
          <div className={`absolute right-[5%] top-1/2 aspect-square w-[min(40vw,540px)] -translate-y-1/2 rounded-full ${slide.accent} max-[900px]:left-1/2 max-[900px]:right-auto max-[900px]:w-[min(72vw,500px)] max-[900px]:-translate-x-1/2`} />
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`visual-${slide.id}`}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 28, scale: .97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -24, scale: 1.02 }}
              transition={{ duration: reducedMotion ? .2 : .62, ease: [0.22,1,0.36,1] }}
              className="absolute inset-0 grid place-items-center p-7 max-[600px]:p-3"
            >
              <ProductVisual slide={slide} />
            </motion.div>
          </AnimatePresence>

          <div className="absolute right-5 top-5 z-[5] rounded-sm bg-white px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,.08)] max-[600px]:right-3 max-[600px]:top-3">
            <span className="block text-[6px] uppercase tracking-[.15em] text-[#d13c3c]">Beyonist pick</span>
            <strong className="mt-1 block font-[Georgia] text-[17px] font-normal">Skin, simplified.</strong>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-[clamp(22px,6vw,92px)] z-[8] flex gap-2" aria-label="Choose hero campaign">
        {slides.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Show campaign ${item.id}`}
            aria-current={active === index ? "true" : undefined}
            className="group grid h-7 w-7 place-items-center rounded-full"
          >
            <span className={`block h-2.5 rounded-full transition-all ${active === index ? "w-7 bg-[#d13c3c]" : "w-2.5 bg-black/20 group-hover:bg-black/40"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
