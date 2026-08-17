/**
 * Customer-facing Our Story page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { getSitePage } from "../services/siteApi.js";

const FALLBACK = {
  eyebrow: "Our Story / Beyonist Skincare",
  title: "Beauty that feels more like you.",
  intro:
    "Beyonist is built around a simple belief: skincare should support confidence, celebrate individuality and fit naturally into real life.",
  mission:
    "We champion the extraordinary in every person. Our mission is not just to enhance your appearance but to empower, uplift, and celebrate the unique beauty within you.",
  belief:
    "We believe that true beauty is not confined to external features; it radiates from confidence, kindness, and the authenticity that makes you, you.",
  chapters: [
    {
      number: "01",
      title: "Confidence before complexity.",
      body:
        "The shelf should feel approachable. Focused formulas, clear routines and product stories that make choosing easier.",
    },
    {
      number: "02",
      title: "Products with a place.",
      body:
        "Every formula earns its role through how it fits into the ritual—from cleansing and hydration to serums, body care and daily protection.",
    },
    {
      number: "03",
      title: "Beauty without a template.",
      body:
        "Beyonist celebrates individuality rather than asking everyone to chase the same version of beauty.",
    },
  ],
};

/**
 * Renders the Our Story component and coordinates the state/behavior owned by this UI boundary.
 */
