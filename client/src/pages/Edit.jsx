/**
 * Customer-facing Edit page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { getEditPosts } from "../services/editApi.js";
import { responsiveImageProps } from "../utils/productImagePath.js";


const imageFallback = (event) => {
  if (event.currentTarget.dataset.fallbackApplied) return;
  event.currentTarget.dataset.fallbackApplied = "true";
  event.currentTarget.src = "/images/product-hamper.webp";
};
const FALLBACK_POSTS = [
  {
    _id: "fallback-1",
    slug: "three-drops-three-intentions",
    title: "Three drops. Three intentions.",
    excerpt: "A focused serum edit built around glow, hydration and a more considered daily ritual.",
    category: "Serum Notes",
    image: "/images/product-hamper.webp",
    readingTime: 4,
    featured: true,
  },
  {
    _id: "fallback-2",
    slug: "the-daily-defence-edit",
    title: "The daily defence edit.",
    excerpt: "How sun care earns a permanent place in a modern skincare routine.",
    category: "Daily Ritual",
    image: "/images/sunblock-lotion.webp",
    readingTime: 3,
  },
  {
    _id: "fallback-3",
    slug: "cleanse-with-intention",
    title: "Cleanse with intention.",
    excerpt: "Why a smaller, more deliberate cleansing routine can feel easier to keep.",
    category: "Cleansing",
    image: "/images/gluta-kojic.webp",
    readingTime: 3,
  },
  {
    _id: "fallback-4",
    slug: "texture-matters",
    title: "Texture matters.",
    excerpt: "From whipped scrubs to lightweight serums, the way a formula feels shapes the ritual around it.",
    category: "Formula Focus",
    image: "/images/whipped-scrub.webp",
    readingTime: 5,
  },
];

const FILTERS = ["All", "Serum Notes", "Daily Ritual", "Cleansing", "Formula Focus"];

/**
 * Renders the Story Card component and coordinates the state/behavior owned by this UI boundary.
 */
