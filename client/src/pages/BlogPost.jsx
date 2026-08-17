/**
 * Customer-facing Blog Post page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { getEditPost } from "../services/editApi.js";
import usePageSeo from "../hooks/usePageSeo.js";
import BlogContentRenderer from "../components/BlogContentRenderer.jsx";
import { responsiveImageProps } from "../utils/productImagePath.js";


const imageFallback = (event) => {
  if (event.currentTarget.dataset.fallbackApplied) return;
  event.currentTarget.dataset.fallbackApplied = "true";
  event.currentTarget.src = "/images/product-hamper.webp";
};
const CATEGORY_VISUALS = {
  "Serum Notes": ["/images/ivy-serum.webp", "/images/hydra-serum.webp"],
  "Daily Ritual": ["/images/sunblock-lotion.webp", "/images/milky-coconut.webp"],
  Cleansing: ["/images/gluta-kojic.webp", "/images/product-hamper.webp"],
  "Formula Focus": ["/images/whipped-scrub.webp", "/images/ivy-serum.webp"],
};

/**
 * Renders the Article Skeleton component and coordinates the state/behavior owned by this UI boundary.
 */
function ArticleSkeleton() {
  return (
    <main className="bg-[#fffaf1] px-[clamp(22px,5vw,78px)] py-20">
      <div className="mx-auto max-w-[1320px] animate-pulse">
        <div className="h-2 w-36 bg-black/[.06]" />
        <div className="mt-8 h-28 max-w-[760px] bg-black/[.06]" />
        <div className="mt-12 aspect-[1.7/1] bg-black/[.06]" />
      </div>
    </main>
  );
}

/**
 * Renders the Related Card component and coordinates the state/behavior owned by this UI boundary.
 */
function RelatedCard({ post, index }) {
  return (
    <Link to={`/blogs/${post.slug}`} className="group block">
      <div className="relative aspect-[1.05/1] overflow-hidden bg-[#ece3d8]">
        <img onError={imageFallback} {...responsiveImageProps(post.image, "(max-width: 700px) 88vw, 31vw")} alt={post.imageAlt || post.title} loading="lazy" decoding="async" className="h-full w-full object-contain p-5 transition duration-700 group-hover:scale-[1.025]" />
        <span className="absolute left-3 top-3 bg-[#ffffff] px-3 py-2 text-[6px] font-semibold uppercase tracking-[.15em]">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="pt-4">
        <div className="flex items-center justify-between gap-4 text-[7px] uppercase tracking-[.13em] text-black/65">
          <span>{post.category}</span><span>{post.readingTime || 4} min read</span>
        </div>
        <h3 className="mt-3 font-[Georgia] text-[clamp(24px,2.4vw,34px)] font-normal leading-[1.02] tracking-[-.035em]">{post.title}</h3>
        <span className="mt-4 inline-flex items-center gap-2 border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.13em]">Read story <span>↗</span></span>
      </div>
    </Link>
  );
}

/**
 * Renders the Blog Post component and coordinates the state/behavior owned by this UI boundary.
 */