export default function OurStory() {
  const [content, setContent] = useState(FALLBACK);

  useEffect(() => {
    let active = true;
    getSitePage("our-story")
      .then((response) => {
        if (active && response.data) setContent({ ...FALLBACK, ...response.data });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="bg-[#fffaf1]">
      {/* Section 1: Page section 1. */}
      <section className="relative overflow-hidden bg-[#d13c3c] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-[42%] top-[-34%] aspect-square w-[68vw] rounded-full border border-white/30" />
          <div className="absolute left-[54%] top-[2%] aspect-square w-[38vw] rounded-full border border-white/18" />
          <div className="absolute inset-y-0 left-1/4 w-px bg-white/10" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-white/10" />
        </div>

        <div className="relative mx-auto grid min-h-[540px] max-w-[1600px] grid-cols-[.78fr_1.22fr] max-[940px]:grid-cols-1 max-[940px]:min-h-0">
          <div className="relative z-10 flex flex-col justify-center px-[clamp(22px,5vw,78px)] py-[clamp(44px,5vw,68px)]">
            <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-white/90">{content.eyebrow}</span>
            <h1 className="mt-5 max-w-[720px] font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.82] tracking-[-.065em]">
              Beauty that feels <em className="font-normal text-black">more like you.</em>
            </h1>
            <p className="mt-5 max-w-[560px] text-[13px] leading-7 text-white/90">{content.intro}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-[7px] uppercase tracking-[.15em] text-white/90">
              <span>Confidence</span><i className="h-px w-7 bg-white/35" /><span>Individuality</span><i className="h-px w-7 bg-white/35" /><span>Intentional care</span>
            </div>
          </div>

          <div className="relative min-h-[540px] overflow-hidden max-[940px]:min-h-[430px] max-[600px]:min-h-[360px]">
            <div className="absolute inset-[7%_7%_7%_4%] bg-[#f0d5c2]" />
            <motion.div
              initial={{ opacity: 0, scale: .985, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: .7 }}
              className="absolute inset-[9%_9%_9%_6%] z-[2] grid place-items-center"
            >
              <img src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist skincare collection" loading="eager" fetchPriority="high" className="h-full w-full object-contain p-[clamp(18px,4vw,55px)] drop-shadow-[0_34px_48px_rgba(80,0,5,.18)]"  width="1000" height="1000" decoding="async"/>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 25, rotate: 4 }}
              animate={{ opacity: 1, x: 0, rotate: 2 }}
              transition={{ duration: .65, delay: .16 }}
              className="absolute right-[4%] top-[8%] z-[4] w-[21%] min-w-[150px] border-[7px] border-[#ffffff] bg-[#ffffff] p-2.5 text-black shadow-[0_24px_60px_rgba(0,0,0,.15)] max-[600px]:min-w-[110px]"
            >
              <img src="/images/ivy-serum-800.webp" srcSet="/images/ivy-serum-480.webp 480w, /images/ivy-serum-800.webp 800w, /images/ivy-serum.webp 1080w" sizes="(max-width: 700px) 92vw, 50vw" alt="" loading="lazy" fetchPriority="low" className="aspect-square w-full object-contain"  width="1080" height="1080" decoding="async"/>
              <div className="mt-2 flex justify-between text-[6px] uppercase tracking-[.14em]"><span>Glow</span><span>01</span></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20, rotate: -4 }}
              animate={{ opacity: 1, x: 0, rotate: -2 }}
              transition={{ duration: .65, delay: .24 }}
              className="absolute bottom-[7%] left-[4%] z-[4] w-[21%] min-w-[145px] border-[7px] border-[#ffffff] bg-[#ffffff] p-2.5 text-black shadow-[0_24px_60px_rgba(0,0,0,.15)] max-[600px]:min-w-[108px]"
            >
              <img src="/images/gluta-kojic-800.webp" srcSet="/images/gluta-kojic-480.webp 480w, /images/gluta-kojic-800.webp 800w, /images/gluta-kojic.webp 1080w" sizes="(max-width: 700px) 92vw, 50vw" alt="" loading="lazy" fetchPriority="low" className="aspect-square w-full object-contain"  width="1080" height="1080" decoding="async"/>
              <div className="mt-2 flex justify-between text-[6px] uppercase tracking-[.14em]"><span>Reset</span><span>02</span></div>
            </motion.div>

            <div className="absolute bottom-[7%] right-[5%] z-[5] bg-black px-5 py-4 text-white">
              <span className="block text-[6px] uppercase tracking-[.18em] text-white/90">Beyonist belief</span>
              <strong className="mt-1 block max-w-[250px] font-[Georgia] text-[22px] font-normal leading-[1.05]">Confidence is part of the ritual.</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: What we believe / 01. */}

      <section className="px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-[220px_1fr] gap-[clamp(48px,8vw,130px)] max-[800px]:grid-cols-1">
            <div className="border-t border-black pt-4">
              <span className="text-[8px] font-semibold uppercase tracking-[.17em] text-[#d13c3c]">What we believe / 01</span>
              <p className="mt-4 text-[10px] leading-5 text-black/65">The original Beyonist mission, carried forward from the recovered brand material.</p>
            </div>
            <blockquote className="font-[Georgia] text-[clamp(45px,6vw,90px)] font-normal leading-[.98] tracking-[-.055em]">
              “{content.mission}”
            </blockquote>
          </div>
        </div>
      </section>

      {/* Section 3: Page section 3. */}

      <section className="border-y border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)] py-[clamp(64px,7vw,96px)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[.82fr_1.18fr] items-center gap-[clamp(50px,8vw,130px)] max-[850px]:grid-cols-1">
          <div className="relative grid min-h-[560px] place-items-center overflow-hidden bg-[#eddccf] max-[600px]:min-h-[390px]">
            <div className="absolute left-1/2 top-1/2 aspect-square w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[.07]" />
            <img src="/images/milky-coconut-800.webp" srcSet="/images/milky-coconut-480.webp 480w, /images/milky-coconut-800.webp 800w, /images/milky-coconut.webp 1080w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist Milky Coconut Moisturiser" loading="lazy" className="relative z-[2] h-full max-h-[590px] w-full object-contain p-[clamp(25px,6vw,82px)] drop-shadow-[0_28px_38px_rgba(60,30,10,.14)]"  width="1080" height="1080" decoding="async"/>
            <span className="absolute left-5 top-5 bg-[#ffffff] px-3 py-2 text-[7px] uppercase tracking-[.15em]">Care / 02</span>
          </div>

          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Beyond appearance / 02</span>
            <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">
              The point is not perfection.<br/><em className="font-normal text-[#d13c3c]">It is confidence.</em>
            </h2>
            <p className="mt-7 max-w-[680px] font-[Georgia] text-[clamp(20px,2.2vw,29px)] leading-[1.5] text-black/65">{content.belief}</p>
            <Link to="/shop" className="mt-8 inline-flex min-w-[230px] items-center justify-between bg-black px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em] text-white">
              <span>Explore the collection</span><span>↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4: The story in three chapters / 03. */}

      <section className="bg-[#111] px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)] text-white">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-[.7fr_1.3fr] items-end gap-12 border-b border-white/15 pb-12 max-[800px]:grid-cols-1">
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">The story in three chapters / 03</span>
              <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">A smaller philosophy.<br/><em className="font-normal text-[#d13c3c]">A clearer shelf.</em></h2>
            </div>
            <p className="max-w-[620px] pb-1 text-[11px] leading-6 text-white/90">Rather than inventing milestones or a founding timeline we cannot verify, this page tells the story through the beliefs already present in the original Beyonist material.</p>
          </div>

          <div className="mt-12 grid grid-cols-3 border-l border-t border-white/15 max-[850px]:grid-cols-1">
            {content.chapters?.map((chapter, index) => (
              <motion.div
                key={chapter.number || index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: .2 }}
                transition={{ duration: .4, delay: index * .08 }}
                className="group min-h-[330px] border-b border-r border-white/15 p-[clamp(26px,3vw,42px)] transition duration-300 hover:bg-white/[.04]"
              >
                <span className="text-[7px] uppercase tracking-[.15em] text-white/90">{chapter.number || String(index + 1).padStart(2, "0")}</span>
                <strong className="mt-16 block max-w-[330px] font-[Georgia] text-[clamp(28px,3vw,38px)] font-normal leading-[1.05] transition-transform duration-300 group-hover:-translate-y-1">{chapter.title}</strong>
                <p className="mt-5 max-w-[340px] text-[10px] leading-6 text-white/90">{chapter.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Section 5: Formula philosophy / 04. */}


      <section className="border-y border-black/10 bg-[#fffaf1] px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-[.72fr_1.28fr] items-end gap-12 border-b border-black/10 pb-12 max-[800px]:grid-cols-1">
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Formula philosophy / 04</span>
              <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">
                Less noise.<br/><em className="font-normal text-[#d13c3c]">More intention.</em>
              </h2>
            </div>
            <p className="max-w-[650px] pb-1 text-[11px] leading-6 text-black/65">
              The Beyonist shelf is presented around a simple idea: products should have a clear place in the ritual and the routine should remain easy to understand.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-4 border-l border-t border-black/10 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
            {[
              ["01", "Formula-led.", "Let the product and its role lead the story rather than surrounding it with unnecessary complexity."],
              ["02", "Ritual-minded.", "Think about where cleansing, hydration, serums, body care and protection actually sit in everyday use."],
              ["03", "Made for real life.", "A routine only matters when it feels understandable enough to return to every day."],
              ["04", "Clear by design.", "A focused shelf, straightforward product context and fewer distractions between you and the ritual."],
            ].map(([number, title, body], index) => (
              <motion.article
                key={number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: .2 }}
                transition={{ duration: .4, delay: index * .06 }}
                className="group min-h-[300px] border-b border-r border-black/10 p-[clamp(24px,3vw,38px)] transition duration-300 hover:bg-[#ffffff]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[7px] uppercase tracking-[.15em] text-black/65">{number}</span>
                  <span className="h-2 w-2 rounded-full bg-[#d13c3c] transition-transform duration-300 group-hover:scale-150" />
                </div>
                <strong className="mt-20 block font-[Georgia] text-[clamp(27px,2.8vw,37px)] font-normal leading-[1.02] tracking-[-.035em] transition-transform duration-300 group-hover:-translate-y-1">{title}</strong>
                <p className="mt-5 max-w-[300px] text-[10px] leading-6 text-black/65">{body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Made in India / 05. */}

      <section className="relative overflow-hidden bg-[#d13c3c] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <div className="absolute -right-[8%] -top-[60%] aspect-square w-[70vw] rounded-full border border-white/35" />
          <div className="absolute right-[10%] top-[-15%] aspect-square w-[38vw] rounded-full border border-white/20" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
        </div>

        <div className="relative mx-auto grid min-h-[540px] max-w-[1600px] grid-cols-[.9fr_1.1fr] items-stretch max-[900px]:grid-cols-1">
          <div className="flex flex-col justify-center px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
            <span className="text-[8px] font-semibold uppercase tracking-[.19em] text-white/90">Made in India / 05</span>
            <h2 className="mt-6 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.82] tracking-[-.065em]">
              Rooted here.<br/><em className="font-normal text-black">Looking beyond.</em>
            </h2>
            <p className="mt-5 max-w-[560px] text-[12px] leading-7 text-white/68">
              India is part of Beyonist’s visual identity and the way the brand presents itself. This chapter celebrates that connection without adding manufacturing or origin claims beyond the material available to us.
            </p>
            <div className="mt-10 flex items-center gap-4 text-[7px] uppercase tracking-[.15em] text-white/90">
              <span>Beyonist</span><i className="h-px w-8 bg-white/30" /><span>India</span><i className="h-px w-8 bg-white/30" /><span>Skin beyond ordinary</span>
            </div>
          </div>

          <div className="relative min-h-[650px] overflow-hidden max-[900px]:min-h-[520px] max-[560px]:min-h-[400px]">
            <div className="absolute inset-[8%_7%] bg-[#f0d5c2]" />
            <div className="absolute inset-[11%_10%] z-[2] grid place-items-center">
              <img src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist skincare collection" loading="lazy" className="h-full w-full object-contain p-[clamp(18px,5vw,65px)] drop-shadow-[0_34px_48px_rgba(80,0,5,.18)]"  width="1000" height="1000" decoding="async"/>
            </div>
            <span className="absolute right-[5%] top-[7%] z-[4] bg-black px-4 py-3 text-[7px] font-semibold uppercase tracking-[.18em]">Beyonist / India</span>
            <div className="absolute bottom-[7%] left-[5%] z-[4] border-[7px] border-[#ffffff] bg-[#ffffff] p-2.5 text-black shadow-[0_24px_60px_rgba(0,0,0,.15)]">
              <img src="/images/sunblock-lotion-800.webp" srcSet="/images/sunblock-lotion-480.webp 480w, /images/sunblock-lotion-800.webp 800w, /images/sunblock-lotion.webp 1080w" sizes="(max-width: 700px) 92vw, 50vw" alt="" loading="lazy" className="h-[clamp(105px,12vw,170px)] w-[clamp(105px,12vw,170px)] object-contain"  width="1080" height="1080" decoding="async"/>
              <div className="mt-2 flex justify-between text-[6px] uppercase tracking-[.14em]"><span>Daily care</span><span>IN</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: From belief to shelf / 06. */}

      <section className="px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[.95fr_1.05fr] items-center gap-[clamp(48px,7vw,110px)] max-[850px]:grid-cols-1">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">From belief to shelf / 06</span>
            <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.88] tracking-[-.055em]">Different formulas.<br/><em className="font-normal text-[#d13c3c]">One intentional ritual.</em></h2>
            <p className="mt-7 max-w-[650px] text-[12px] leading-7 text-black/65">Cleansing, serums, moisturising, body care and daily sun protection come together as a focused Beyonist shelf rather than an endless routine.</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex min-w-[220px] items-center justify-between bg-black px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em] text-white"><span>Shop Beyonist</span><span>↗</span></Link>
              <Link to="/blogs" className="inline-flex min-w-[220px] items-center justify-between border border-black px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em]"><span>Read The Edit</span><span>↗</span></Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid aspect-[.82/1] place-items-center overflow-hidden bg-[#f0d3bb] p-5">
              <img src="/images/gluta-kojic-800.webp" srcSet="/images/gluta-kojic-480.webp 480w, /images/gluta-kojic-800.webp 800w, /images/gluta-kojic.webp 1080w" sizes="(max-width: 700px) 92vw, 50vw" alt="" loading="lazy" className="h-full w-full object-contain"  width="1080" height="1080" decoding="async"/>
            </div>
            <div className="mt-16 grid aspect-[.82/1] place-items-center overflow-hidden bg-[#e9d947] p-5">
              <img src="/images/ivy-serum-800.webp" srcSet="/images/ivy-serum-480.webp 480w, /images/ivy-serum-800.webp 800w, /images/ivy-serum.webp 1080w" sizes="(max-width: 700px) 92vw, 50vw" alt="" loading="lazy" className="h-full w-full object-contain"  width="1080" height="1080" decoding="async"/>
            </div>
          </div>
        </div>
      </section>


      {/* Section 8: Beyond the bottle / 07. */}


      <section className="border-t border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-[.75fr_1.25fr] items-end gap-12 max-[800px]:grid-cols-1">
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Beyond the bottle / 07</span>
              <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">
                A brand lives<br/><em className="font-normal text-[#d13c3c]">between rituals.</em>
              </h2>
            </div>
            <div className="flex items-end justify-between gap-8 max-[620px]:items-start max-[620px]:flex-col">
              <p className="max-w-[570px] text-[11px] leading-6 text-black/65">
                This space is designed to become Beyonist’s community layer: campaign moments, product rituals and social stories managed from the site rather than a generic social-media grid.
              </p>
              <Link to="/contact" className="shrink-0 border-b border-black pb-1 text-[8px] font-semibold uppercase tracking-[.14em]">Connect with us ↗</Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-[1.35fr_.65fr] gap-4 max-[760px]:grid-cols-1">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: .15 }}
              className="relative grid min-h-[570px] place-items-center overflow-hidden bg-[#ead6c7] max-[600px]:min-h-[390px]"
            >
              <div className="absolute left-1/2 top-1/2 aspect-square w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[.07]" />
              <img src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist product ritual" loading="lazy" className="relative z-[2] h-full w-full object-contain p-[clamp(28px,7vw,95px)]"  width="1000" height="1000" decoding="async"/>
              <span className="absolute left-5 top-5 bg-[#ffffff] px-3 py-2 text-[7px] uppercase tracking-[.15em]">The shelf / 01</span>
            </motion.div>

            <div className="grid grid-rows-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: .15 }}
                transition={{ delay: .08 }}
                className="relative grid min-h-[275px] place-items-center overflow-hidden bg-[#e8d947]"
              >
                <img src="/images/ivy-serum-800.webp" srcSet="/images/ivy-serum-480.webp 480w, /images/ivy-serum-800.webp 800w, /images/ivy-serum.webp 1080w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist serum" loading="lazy" className="h-full w-full object-contain p-8"  width="1080" height="1080" decoding="async"/>
                <span className="absolute left-4 top-4 bg-[#ffffff] px-3 py-2 text-[6px] uppercase tracking-[.15em]">Formula / 02</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: .15 }}
                transition={{ delay: .14 }}
                className="relative grid min-h-[275px] place-items-center overflow-hidden bg-[#d7c0c1]"
              >
                <img src="/images/hydra-serum-800.webp" srcSet="/images/hydra-serum-480.webp 480w, /images/hydra-serum-800.webp 800w, /images/hydra-serum.webp 1080w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist hydration serum" loading="lazy" className="h-full w-full object-contain p-8"  width="1080" height="1080" decoding="async"/>
                <span className="absolute left-4 top-4 bg-[#ffffff] px-3 py-2 text-[6px] uppercase tracking-[.15em]">Ritual / 03</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Beyonist / Our Story. */}

      <section className="bg-[#d13c3c] px-[clamp(22px,5vw,78px)] py-[clamp(62px,7vw,96px)] text-white">
        <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-12 max-[720px]:items-start max-[720px]:flex-col">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-white/90">Beyonist / Our Story</span>
            <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.88] tracking-[-.055em]">Skin beyond<br/><em className="font-normal text-black">ordinary.</em></h2>
          </div>
          <Link to="/contact" className="inline-flex min-w-[235px] items-center justify-between bg-black px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em]"><span>Contact Beyonist</span><span>↗</span></Link>
        </div>
      </section>

      <div className="h-3 bg-black" aria-hidden="true" />
    </main>
  );
}
