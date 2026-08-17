/**
 * Beyonist home page — a modern evolution of the original React storefront.
 *
 * The page remains product-first and ecommerce familiar while keeping the
 * current MERN catalogue routes, testimonials, motion and responsive behavior.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import ProductCard from "../components/ProductCard.jsx";
import CampaignHero from "../components/CampaignHero.jsx";
import { products } from "../data/products.js";
import { getPublishedTestimonials } from "../services/reviewApi.js";
import { responsiveImageProps } from "../utils/productImagePath.js";

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: .18 },
  transition: { duration: .55, ease: [0.22,1,0.36,1] },
};

const concerns = [
  { title: "Brighten", copy: "Dullness & uneven tone", image: "/images/whitening-serum.webp", to: "/shop?concern=radiance" },
  { title: "Hydrate", copy: "Dry & thirsty skin", image: "/images/hydra-serum.webp", to: "/shop?concern=hydration" },
  { title: "Protect", copy: "Everyday UV defence", image: "/images/sunblock-lotion.webp", to: "/shop?concern=protection" },
  { title: "Smooth", copy: "Texture & body care", image: "/images/whipped-scrub.webp", to: "/shop?concern=texture" },
];

const ritual = [
  { step: "01", title: "Cleanse", copy: "Start fresh without overcomplicating it.", image: "/images/gluta-kojic.webp", to: "/product/gluta-kojic" },
  { step: "02", title: "Treat", copy: "Choose the formula your skin actually needs.", image: "/images/hydra-serum.webp", to: "/product/hydra-serum" },
  { step: "03", title: "Protect", copy: "Finish your morning with everyday defence.", image: "/images/sunblock-lotion.webp", to: "/product/sunblock-lotion" },
];

function GoogleGIcon({ className="h-5 w-5" }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.23c1.89-1.74 2.99-4.31 2.99-7.39Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.38l-3.23-2.53c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.6A9.99 9.99 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.92A5.99 5.99 0 0 1 6.1 12c0-.67.12-1.32.31-1.92v-2.6H3.07A9.98 9.98 0 0 0 2 12c0 1.61.38 3.14 1.07 4.52l3.34-2.6Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.62 9.62 0 0 0 12 2a9.99 9.99 0 0 0-8.93 5.48l3.34 2.6C7.2 7.72 9.4 5.96 12 5.96Z"/></svg>;
}

function TestimonialCard({ review }) {
  const googleSource = review.source === "google";
  return (
    <article className="store-card min-w-[min(390px,86vw)] rounded-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#d13c3c] font-[Georgia] text-[18px] text-white">{String(review.displayName || "V").charAt(0)}</div>
          <div>
            <strong className="block text-[10px]">{review.displayName || "Verified customer"}</strong>
            <span className="mt-1 block text-[6px] uppercase tracking-[.12em] text-black/65">{review.verifiedPurchase ? "Verified purchase" : "Customer review"}</span>
          </div>
        </div>
        {googleSource ? <div className="flex items-center gap-1.5 text-[7px] text-black/65"><GoogleGIcon/><span>Google</span></div> : <span className="grid h-6 w-6 place-items-center rounded-full bg-[#34a853] text-[10px] text-white" title="Verified purchase">✓</span>}
      </div>
      <div className="mt-5 text-[17px] text-[#fbbc04]">{"★".repeat(review.rating)}<span className="text-black/10">{"★".repeat(5-review.rating)}</span></div>
      <strong className="mt-4 block font-[Georgia] text-[22px] font-normal">{review.title || "A verified Beyonist experience"}</strong>
      <p className="mt-3 text-[10px] leading-6 text-black/65">{review.body}</p>
    </article>
  );
}

function TestimonialsSlider({ reviews }) {
  const trackRef = useRef(null);
  const move = (direction) => trackRef.current?.scrollBy({ left: direction * Math.min(trackRef.current.clientWidth * .88, 410), behavior:"smooth" });
  return (
    <div className="mt-9">
      <div className="mb-4 flex justify-end gap-2">
        <button type="button" onClick={()=>move(-1)} aria-label="Previous customer review" className="grid h-10 w-10 place-items-center rounded-full border border-black/15 bg-white">←</button>
        <button type="button" onClick={()=>move(1)} aria-label="Next customer review" className="grid h-10 w-10 place-items-center rounded-full bg-[#171313] text-white">→</button>
      </div>
      <div ref={trackRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {reviews.map(review=><div key={review._id} className="snap-start"><TestimonialCard review={review}/></div>)}
      </div>
    </div>
  );
}

export default function Home() {
  const [testimonials,setTestimonials]=useState([]);
  const [activeConcern,setActiveConcern]=useState(0);

  useEffect(()=> {
    getPublishedTestimonials().then(response=>setTestimonials(response.data||[])).catch(()=>setTestimonials([]));
  },[]);

  return (
    <main className="bg-[#fffaf1]">
      <CampaignHero />

      <section className="border-b border-black/10 bg-white px-[clamp(20px,5vw,72px)]">
        <div className="mx-auto grid max-w-[1420px] grid-cols-4 divide-x divide-black/10 max-[760px]:grid-cols-2 max-[760px]:divide-y max-[480px]:grid-cols-1">
          {[
            ["01","Formula-led","Focused products, no overloaded shelf."],
            ["02","Made in India","Skincare created for real everyday routines."],
            ["03","Secure checkout","Protected ordering and payment flow."],
            ["04","Order updates","Transactional email updates from order to delivery."],
          ].map(([n,title,copy])=>(
            <div key={n} className="px-5 py-5 first:pl-0 max-[760px]:first:pl-5">
              <span className="text-[7px] font-semibold text-[#d13c3c]">{n}</span>
              <strong className="ml-3 text-[9px] uppercase tracking-[.1em]">{title}</strong>
              <p className="mt-2 text-[9px] leading-5 text-black/65">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-[clamp(20px,5vw,72px)] py-[clamp(64px,7vw,96px)]">
        <div className="mx-auto max-w-[1420px]">
          <div className="flex items-end justify-between gap-8 max-[700px]:items-start max-[700px]:flex-col">
            <motion.div {...reveal}>
              <span className="text-[8px] font-semibold uppercase tracking-[.17em] text-[#d13c3c]">Bestsellers</span>
              <h2 className="section-display mt-3">The products customers<br/><em className="font-normal text-[#d13c3c]">keep coming back to.</em></h2>
            </motion.div>
            <Link to="/shop?view=bestsellers" className="store-button-secondary px-5 py-3.5 text-[8px] font-semibold uppercase tracking-[.12em]">View all products →</Link>
          </div>

          <div className="mt-10 grid grid-cols-4 gap-5 max-[1050px]:grid-cols-2 max-[560px]:grid-cols-1">
            {products.slice(0,4).map((product,index)=><ProductCard key={product.id} product={product} index={index}/>)}
          </div>
        </div>
      </section>

      <section className="bg-[#d13c3c] px-[clamp(20px,5vw,72px)] py-[clamp(42px,5vw,64px)] text-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-10 max-[760px]:flex-col max-[760px]:items-start">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.16em] text-white/90">New to Beyonist?</span>
            <h2 className="mt-3 font-[Georgia] text-[clamp(32px,4vw,52px)] font-normal leading-[1]">Start with the formulas<br/>people already love.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/shop?view=bestsellers" className="bg-[#171313] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.12em] text-white">Shop bestsellers →</Link>
            <Link to="/shop" className="border border-white px-5 py-4 text-[8px] font-semibold uppercase tracking-[.12em] text-white">Browse all →</Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-[clamp(20px,5vw,72px)] py-[clamp(64px,7vw,100px)]">
        <div className="mx-auto grid max-w-[1320px] grid-cols-[1.05fr_.95fr] items-center gap-[clamp(40px,7vw,100px)] max-[850px]:grid-cols-1">
          <motion.div {...reveal} className="relative grid min-h-[480px] place-items-center overflow-hidden rounded-sm bg-[#faf6af] p-[clamp(24px,4vw,46px)] max-[560px]:min-h-[360px]">
            <div className="absolute left-1/2 top-1/2 aspect-square w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d13c3c]/18"/>
            <img src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist complete skincare collection" width="1000" height="1000" loading="lazy" decoding="async" className="relative z-[2] h-[86%] w-[86%] object-contain"/>
            <span className="absolute left-5 top-5 z-[5] bg-white px-3.5 py-2.5 text-[7px] font-semibold uppercase tracking-[.12em] shadow-[0_8px_18px_rgba(0,0,0,.06)]">Complete care</span>
          </motion.div>
          <motion.div {...reveal}>
            <span className="text-[8px] font-semibold uppercase tracking-[.17em] text-[#d13c3c]">The complete shelf</span>
            <h2 className="section-display mt-4 max-w-[650px]">A full routine,<br/><em className="block max-w-[620px] font-normal text-[#d13c3c]">without the guesswork.</em></h2>
            <p className="mt-5 max-w-[530px] text-[12px] leading-7 text-black/65">Explore the Beyonist collection together when you want a straightforward starting point across cleanse, treat, hydrate and protect.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop" className="store-button-primary px-6 py-4 text-[8px] font-semibold uppercase tracking-[.12em]">Shop the collection →</Link>
              <Link to="/about" className="store-button-secondary px-6 py-4 text-[8px] font-semibold uppercase tracking-[.12em]">Why Beyonist?</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-[clamp(20px,5vw,72px)] py-[clamp(64px,7vw,96px)]">
        <div className="mx-auto max-w-[1420px]">
          <div className="grid grid-cols-[.75fr_1.25fr] items-end gap-10 max-[820px]:grid-cols-1">
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-[.17em] text-[#d13c3c]">Shop by concern</span>
              <h2 className="section-display mt-4">What does your skin<br/><em className="font-normal text-[#d13c3c]">need today?</em></h2>
              <p className="mt-5 max-w-[410px] text-[11px] leading-6 text-black/65">A clearer way to browse the shelf by what you actually want from the product.</p>
            </div>
            <div className="grid grid-cols-4 gap-3 max-[700px]:grid-cols-2 max-[420px]:grid-cols-1">
              {concerns.map((item,index)=>(
                <button key={item.title} type="button" onClick={()=>setActiveConcern(index)} className={`border p-4 text-left transition ${activeConcern===index?"border-[#d13c3c] bg-white":"border-black/10 bg-white/55 hover:bg-white"}`}>
                  <img {...responsiveImageProps(item.image, "(max-width: 420px) 84vw, (max-width: 700px) 42vw, 20vw")} alt="" loading="lazy" decoding="async" width="800" height="800" className="aspect-square w-full object-contain"/>
                  <strong className="mt-3 block font-[Georgia] text-[22px] font-normal">{item.title}</strong>
                  <span className="mt-1 block text-[7px] uppercase tracking-[.1em] text-black/65">{item.copy}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="store-card mt-5 grid grid-cols-[1fr_auto] items-center gap-6 p-5 max-[650px]:grid-cols-1">
            <div><strong className="font-[Georgia] text-[27px] font-normal">{concerns[activeConcern].title}</strong><p className="mt-2 text-[10px] text-black/65">{concerns[activeConcern].copy}</p></div>
            <Link to={concerns[activeConcern].to} className="store-button-primary px-5 py-3.5 text-center text-[8px] font-semibold uppercase tracking-[.12em]">Shop this concern →</Link>
          </div>
        </div>
      </section>

      <section className="bg-[#faf6af] px-[clamp(20px,5vw,72px)] py-[clamp(64px,7vw,96px)]">
        <div className="mx-auto max-w-[1320px]">
          <div className="text-center">
            <span className="text-[8px] font-semibold uppercase tracking-[.17em] text-[#d13c3c]">Keep it simple</span>
            <h2 className="section-display mx-auto mt-4 max-w-[760px]">Three easy moves.<br/><em className="font-normal text-[#d13c3c]">One everyday routine.</em></h2>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-5 max-[720px]:grid-cols-1">
            {ritual.map(item=>(
              <Link key={item.step} to={item.to} className="store-card group p-5 transition hover:-translate-y-1">
                <div className="flex items-center justify-between"><span className="text-[8px] font-semibold text-[#d13c3c]">{item.step}</span><span>→</span></div>
                <div className="mt-3 grid aspect-[1.2] place-items-center bg-[#fffaf1]"><img {...responsiveImageProps(item.image, "(max-width: 720px) 86vw, 30vw")} alt="" loading="lazy" decoding="async" width="800" height="800" className="h-full w-full object-contain transition group-hover:scale-[1.025]"/></div>
                <strong className="mt-5 block font-[Georgia] text-[27px] font-normal">{item.title}</strong>
                <p className="mt-2 text-[10px] leading-5 text-black/65">{item.copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length ? (
        <section className="bg-white px-[clamp(20px,5vw,72px)] py-[clamp(64px,7vw,96px)]">
          <div className="mx-auto max-w-[1420px]">
            <div className="flex items-end justify-between gap-8 max-[760px]:items-start max-[760px]:flex-col">
              <div>
                <span className="text-[8px] font-semibold uppercase tracking-[.17em] text-[#d13c3c]">Verified customer reviews</span>
                <h2 className="section-display mt-4">Real orders.<br/><em className="font-normal text-[#d13c3c]">Real experiences.</em></h2>
              </div>
              <p className="max-w-[420px] text-[10px] leading-6 text-black/65">Reviews published from delivered Beyonist purchases are marked as verified. Google branding appears only for reviews actually sourced from Google.</p>
            </div>
            <TestimonialsSlider reviews={testimonials}/>
          </div>
        </section>
      ) : null}

      <section className="px-[clamp(20px,5vw,72px)] py-[clamp(60px,7vw,92px)]">
        <div className="mx-auto grid max-w-[1320px] grid-cols-[1.15fr_.85fr] overflow-hidden rounded-sm bg-[#171313] text-white max-[780px]:grid-cols-1">
          <div className="p-[clamp(28px,5vw,64px)]">
            <span className="text-[8px] font-semibold uppercase tracking-[.17em] text-[#d13c3c]">The Edit</span>
            <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[1]">Skincare notes that<br/>make the shelf easier.</h2>
            <p className="mt-5 max-w-[520px] text-[11px] leading-6 text-white/58">Read product-led stories, routine guidance and formula context without the endless feed.</p>
            <Link to="/blogs" className="mt-7 inline-flex bg-[#d13c3c] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.12em]">Read The Edit →</Link>
          </div>
          <div className="grid min-h-[320px] place-items-center bg-[#f7e9e5] p-7"><img src="/images/ivy-serum-800.webp" srcSet="/images/ivy-serum-480.webp 480w, /images/ivy-serum-800.webp 800w, /images/ivy-serum.webp 1080w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist serum" loading="lazy" decoding="async" width="800" height="800" className="h-full max-h-[340px] w-full object-contain"/></div>
        </div>
      </section>
    </main>
  );
}