export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  usePageSeo(post ? {
    title: post.seoTitle || `${post.title} | The Edit · Beyonist`,
    description: post.seoDescription || post.excerpt || "A story from The Beyonist Edit.",
    image: post.image || "/images/product-hamper.webp",
    canonicalPath: `/blogs/${post.slug || slug}`,
    type: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt || "",
      image: post.image ? [post.image] : [],
      author: { "@type": "Organization", name: "Beyonist" },
      publisher: { "@type": "Organization", name: "Beyonist" },
      datePublished: post.publishedAt || post.createdAt,
      dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    },
  } : null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setPost(null);
    setRelated([]);

    getEditPost(slug)
      .then((response) => {
        if (!active) return;
        setPost(response.data);
        setRelated(response.related || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load this story.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const supportingImages = useMemo(() => {
    if (!post) return [];
    return CATEGORY_VISUALS[post.category] || ["/images/product-hamper.webp", "/images/ivy-serum.webp"];
  }, [post]);

  if (loading) return <ArticleSkeleton />;

  if (!post || error) {
    return (
      <main className="grid min-h-[65vh] place-items-center bg-[#fffaf1] px-6 py-20 text-center">
        <div className="max-w-[760px]">
          <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">The Edit</span>
          <h1 className="mt-5 font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.9] tracking-[-.055em]">This story is not on the page.</h1>
          <p className="mx-auto mt-5 max-w-xl text-[12px] leading-7 text-black/65">{error}</p>
          <Link to="/blogs" className="mt-8 inline-flex min-w-[220px] items-center justify-between bg-black px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em] text-white">
            <span>Return to The Edit</span><span>↗</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#fffaf1]">
      {/* Section 1: Home. */}
      <section className="border-b border-black/10 px-[clamp(22px,5vw,78px)]">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 py-4 text-[7px] uppercase tracking-[.14em] text-black/65">
          <Link to="/" className="transition hover:text-black">Home</Link><span>/</span>
          <Link to="/blogs" className="transition hover:text-black">The Edit</Link><span>/</span>
          <span className="truncate text-black/70">{post.title}</span>
        </div>
      </section>

      <article>
        <header className="relative overflow-hidden bg-[#111] text-white">
          <div className="pointer-events-none absolute inset-0 opacity-35">
            <div className="absolute left-[48%] top-[-32%] aspect-square w-[65vw] rounded-full border border-white/20" />
            <div className="absolute left-[58%] top-[4%] aspect-square w-[36vw] rounded-full border border-white/10" />
            <div className="absolute inset-y-0 left-1/4 w-px bg-white/10" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
            <div className="absolute inset-y-0 left-3/4 w-px bg-white/10" />
          </div>

          <div className="relative mx-auto grid min-h-[690px] max-w-[1600px] grid-cols-[.82fr_1.18fr] max-[950px]:grid-cols-1 max-[950px]:min-h-0">
            <div className="relative z-10 flex flex-col justify-center px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
              <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#d13c3c]">{post.category} / The Beyonist Edit</span>
              <h1 className="mt-7 max-w-[720px] font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.82] tracking-[-.065em]">{post.title}</h1>
              <p className="mt-8 max-w-[570px] font-[Georgia] text-[clamp(18px,1.8vw,25px)] leading-[1.45] text-white/90">{post.excerpt}</p>

              <div className="mt-10 flex flex-wrap items-center gap-4 text-[7px] uppercase tracking-[.14em] text-white/90">
                <span>{post.readingTime || 4} min read</span><i className="h-px w-6 bg-white/20" /><span>Editorial note</span><i className="h-px w-6 bg-white/20" /><span>Beyonist journal</span>
              </div>
            </div>

            <div className="relative min-h-[690px] overflow-hidden max-[950px]:min-h-[560px] max-[600px]:min-h-[440px]">
              <div className="absolute inset-[7%_7%_7%_4%] bg-[#d7c0c1]" />
              <motion.div
                initial={{ opacity: 0, y: 24, scale: .985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: .7 }}
                className="absolute inset-[10%_10%_10%_7%] z-[2] grid place-items-center"
              >
                <img onError={imageFallback} {...responsiveImageProps(post.image, "(max-width: 950px) 78vw, 48vw")} alt={post.title} className="h-full w-full object-contain p-[clamp(16px,4vw,48px)] drop-shadow-[0_34px_48px_rgba(0,0,0,.2)]" width="800" height="800" loading="eager" fetchPriority="high" decoding="async"/>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 24, rotate: 4 }}
                animate={{ opacity: 1, x: 0, rotate: 2 }}
                transition={{ duration: .65, delay: .15 }}
                className="absolute right-[4%] top-[8%] z-[4] w-[22%] min-w-[150px] border-[7px] border-[#ffffff] bg-[#ffffff] p-2.5 text-black shadow-[0_24px_60px_rgba(0,0,0,.16)] max-[600px]:min-w-[112px]"
              >
                <img {...responsiveImageProps(supportingImages[0], "180px")} alt="" className="aspect-square w-full object-contain" width="480" height="480" loading="lazy" fetchPriority="low" decoding="async"/>
                <div className="mt-2 flex justify-between text-[6px] uppercase tracking-[.14em]"><span>Formula</span><span>01</span></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20, rotate: -4 }}
                animate={{ opacity: 1, x: 0, rotate: -2 }}
                transition={{ duration: .65, delay: .22 }}
                className="absolute bottom-[6%] left-[4%] z-[4] w-[21%] min-w-[145px] border-[7px] border-[#ffffff] bg-[#ffffff] p-2.5 text-black shadow-[0_24px_60px_rgba(0,0,0,.16)] max-[600px]:min-w-[110px]"
              >
                <img {...responsiveImageProps(supportingImages[1], "180px")} alt="" className="aspect-square w-full object-contain" width="480" height="480" loading="lazy" fetchPriority="low" decoding="async"/>
                <div className="mt-2 flex justify-between text-[6px] uppercase tracking-[.14em]"><span>Ritual</span><span>02</span></div>
              </motion.div>

              <div className="absolute bottom-[6%] right-[5%] z-[5] bg-[#d13c3c] px-5 py-4 text-white">
                <span className="block text-[6px] uppercase tracking-[.18em] text-white/90">The Edit / Story</span>
                <strong className="mt-1 block max-w-[240px] font-[Georgia] text-[22px] font-normal leading-[1.05]">Product-led. Never crowded.</strong>
              </div>
            </div>
          </div>
        </header>

        {/* Section 2: Reading note. */}

        <section className="px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
          <div className="mx-auto grid max-w-[1180px] grid-cols-[230px_minmax(0,1fr)] gap-[clamp(42px,7vw,105px)] max-[800px]:grid-cols-1">
            <aside className="self-start min-[801px]:sticky min-[801px]:top-[145px]">
              <div className="border-t border-black pt-4">
                <span className="text-[7px] font-semibold uppercase tracking-[.16em] text-[#d13c3c]">Reading note</span>
                <p className="mt-4 text-[10px] leading-5 text-black/65">A concise Beyonist story built around the shelf, texture and daily ritual.</p>
              </div>

              <div className="mt-8 border-y border-black/10 py-5">
                <div className="flex items-center justify-between text-[7px] uppercase tracking-[.14em] text-black/65">
                  <span>Category</span><span className="text-black">{post.category}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-[7px] uppercase tracking-[.14em] text-black/65">
                  <span>Reading</span><span className="text-black">{post.readingTime || 4} min</span>
                </div>
              </div>

              <Link to="/shop" className="mt-6 inline-flex items-center gap-2 border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.13em]">
                Shop the collection <span>↗</span>
              </Link>
            </aside>

            <div>
              <div className="max-w-[900px]">
                <BlogContentRenderer blocks={post.contentBlocks} fallback={post.content} />
              </div>

              <div className="my-[clamp(58px,7vw,95px)] grid grid-cols-[1.05fr_.95fr] items-stretch border-y border-black/10 max-[760px]:grid-cols-1">
                <div className="grid min-h-[380px] place-items-center overflow-hidden bg-[#e8ddd0] p-8">
                  <img {...responsiveImageProps(supportingImages[0], "(max-width: 760px) 88vw, 45vw")} alt="" className="h-full max-h-[430px] w-full object-contain drop-shadow-[0_24px_35px_rgba(40,15,5,.12)]" width="800" height="800" loading="lazy" decoding="async"/>
                </div>
                <div className="flex flex-col justify-center p-[clamp(28px,5vw,58px)]">
                  <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Formula in context / 01</span>
                  <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.95] tracking-[-.05em]">
                    The product is only useful when the <em className="font-normal text-[#d13c3c]">ritual makes sense.</em>
                  </h2>
                  <p className="mt-5 text-[11px] leading-6 text-black/65">The Edit connects product stories back to the way formulas actually fit into a routine.</p>
                </div>
              </div>

              <div className="border-l-[3px] border-[#d13c3c] pl-[clamp(24px,4vw,52px)]">
                <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">The takeaway</span>
                <blockquote className="mt-5 max-w-[850px] font-[Georgia] text-[clamp(42px,5.4vw,74px)] font-normal leading-[.96] tracking-[-.055em]">
                  Better skincare does not need a louder shelf. It needs a clearer place in the ritual.
                </blockquote>
              </div>

              <div className="mt-[clamp(62px,8vw,110px)] grid grid-cols-[.8fr_1.2fr] gap-[clamp(35px,6vw,80px)] border-t border-black/10 pt-[clamp(40px,5vw,65px)] max-[760px]:grid-cols-1">
                <div>
                  <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Editorial note / 02</span>
                  <h3 className="mt-4 font-[Georgia] text-[clamp(36px,4.4vw,58px)] font-normal leading-[.98] tracking-[-.045em]">Less content.<br/><em className="font-normal text-[#d13c3c]">More context.</em></h3>
                </div>
                <p className="max-w-[720px] text-[12px] leading-7 text-black/65">
                  The Edit is designed as the editorial layer of Beyonist: product-led notes, routine thinking and useful context without turning the experience into an endless feed. Each story should help the product shelf feel easier to understand rather than simply adding more things to read.
                </p>
              </div>
            </div>
          </div>
        </section>
      </article>

      {related.length ? (
        <section className="border-t border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-10 flex items-end justify-between gap-8 max-[700px]:items-start max-[700px]:flex-col">
              <div>
                <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Continue The Edit / 03</span>
                <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.05em]">Read something<br/><em className="font-normal text-[#d13c3c]">next.</em></h2>
              </div>
              <Link to="/blogs" className="border-b border-black pb-1 text-[8px] font-semibold uppercase tracking-[.14em]">View all stories ↗</Link>
            </div>

            <div className="grid grid-cols-3 gap-x-[clamp(16px,2vw,28px)] gap-y-12 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
              {related.map((item, index) => <RelatedCard key={item._id || item.slug} post={item} index={index} />)}
            </div>
          </div>
        </section>
      ) : null}

      {/* Section 4: End note. */}

      <section className="bg-[#d13c3c] px-[clamp(22px,5vw,78px)] py-[clamp(62px,7vw,96px)] text-white">
        <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-10 max-[700px]:items-start max-[700px]:flex-col">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-white/90">End note</span>
            <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.88] tracking-[-.055em]">Keep the shelf<br/><em className="font-normal text-black">intentional.</em></h2>
          </div>
          <Link to="/shop" className="inline-flex min-w-[235px] items-center justify-between bg-black px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em]">
            <span>Explore products</span><span>↗</span>
          </Link>
        </div>
      </section>

      <div className="h-3 bg-black" aria-hidden="true" />
    </main>
  );
}
