/**
 * Reusable storefront component for global error boundary. Encapsulates shared UI behavior so page files stay focused on page composition.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Component } from "react";

/**
 * Renders the Global Error Screen component and coordinates the state/behavior owned by this UI boundary.
 */
function GlobalErrorScreen({ onRetry }) {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#0b0b0b] px-[clamp(22px,5vw,78px)] py-[clamp(56px,7vw,90px)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 aspect-square w-[78vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#cf1f2e]/20" />
        <div className="absolute left-1/2 top-1/2 aspect-square w-[48vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[.07]" />
        <div className="absolute left-1/2 top-1/2 aspect-square w-[26vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[.05]" />
        <div className="absolute inset-y-0 left-1/4 w-px bg-white/[.04]" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/[.04]" />
        <div className="absolute inset-y-0 left-3/4 w-px bg-white/[.04]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100dvh-120px)] w-full max-w-[1400px] flex-col">
        <div className="flex items-start justify-between gap-6">
          <img src="/brand/beyonist-wordmark-white.webp" srcSet="/brand/beyonist-wordmark-white-320.webp 320w, /brand/beyonist-wordmark-white-640.webp 640w, /brand/beyonist-wordmark-white.webp 720w" sizes="(max-width: 600px) 70vw, 225px" alt="Beyonist" loading="eager" className="w-[clamp(150px,17vw,230px)]"  width="720" height="112" decoding="async"/>
          <span className="text-[6px] uppercase tracking-[.18em] text-white/90">Critical application state</span>
        </div>

        <div className="grid flex-1 grid-cols-[.78fr_1.22fr] items-center gap-[clamp(45px,8vw,115px)] py-10 max-[860px]:grid-cols-1">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#cf1f2e]">Global Error / Beyonist</span>

            <div className="mt-7 flex items-end gap-4">
              <span className="font-[Georgia] text-[clamp(132px,16vw,250px)] font-normal leading-[.62] tracking-[-.08em] text-[#cf1f2e]">0</span>
              <div className="pb-4">
                <span className="block text-[7px] uppercase tracking-[.17em] text-white/90">Application state</span>
                <strong className="mt-2 block font-[Georgia] text-[clamp(24px,3vw,38px)] font-normal">Reset required.</strong>
              </div>
            </div>

            <h1 className="mt-7 max-w-[780px] font-[Georgia] text-[clamp(54px,6.6vw,98px)] font-normal leading-[.84] tracking-[-.06em]">
              The experience<br/><em className="font-normal text-[#cf1f2e]">lost its place.</em>
            </h1>

            <p className="mt-7 max-w-[620px] text-[11px] leading-7 text-white/90">
              A critical error interrupted the application shell. Reloading is the safest way to rebuild the experience from a clean state.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={onRetry}
                className="group inline-flex min-w-[220px] items-center justify-between bg-[#cf1f2e] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white"
              >
                <span>Reload Beyonist</span><span className="transition-transform group-hover:rotate-45">↻</span>
              </button>

              <a
                href="/"
                className="group inline-flex min-w-[190px] items-center justify-between border border-white/15 px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white transition hover:bg-white hover:text-black"
              >
                <span>Go home</span><span className="transition-transform group-hover:translate-x-1">↗</span>
              </a>
            </div>
          </div>

          <div className="relative min-h-[560px] max-[600px]:min-h-[390px]">
            <div className="absolute inset-[4%_7%_7%_3%] -rotate-2 bg-[#cf1f2e]" />
            <div className="absolute inset-[8%_3%_3%_8%] rotate-2 border border-white/[.06] bg-white/[.03]" />

            <div className="absolute inset-[7%_7%] z-[2] overflow-hidden border border-white/[.08] bg-[#1a1a1a]">
              <div className="absolute left-1/2 top-1/2 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[.08]" />
              <div className="absolute left-1/2 top-1/2 aspect-square w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#cf1f2e]/20" />
              <img
                src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw"
                alt="Beyonist skincare collection" loading="eager" fetchPriority="high"
                className="relative z-[2] h-full w-full object-contain p-[clamp(28px,7vw,90px)] opacity-90 drop-shadow-[0_34px_45px_rgba(0,0,0,.28)]"
               width="1000" height="1000" decoding="async"/>
            </div>

            <div className="absolute left-[2%] top-[10%] z-[4] bg-[#fffdf8] px-4 py-3 text-black shadow-[0_22px_55px_rgba(0,0,0,.2)]">
              <span className="block text-[6px] uppercase tracking-[.14em] text-black/65">Fallback / 01</span>
              <strong className="mt-1 block font-[Georgia] text-[20px] font-normal">App shell interrupted.</strong>
            </div>

            <div className="absolute bottom-[8%] right-[1%] z-[4] bg-[#cf1f2e] px-5 py-4 text-white">
              <span className="block text-[6px] uppercase tracking-[.14em] text-white/90">Recovery path</span>
              <strong className="mt-1 block font-[Georgia] text-[21px] font-normal">Reload from a clean state. ↻</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-5 text-[6px] uppercase tracking-[.15em] text-white/90 max-[600px]:items-start max-[600px]:flex-col">
          <span>Critical error boundary / storefront protected</span>
          <span>Beyonist skincare / India</span>
        </div>
      </div>
    </main>
  );
}

export default class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[Beyonist global error]", error, info);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <GlobalErrorScreen onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