function StoryCard({ post, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.18) }}
      className="group h-full"
    >
      <Link to={`/blogs/${post.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[1.08/1] overflow-hidden bg-[#efe7dc]">
          <img
            {...responsiveImageProps(post.image, "(max-width: 700px) 88vw, 31vw")}
            alt={post.title}
            className="h-full w-full object-contain p-4 transition duration-700 group-hover:scale-[1.025]" width="800" height="800" loading="lazy" decoding="async"/>
          <span className="absolute left-3 top-3 bg-[#ffffff] px-3 py-2 text-[6px] font-semibold uppercase tracking-[.16em]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="flex flex-1 flex-col border-b border-black/10 py-5">
          <div className="flex items-center justify-between gap-4 text-[7px] uppercase tracking-[.14em] text-black/65">
            <span>{post.category}</span>
            <span>{post.readingTime || 4} min read</span>
          </div>
          <h3 className="mt-3 font-[Georgia] text-[clamp(24px,2.6vw,34px)] font-normal leading-[1.02] tracking-[-.035em]">
            {post.title}
          </h3>
          <p className="mt-3 max-w-[520px] flex-1 text-[11px] leading-6 text-black/65">{post.excerpt}</p>
          <span className="mt-5 inline-flex items-center gap-2 border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.14em]">
            Read the edit <span>↗</span>
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

/**
 * Renders the Edit component and coordinates the state/behavior owned by this UI boundary.
 */
export default function Edit() {
  const [posts, setPosts] = useState(FALLBACK_POSTS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getEditPosts()
      .then((response) => {
        if (!active || !response.data?.length) return;
        setPosts(response.data);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const featured = posts.find((post) => post.featured) || posts[0];

  const filtered = useMemo(() => {
    const remaining = posts.filter((post) => post.slug !== featured?.slug);
    if (activeFilter === "All") return remaining;
    return remaining.filter((post) => post.category === activeFilter);
  }, [posts, activeFilter, featured]);

  return (
    <main className="bg-[#fffaf1]">
      {/* Section 1: Page section 1. */}
      <section className="relative overflow-hidden border-b border-black/10 bg-[#101010] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-35">
          <div className="absolute left-[45%] top-[-24%] aspect-square w-[60vw] rounded-full border border-white/20" />
          <div className="absolute left-[57%] top-[4%] aspect-square w-[34vw] rounded-full border border-white/10" />
          <div className="absolute inset-y-0 left-1/4 w-px bg-white/10" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-white/10" />
        </div>

        <div className="relative mx-auto grid min-h-[600px] max-w-[1600px] grid-cols-[.76fr_1.24fr] items-stretch max-[940px]:grid-cols-1 max-[940px]:min-h-0">
          <div className="relative z-10 flex flex-col justify-center px-[clamp(22px,5vw,78px)] py-[clamp(58px,6.5vw,92px)]">
            <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#d13c3c]">The Beyonist Edit / Journal</span>
            <h1 className="mt-6 max-w-[720px] font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.8] tracking-[-.065em]">
              Notes for skin that wants <em className="font-normal text-[#d13c3c]">less noise.</em>
            </h1>
            <p className="mt-8 max-w-[520px] text-[13px] leading-7 text-white/90">
              Product stories, ritual thinking and focused skincare notes from the Beyonist shelf.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-[7px] uppercase tracking-[.15em] text-white/90">
              <span>Rituals</span><i className="h-px w-7 bg-white/20" /><span>Formula notes</span><i className="h-px w-7 bg-white/20" /><span>Product stories</span>
            </div>
          </div>

          <div className="relative min-h-[600px] overflow-hidden max-[940px]:min-h-[520px] max-[600px]:min-h-[440px]">
            <div className="absolute inset-[7%_7%_7%_4%] bg-[#d7b9bc]" />
            <div className="absolute inset-[10%_10%_10%_7%] z-[2] grid place-items-center overflow-hidden">
              <img onError={imageFallback} {...responsiveImageProps(featured?.image || "/images/product-hamper.webp", "(max-width: 940px) 78vw, 47vw")} alt="" className="h-full w-full object-contain p-[clamp(20px,5vw,62px)] drop-shadow-[0_30px_40px_rgba(0,0,0,.18)]" width="800" height="800" loading="eager" fetchPriority="high" decoding="async"/>
            </div>

            <div className="absolute right-[4%] top-[8%] z-[4] w-[min(220px,26%)] border-[7px] border-[#ffffff] bg-[#ffffff] p-3 text-black shadow-[0_24px_60px_rgba(0,0,0,.16)] max-[600px]:w-[34%]">
              <img src="/images/hydra-serum-800.webp" srcSet="/images/hydra-serum-480.webp 480w, /images/hydra-serum-800.webp 800w, /images/hydra-serum.webp 1080w" sizes="(max-width: 600px) 34vw, 220px" alt="" loading="lazy" fetchPriority="low" className="aspect-square w-full object-contain"  width="1080" height="1080" decoding="async"/>
              <div className="mt-2 flex justify-between text-[6px] uppercase tracking-[.14em]">
                <span>Hydration</span><span>02</span>
              </div>
            </div>

            <div className="absolute bottom-[7%] left-[5%] z-[4] w-[min(220px,25%)] -rotate-2 border-[7px] border-[#ffffff] bg-[#ffffff] p-3 text-black shadow-[0_24px_60px_rgba(0,0,0,.16)] max-[600px]:w-[34%]">
              <img src="/images/gluta-kojic-800.webp" srcSet="/images/gluta-kojic-480.webp 480w, /images/gluta-kojic-800.webp 800w, /images/gluta-kojic.webp 1080w" sizes="(max-width: 600px) 34vw, 220px" alt="" loading="lazy" fetchPriority="low" className="aspect-square w-full object-contain"  width="1080" height="1080" decoding="async"/>
              <div className="mt-2 flex justify-between text-[6px] uppercase tracking-[.14em]">
                <span>Cleanse</span><span>01</span>
              </div>
            </div>

            <div className="absolute bottom-[6%] right-[5%] z-[5] bg-[#d13c3c] px-5 py-4 text-white shadow-[0_18px_45px_rgba(0,0,0,.16)]">
              <span className="block text-[6px] uppercase tracking-[.18em] text-white/90">Featured edit</span>
              <strong className="mt-1 block max-w-[250px] font-[Georgia] text-[22px] font-normal leading-[1.05]">{featured?.title}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Page section 2. */}

      <section className="border-b border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)]">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-[7px] font-semibold uppercase tracking-[.13em] transition ${
                activeFilter === filter
                  ? "border-black bg-black text-white"
                  : "border-black/[.12] bg-transparent text-black/65 hover:border-black hover:text-black"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Section 3: Featured story / 01. */}

      <section className="px-[clamp(22px,5vw,78px)] py-[clamp(62px,6.5vw,92px)]">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-[.7fr_1.3fr] items-end gap-12 border-b border-black/10 pb-12 max-[800px]:grid-cols-1">
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Featured story / 01</span>
              <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">
                The edit we are <em className="font-normal text-[#d13c3c]">reading now.</em>
              </h2>
            </div>
            <div className="pb-1 text-[11px] leading-6 text-black/65">
              <p>A slower, more editorial layer of the store—built around products, texture, ritual and how formulas fit into real life.</p>
            </div>
          </div>

          {featured ? (
            <Link to={`/blogs/${featured.slug}`} className="group mt-10 grid min-h-[520px] grid-cols-[1.15fr_.85fr] items-stretch overflow-hidden border border-black/10 bg-[#ffffff] max-[850px]:grid-cols-1">
              <div className="grid h-full min-h-[500px] place-items-center overflow-hidden bg-[#efe7dc] max-[600px]:min-h-[360px]">
                <img onError={imageFallback} {...responsiveImageProps(featured.image, "(max-width: 850px) 88vw, 52vw")} alt={featured.title} className="h-full w-full object-contain p-[clamp(18px,5vw,64px)] transition duration-700 group-hover:scale-[1.02]" width="800" height="800" loading="lazy" decoding="async"/>
              </div>
              <div className="flex flex-col justify-between p-[clamp(30px,5vw,70px)]">
                <div>
                  <div className="flex items-center justify-between gap-4 text-[7px] uppercase tracking-[.14em] text-black/65">
                    <span>{featured.category}</span><span>{featured.readingTime || 4} min read</span>
                  </div>
                  <h3 className="mt-6 font-[Georgia] text-[clamp(42px,5vw,70px)] font-normal leading-[.93] tracking-[-.05em]">{featured.title}</h3>
                  <p className="mt-6 max-w-[520px] text-[12px] leading-7 text-black/65">{featured.excerpt}</p>
                </div>
                <span className="mt-10 inline-flex w-fit items-center gap-3 border-b border-black pb-1 text-[8px] font-semibold uppercase tracking-[.14em]">
                  Read the edit <span className="transition-transform group-hover:translate-x-1">↗</span>
                </span>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      {/* Section 4: Latest notes / 02. */}

      <section className="border-t border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)] py-[clamp(58px,6.5vw,92px)]">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex items-end justify-between gap-6 max-[640px]:items-start max-[640px]:flex-col">
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Latest notes / 02</span>
              <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.05em]">
                A smaller feed.<br/><em className="font-normal text-[#d13c3c]">Better stories.</em>
              </h2>
            </div>
            <span className="text-[8px] uppercase tracking-[.14em] text-black/65">{loading ? "Loading the edit..." : `${filtered.length} stories`}</span>
          </div>

          {filtered.length ? (
            <div className="grid grid-cols-3 gap-x-[clamp(16px,2vw,30px)] gap-y-[clamp(45px,5vw,75px)] max-[1000px]:grid-cols-2 max-[600px]:grid-cols-1">
              {filtered.map((post, index) => <StoryCard key={post._id || post.slug} post={post} index={index} />)}
            </div>
          ) : (
            <div className="grid min-h-[300px] place-items-center border border-black/10 bg-[#fffaf1] p-8 text-center">
              <div>
                <span className="text-[8px] uppercase tracking-[.16em] text-[#d13c3c]">No stories yet</span>
                <p className="mt-3 font-[Georgia] text-[34px]">This edit is still being written.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 5: The editorial promise / 03. */}

      <section className="bg-[#d13c3c] px-[clamp(22px,5vw,78px)] py-[clamp(62px,7vw,96px)] text-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[.85fr_1.15fr] items-end gap-14 max-[800px]:grid-cols-1">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-white/90">The editorial promise / 03</span>
            <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.88] tracking-[-.055em]">
              Product-led.<br/><em className="font-normal text-black">Never crowded.</em>
            </h2>
          </div>
          <div className="grid grid-cols-3 border-l border-t border-white/20 max-[620px]:grid-cols-1">
            <div className="group border-b border-r border-white/20 p-7 transition duration-300 hover:bg-black/10">
              <span className="text-[7px] uppercase tracking-[.15em] text-white/90">01</span>
              <strong className="mt-8 block font-[Georgia] text-[26px] font-normal transition-transform duration-300 group-hover:-translate-y-1">Ritual first.</strong>
              <p className="mt-3 text-[9px] leading-5 text-white/90">Stories that make routines easier to understand and keep.</p>
            </div>
            <div className="group border-b border-r border-white/20 p-7 transition duration-300 hover:bg-black/10">
              <span className="text-[7px] uppercase tracking-[.15em] text-white/90">02</span>
              <strong className="mt-8 block font-[Georgia] text-[26px] font-normal transition-transform duration-300 group-hover:-translate-y-1">Formula focus.</strong>
              <p className="mt-3 text-[9px] leading-5 text-white/90">A closer look at the products already on the Beyonist shelf.</p>
            </div>
            <div className="group border-b border-r border-white/20 p-7 transition duration-300 hover:bg-black/10">
              <span className="text-[7px] uppercase tracking-[.15em] text-white/90">03</span>
              <strong className="mt-8 block font-[Georgia] text-[26px] font-normal transition-transform duration-300 group-hover:-translate-y-1">Useful notes.</strong>
              <p className="mt-3 text-[9px] leading-5 text-white/90">Editorial content without turning the journal into noise.</p>
            </div>
          </div>
        </div>
      </section>
      <div className="h-3 bg-black" aria-hidden="true" />
    </main>
  );
}
