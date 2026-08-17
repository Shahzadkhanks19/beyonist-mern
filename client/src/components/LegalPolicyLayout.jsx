/**
 * Reusable storefront component for legal policy layout. Encapsulates shared UI behavior so page files stay focused on page composition.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Link } from "react-router-dom";

const POLICY_LINKS = [
  ["Terms & Conditions", "/terms-and-conditions"],
  ["Returns & Refunds", "/return-refund-policy"],
  ["Shipping Policy", "/shipping-policy"],
];

/**
 * Renders the Legal Policy Layout component and coordinates the state/behavior owned by this UI boundary.
 */
export default function LegalPolicyLayout({
  eyebrow,
  title,
  accent,
  intro,
  revision = "22 January 2024",
  sections,
  highlights = [],
  children,
}) {
  return (
    <main className="bg-[#fffaf1] text-[#111]">
      {/* Section 1: Page section 1. */}
      <section className="relative overflow-hidden bg-[#faf6af] text-[#171313]">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-[44%] top-[-42%] aspect-square w-[72vw] rounded-full border border-black/[.12]" />
          <div className="absolute left-[58%] top-[0%] aspect-square w-[38vw] rounded-full border border-black/[.08]" />
          <div className="absolute inset-y-0 left-1/4 w-px bg-black/[.06]" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-black/[.06]" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-black/[.06]" />
        </div>

        <div className="relative mx-auto grid min-h-[540px] max-w-[1600px] grid-cols-[.82fr_1.18fr] max-[900px]:grid-cols-1 max-[900px]:min-h-0">
          <div className="flex flex-col justify-center px-[clamp(22px,5vw,78px)] py-[clamp(44px,5vw,68px)]">
            <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#d13c3c]">{eyebrow}</span>
            <h1 className="mt-5 max-w-[800px] font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.82] tracking-[-.065em]">
              {title}<br/><em className="font-normal text-[#d13c3c]">{accent}</em>
            </h1>
            <p className="mt-5 max-w-[600px] text-[13px] leading-7 text-black/65">{intro}</p>
          </div>

          <div className="relative min-h-[540px] overflow-hidden max-[900px]:min-h-[400px] max-[560px]:min-h-[330px]">
            <div className="absolute inset-[8%_7%_8%_5%] bg-[#d7c0c1]" />
            <div className="absolute inset-[11%_10%_11%_8%] z-[2] grid place-items-center">
              <img src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist skincare collection" loading="eager" fetchPriority="high" className="h-full w-full object-contain p-[clamp(18px,5vw,60px)] drop-shadow-[0_32px_45px_rgba(0,0,0,.2)]"  width="1000" height="1000" decoding="async"/>
            </div>
            <div className="absolute right-[5%] top-[8%] z-[4] bg-[#d13c3c] px-5 py-4 text-white">
              <span className="block text-[6px] uppercase tracking-[.18em] text-white/90">Legal / Beyonist</span>
              <strong className="mt-1 block font-[Georgia] text-[21px] font-normal">Clear terms. Clear expectations.</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Last revision. */}

      <section className="border-b border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 py-4 max-[720px]:items-start max-[720px]:flex-col">
          <div className="flex flex-wrap items-center gap-3 text-[7px] uppercase tracking-[.13em] text-black/65">
            <span>Last revision</span><strong className="text-black">{revision}</strong>
          </div>
          <nav className="flex flex-wrap gap-2">
            {POLICY_LINKS.map(([label, href]) => (
              <Link key={href} to={href} className="border border-black/10 px-3 py-2 text-[7px] font-semibold uppercase tracking-[.12em] transition hover:border-black hover:bg-black hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Section 3: Policy guide / 01. */}

      <section className="px-[clamp(22px,5vw,78px)] py-[clamp(64px,7vw,96px)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[300px_minmax(0,1fr)] gap-[clamp(45px,7vw,105px)] max-[900px]:grid-cols-1">
          <aside className="self-start min-[901px]:sticky min-[901px]:top-[145px]">
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Policy guide / 01</span>
            <h2 className="mt-5 font-[Georgia] text-[clamp(40px,4.5vw,60px)] font-normal leading-[.92] tracking-[-.045em]">
              The important parts,<br/><em className="font-normal text-[#d13c3c]">up front.</em>
            </h2>

            {highlights.length ? (
              <div className="mt-8 border-t border-black/10">
                {highlights.map((item, index) => (
                  <div key={item} className="grid grid-cols-[34px_1fr] gap-3 border-b border-black/10 py-4">
                    <span className="text-[6px] uppercase tracking-[.13em] text-black/65">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-[9px] leading-5 text-black/65">{item}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-8 border border-black/10 bg-[#ffffff] p-5">
              <span className="text-[7px] font-semibold uppercase tracking-[.14em] text-[#d13c3c]">Need clarification?</span>
              <p className="mt-3 text-[9px] leading-5 text-black/65">Customer care can help with orders, delivery and returns.</p>
              <Link to="/contact" className="mt-5 inline-flex border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.12em]">Contact Beyonist ↗</Link>
            </div>
          </aside>

          <div>
            <div className="border-b border-black pb-5">
              <span className="text-[8px] font-semibold uppercase tracking-[.15em]">Policy details</span>
            </div>

            <div className="divide-y divide-black/10">
              {sections.map((section, index) => (
                <article key={section.title} id={`section-${index + 1}`} className="grid grid-cols-[56px_minmax(0,1fr)] gap-5 py-[clamp(28px,4vw,46px)] max-[560px]:grid-cols-[38px_minmax(0,1fr)]">
                  <span className="text-[7px] font-semibold uppercase tracking-[.14em] text-[#d13c3c]">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-[Georgia] text-[clamp(28px,3.3vw,44px)] font-normal leading-[1] tracking-[-.035em]">{section.title}</h3>
                    <div className="mt-5 space-y-4 text-[11px] leading-7 text-black/65 [&_strong]:font-semibold [&_strong]:text-black/75 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc">
                      {section.content}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {children}
          </div>
        </div>
      </section>

      {/* Section 4: Beyonist contact / 02. */}

      <section className="border-y border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)] py-[clamp(55px,6vw,88px)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[.7fr_1.3fr] items-end gap-12 max-[820px]:grid-cols-1">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Beyonist contact / 02</span>
            <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.05em]">
              Questions about<br/><em className="font-normal text-[#d13c3c]">a policy?</em>
            </h2>
          </div>

          <div className="grid grid-cols-3 border-l border-t border-black/10 max-[700px]:grid-cols-1">
            <a href="tel:+918527999563" className="border-b border-r border-black/10 p-6 transition hover:bg-[#fffaf1]">
              <span className="text-[6px] uppercase tracking-[.14em] text-black/65">01 / Phone</span>
              <strong className="mt-10 block font-[Georgia] text-[24px] font-normal">+91 85279 99563</strong>
            </a>
            <a href="mailto:contact@beyonist.com" className="border-b border-r border-black/10 p-6 transition hover:bg-[#fffaf1]">
              <span className="text-[6px] uppercase tracking-[.14em] text-black/65">02 / Email</span>
              <strong className="mt-10 block break-all font-[Georgia] text-[24px] font-normal">contact@beyonist.com</strong>
            </a>
            <Link to="/contact" className="border-b border-r border-black/10 p-6 transition hover:bg-[#fffaf1]">
              <span className="text-[6px] uppercase tracking-[.14em] text-black/65">03 / Support</span>
              <strong className="mt-10 block font-[Georgia] text-[24px] font-normal">Contact customer care ↗</strong>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 5: Registered office. */}

      <section className="bg-[#d13c3c] px-[clamp(22px,5vw,78px)] py-[clamp(54px,6vw,84px)] text-white">
        <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-10 max-[720px]:items-start max-[720px]:flex-col">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-white/90">Registered office</span>
            <address className="mt-4 max-w-[760px] font-[Georgia] text-[clamp(27px,3.5vw,44px)] not-italic leading-[1.1]">
              3rd Floor Landmark Tower, South City 1, Sector 41,<br/>Gurugram, Haryana 122001
            </address>
          </div>
          <Link to="/faq" className="inline-flex min-w-[210px] items-center justify-between bg-black px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em]"><span>Read FAQs</span><span>↗</span></Link>
        </div>
      </section>

      <div className="h-3 bg-black" aria-hidden="true" />
    </main>
  );
}
