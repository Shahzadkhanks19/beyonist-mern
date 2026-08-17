/**
 * Customer authentication shell.
 * Uses a familiar ecommerce split layout while preserving guest checkout and
 * customer-account messaging.
 */
import { Link } from "react-router-dom";

export default function AuthShell({ eyebrow, title, accent, copy, children, footnote }) {
  return (
    <main className="bg-[#fffaf1] px-[clamp(16px,4vw,54px)] py-[clamp(34px,5vw,64px)]">
      <section className="mx-auto grid max-w-[1240px] grid-cols-[.9fr_1.1fr] overflow-hidden rounded-sm border border-black/10 bg-white shadow-[0_20px_60px_rgba(70,40,25,.07)] max-[860px]:grid-cols-1">
        <div className="relative min-h-[620px] overflow-hidden bg-[#faf6af] p-[clamp(28px,4vw,52px)] max-[860px]:min-h-[500px] max-[560px]:min-h-[470px]">
          <div className="absolute -right-[18%] bottom-[8%] aspect-square w-[72%] rounded-full bg-[#d13c3c] max-[860px]:-right-[12%] max-[860px]:bottom-[4%] max-[860px]:w-[62%] max-[560px]:w-[78%]" />
          <img
            src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 860px) 56vw, 340px"
            alt=""
            width="1000"
            height="1000"
            loading="eager"
            fetchPriority="high"
            className="absolute bottom-[3%] right-[0%] z-[2] h-[62%] w-[60%] object-contain object-bottom max-[860px]:right-[-1%] max-[860px]:h-[55%] max-[860px]:w-[56%] max-[560px]:bottom-[5%] max-[560px]:h-[48%] max-[560px]:w-[62%]"
            decoding="async"
          />
          <div className="relative z-[3] max-w-[470px]">
            <img src="/brand/beyonist-wordmark-black.webp" alt="Beyonist" loading="eager" className="w-[150px] max-[560px]:w-[132px]" width="720" height="112" decoding="async"/>
            <span className="mt-8 block text-[8px] font-semibold uppercase tracking-[.17em] text-[#d13c3c] max-[560px]:mt-7">{eyebrow}</span>
            <h1 className="mt-3 max-w-[420px] font-[Georgia] text-[clamp(42px,4.1vw,58px)] font-normal leading-[.92] tracking-[-.045em] max-[560px]:max-w-[300px] max-[560px]:text-[42px]">
              {title}<br/><em className="font-normal text-[#d13c3c]">{accent}</em>
            </h1>
            <p className="mt-5 max-w-[350px] text-[11px] leading-6 text-black/65 max-[560px]:max-w-[270px]">{copy}</p>
          </div>
          <div className="absolute bottom-6 left-[clamp(28px,4vw,52px)] z-[4] rounded-sm bg-white/92 px-4 py-3 text-[7px] font-semibold uppercase tracking-[.11em] text-black/65 shadow-sm">
            Guest checkout always available
          </div>
        </div>

        <div className="flex items-center justify-center p-[clamp(26px,6vw,72px)]">
          <div className="w-full max-w-[560px]">
            <Link to="/" className="text-[8px] font-semibold uppercase tracking-[.12em] text-black/65 transition hover:text-[#d13c3c]">← Back to shop</Link>
            {children}
            {footnote}
          </div>
        </div>
      </section>
    </main>
  );
}