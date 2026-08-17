/**
 * Customer-facing Shop page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import ShopProductCard from "../components/ShopProductCard.jsx";
import { getCatalogMeta, getProducts } from "../services/catalogApi.js";

const DEFAULT_META = {
  categories: ["Cleansing", "Serums", "Body Care", "Sun Care"],
  priceRange: { min: 0, max: 1500 },
};

const SORTS = [
  { value: "featured", label: "Featured first", description: "Beyonist highlights" },
  { value: "newest", label: "Newest arrivals", description: "Latest additions" },
  { value: "price-asc", label: "Price · low to high", description: "Start with essentials" },
  { value: "price-desc", label: "Price · high to low", description: "Premium first" },
  { value: "rating", label: "Top rated", description: "Customer favourites" },
];

/**
 * Renders the Chevron Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function ChevronIcon({ open = false }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 fill-none stroke-current stroke-[1.4] transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
      <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
    </svg>
  );
}

/**
 * Renders the Sort Dropdown component and coordinates the state/behavior owned by this UI boundary.
 */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = SORTS.find((item) => item.value === value) || SORTS[0];

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative w-full shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-[58px] w-full min-w-[260px] items-center justify-between gap-5 border px-5 text-left transition max-[560px]:min-w-0 ${open ? "border-black bg-black text-white" : "border-black/15 bg-white/45 text-black hover:border-black/40"}`}
      >
        <span>
          <small className={`block text-[6px] font-semibold uppercase tracking-[.17em] ${open ? "text-white/90" : "text-black/65"}`}>Sort collection</small>
          <strong className="mt-1 block text-[9px] font-medium uppercase tracking-[.12em]">{selected.label}</strong>
        </span>
        <ChevronIcon open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Sort products"
            initial={{ opacity: 0, y: -8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-full border border-black/10 bg-[#ffffff] p-2 shadow-[0_24px_70px_rgba(0,0,0,.15)] max-[560px]:left-0 max-[560px]:right-auto max-[560px]:w-full"
          >
            {SORTS.map((item, index) => {
              const active = item.value === value;
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  key={item.value}
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className={`group flex w-full items-center gap-4 px-3 py-3.5 text-left transition ${active ? "bg-[#d13c3c] text-white" : "hover:bg-black/[.045]"}`}
                >
                  <span className={`text-[7px] tracking-[.13em] ${active ? "text-white/90" : "text-black/65"}`}>{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-[9px] font-medium uppercase tracking-[.11em]">{item.label}</strong>
                    <small className={`mt-1 block text-[7px] tracking-[.05em] ${active ? "text-white/90" : "text-black/65"}`}>{item.description}</small>
                  </span>
                  <span className={`grid h-5 w-5 place-items-center rounded-full border text-[9px] ${active ? "border-white bg-white text-[#d13c3c]" : "border-black/15 text-transparent group-hover:border-black/40"}`}>✓</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Renders the Filter Option component and coordinates the state/behavior owned by this UI boundary.
 */
function FilterOption({ active, children, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`group flex w-full items-center justify-between border-b border-black/10 py-3.5 text-left text-[11px] transition ${active ? "text-[#d13c3c]" : "text-black/65 hover:text-black"}`}>
      <span>{children}</span>
      <span className={`grid h-5 w-5 place-items-center rounded-full border transition ${active ? "border-[#d13c3c]" : "border-black/15 group-hover:border-black/40"}`}>
        <span className={`h-2 w-2 rounded-full bg-[#d13c3c] transition ${active ? "scale-100" : "scale-0"}`} />
      </span>
    </button>
  );
}

/**
 * Renders the Price Field component and coordinates the state/behavior owned by this UI boundary.
 */
function PriceField({ label, value, placeholder, onChange }) {
  return (
    <label className="group border border-black/15 bg-white/25 px-3 py-2.5 transition focus-within:border-black focus-within:bg-white/60">
      <span className="block text-[6px] font-semibold uppercase tracking-[.16em] text-black/65">{label}</span>
      <span className="mt-1 flex items-center gap-1 font-[Georgia] text-[15px]">
        <span className="text-black/65">₹</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          placeholder={placeholder}
          className="min-w-0 w-full appearance-none bg-transparent font-sans text-[12px] outline-none placeholder:text-black/65"
        />
      </span>
    </label>
  );
}

/**
 * Renders the Filter Panel component and coordinates the state/behavior owned by this UI boundary.
 */
function FilterPanel({ filters, meta, updateFilter, resetFilters }) {
  return (
    <div className="space-y-9">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[8px] font-semibold uppercase tracking-[.18em]">Category</h3>
          {filters.category ? <button type="button" onClick={() => updateFilter("category", "")} className="text-[7px] uppercase tracking-[.13em] text-black/65 transition hover:text-[#d13c3c]">Clear</button> : null}
        </div>
        <div>
          <FilterOption active={!filters.category} onClick={() => updateFilter("category", "")}>All products</FilterOption>
          {meta.categories.map((item) => <FilterOption key={item} active={filters.category === item} onClick={() => updateFilter("category", item)}>{item}</FilterOption>)}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-[8px] font-semibold uppercase tracking-[.18em]">Price range</h3>
            <p className="mt-1 text-[7px] leading-4 text-black/65">Set a minimum, maximum, or both.</p>
          </div>
          {(filters.minPrice || filters.maxPrice) ? <button type="button" onClick={() => { updateFilter("minPrice", ""); updateFilter("maxPrice", ""); }} className="text-[7px] uppercase tracking-[.13em] text-black/65 transition hover:text-[#d13c3c]">Clear</button> : null}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <PriceField label="Minimum" value={filters.minPrice} onChange={(value) => updateFilter("minPrice", value)} placeholder={String(meta.priceRange.min)} />
          <PriceField label="Maximum" value={filters.maxPrice} onChange={(value) => updateFilter("maxPrice", value)} placeholder={String(meta.priceRange.max)} />
        </div>
        <div className="mt-3 flex justify-between text-[6px] uppercase tracking-[.12em] text-black/65"><span>₹{meta.priceRange.min}</span><span>Catalogue range</span><span>₹{meta.priceRange.max}</span></div>
      </div>

      <button type="button" onClick={resetFilters} className="group flex w-full items-center justify-between border border-black px-4 py-3.5 text-[8px] uppercase tracking-[.14em] transition hover:bg-black hover:text-white">
        <span>Reset filters</span><span className="transition-transform group-hover:rotate-90">↻</span>
      </button>
    </div>
  );
}

/**
 * Renders the Skeleton Card component and coordinates the state/behavior owned by this UI boundary.
 */
function SkeletonCard() {
  return <div className="animate-pulse"><div className="aspect-square bg-black/[.06]" /><div className="mt-4 h-2 w-20 bg-black/[.06]" /><div className="mt-4 h-7 w-4/5 bg-black/[.06]" /><div className="mt-5 h-3 w-12 bg-black/[.06]" /></div>;
}

/**
 * Renders the Shop component and coordinates the state/behavior owned by this UI boundary.
 */
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const searchTimer = useRef(null);

  const filters = useMemo(() => ({
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "featured",
    page: Number(searchParams.get("page") || 1),
  }), [searchParams]);

  /**
   * Updates filter while preserving the surrounding domain invariants.
   */
  const updateFilter = (key, value, { keepPage = false } = {}) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (!keepPage && key !== "page") next.delete("page");
    setSearchParams(next, { replace: true });
  };

  /**
   * Implements the reset filters operation used by this module.
   */
  const resetFilters = () => {
    const next = new URLSearchParams();
    if (filters.sort !== "featured") next.set("sort", filters.sort);
    setSearchValue("");
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    getCatalogMeta().then((response) => setMeta(response.data || DEFAULT_META)).catch(() => {});
  }, []);

  useEffect(() => {
    setSearchValue(filters.q);
  }, [filters.q]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getProducts({ ...filters, limit: 12 }).then((response) => {
      if (!active) return;
      setProducts(response.data || []);
      setPagination(response.pagination || { page: 1, pages: 1, total: response.data?.length || 0, limit: 12 });
    }).catch((err) => {
      if (!active) return;
      setProducts([]);
      setError(err.message || "Unable to load products.");
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.sort, filters.page, filters.q]);

  useEffect(() => () => window.clearTimeout(searchTimer.current), []);

  /**
   * Handles the search interaction and keeps related UI/API state synchronized.
   */
  const handleSearch = (value) => {
    setSearchValue(value);
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => updateFilter("q", value), 280);
  };

  /**
   * Implements the clear search operation used by this module.
   */
  const clearSearch = () => {
    window.clearTimeout(searchTimer.current);
    setSearchValue("");
    updateFilter("q", "");
  };

  const activeCount = [filters.category, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <main className="bg-[#fffaf1]">
      {/* Section 1: Page section 1. */}
      <section className="relative overflow-hidden border-b border-black/10 bg-[#d13c3c] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute left-[34%] top-[-32%] aspect-square w-[62vw] rounded-full border border-white/35" />
          <div className="absolute left-[46%] top-[-5%] aspect-square w-[38vw] rounded-full border border-white/20" />
          <div className="absolute inset-y-0 left-1/4 w-px bg-white/10" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-white/10" />
        </div>

        <div className="relative mx-auto grid min-h-[540px] max-w-[1600px] grid-cols-[.78fr_1.22fr] items-stretch max-[950px]:grid-cols-1 max-[950px]:min-h-0">
          <div className="relative z-10 flex flex-col justify-center px-[clamp(22px,5vw,78px)] py-[clamp(44px,5vw,66px)] pr-[clamp(28px,4vw,64px)] max-[950px]:pb-10">
            <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-white/90">The Beyonist collection / 01</span>
            <h1 className="mt-5 max-w-[720px] font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.82] tracking-[-.065em]">
              The formulas your <em className="font-normal text-black">skin</em> comes back to.
            </h1>
            <p className="mt-5 max-w-[470px] text-[13px] leading-6 text-white/90">
              Targeted skincare, uncomplicated routines and product-led results. A concise edit of formulas designed to earn their place in your daily ritual.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-[7px] uppercase tracking-[.15em] text-white/90">
              <span>Formula-led</span><i className="h-px w-7 bg-white/35" /><span>Made in India</span><i className="h-px w-7 bg-white/35" /><span>Daily rituals</span>
            </div>

            <a href="#collection" className="group mt-8 flex w-full max-w-[260px] items-center justify-between bg-black px-5 py-4 text-[8px] font-semibold uppercase tracking-[.15em] text-white transition hover:-translate-y-1">
              <span>Explore the collection</span><span className="transition-transform group-hover:translate-x-1">↗</span>
            </a>
          </div>

          <div className="relative min-h-[540px] overflow-hidden max-[950px]:min-h-[430px] max-[600px]:min-h-[360px]">
            <div className="absolute inset-[6%_8%_6%_3%] bg-[#f6d7c6] max-[950px]:inset-[2%_5%_8%]" />

            <motion.div
              initial={{ opacity: 0, y: 28, scale: .98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: .75, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-[7%_10%_7%_4%] z-[2] grid place-items-center max-[950px]:inset-[4%_7%_8%]"
            >
              <img src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist skincare collection" loading="eager" fetchPriority="high" className="h-full w-full object-contain drop-shadow-[0_35px_45px_rgba(70,0,5,.2)]"  width="1000" height="1000" decoding="async"/>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24, rotate: 4 }}
              animate={{ opacity: 1, x: 0, rotate: 2 }}
              transition={{ duration: .7, delay: .18 }}
              className="absolute right-[4%] top-[6%] z-[4] w-[20%] min-w-[145px] border-[8px] border-[#ffffff] bg-[#ffffff] shadow-[0_24px_60px_rgba(0,0,0,.16)] max-[600px]:right-[3%] max-[600px]:top-[5%] max-[600px]:min-w-[112px]"
            >
              <img src="/images/hydra-serum-800.webp" srcSet="/images/hydra-serum-480.webp 480w, /images/hydra-serum-800.webp 800w, /images/hydra-serum.webp 1080w" sizes="(max-width: 600px) 34vw, 220px" alt="Tiar A Hydra Serum" loading="lazy" fetchPriority="low" className="aspect-square w-full object-cover"  width="1080" height="1080" decoding="async"/>
              <div className="flex items-center justify-between px-3 py-2 text-black"><span className="text-[6px] uppercase tracking-[.15em]">Hydrate</span><span className="font-[Georgia] text-[12px]">02</span></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -24, rotate: -4 }}
              animate={{ opacity: 1, x: 0, rotate: -2 }}
              transition={{ duration: .7, delay: .25 }}
              className="absolute bottom-[5%] left-[4%] z-[4] w-[21%] min-w-[150px] border-[8px] border-[#ffffff] bg-[#ffffff] shadow-[0_24px_60px_rgba(0,0,0,.16)] max-[600px]:bottom-[4%] max-[600px]:left-[3%] max-[600px]:min-w-[115px]"
            >
              <img src="/images/gluta-kojic-800.webp" srcSet="/images/gluta-kojic-480.webp 480w, /images/gluta-kojic-800.webp 800w, /images/gluta-kojic.webp 1080w" sizes="(max-width: 600px) 34vw, 220px" alt="Gluta Kojic Whitening Soap" loading="lazy" fetchPriority="low" className="aspect-square w-full object-cover"  width="1080" height="1080" decoding="async"/>
              <div className="flex items-center justify-between px-3 py-2 text-black"><span className="text-[6px] uppercase tracking-[.15em]">Cleanse</span><span className="font-[Georgia] text-[12px]">01</span></div>
            </motion.div>

            <div className="absolute bottom-[5%] right-[4%] z-[5] bg-black px-4 py-3 text-white shadow-[0_18px_45px_rgba(0,0,0,.16)]">
              <span className="block text-[6px] uppercase tracking-[.18em] text-white/90">The daily edit</span>
              <strong className="mt-1 block font-[Georgia] text-[20px] font-normal">Curated, not crowded.</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Page section 2. */}

      <section id="collection" className="sticky top-[84px] z-30 border-b border-black/10 bg-[#fffaf1]/95 px-[clamp(22px,5vw,78px)] backdrop-blur max-[900px]:top-[70px]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_300px] items-stretch gap-3 py-3 max-[900px]:grid-cols-[minmax(0,1fr)_auto] max-[560px]:grid-cols-1">
          <label className="flex h-[58px] min-w-0 items-center gap-3 border border-black/15 bg-white/45 px-5 transition focus-within:border-black focus-within:bg-white/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[1.5]" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
            <input value={searchValue} onChange={(event) => handleSearch(event.target.value)} placeholder="Search the collection..." className="w-full bg-transparent text-[11px] outline-none placeholder:text-black/65" />
            {searchValue ? <button type="button" onClick={clearSearch} aria-label="Clear search" className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[16px] text-black/65 transition hover:bg-black hover:text-white">×</button> : null}
          </label>
          <button type="button" onClick={() => setFiltersOpen(true)} className="hidden h-[58px] shrink-0 items-center gap-3 border border-black/15 bg-white/35 px-5 text-[8px] uppercase tracking-[.13em] transition hover:border-black max-[900px]:flex">
            <span>Refine {activeCount ? `(${activeCount})` : ""}</span><span>＋</span>
          </button>
          <SortDropdown value={filters.sort} onChange={(value) => updateFilter("sort", value)} />
        </div>
      </section>

      {/* Section 3: Refine collection. */}

      <section className="px-[clamp(22px,5vw,78px)] py-[clamp(55px,6vw,90px)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[245px_1fr] gap-[clamp(42px,5vw,78px)] max-[900px]:grid-cols-1">
          <aside className="max-[900px]:hidden"><div className="sticky top-[165px]"><div className="mb-8 flex items-center justify-between border-b border-black pb-4"><span className="text-[8px] font-semibold uppercase tracking-[.18em]">Refine collection</span><span className="text-[7px] uppercase tracking-[.13em] text-black/65">{activeCount} active</span></div><FilterPanel filters={filters} meta={meta} updateFilter={updateFilter} resetFilters={resetFilters} /></div></aside>

          <div>
            <div className="mb-8 flex items-end justify-between gap-6 border-b border-black/10 pb-4"><div><span className="text-[7px] uppercase tracking-[.14em] text-black/65">Collection</span><p className="mt-1 font-[Georgia] text-[23px]">{loading ? "Curating the shelf..." : `${pagination.total} ${pagination.total === 1 ? "formula" : "formulas"}`}</p></div>{filters.q ? <button onClick={clearSearch} className="text-[8px] uppercase tracking-[.13em] text-black/65 underline underline-offset-4 transition hover:text-[#d13c3c]">Clear search</button> : null}</div>

            {error ? (
              <div className="border border-[#d13c3c]/25 bg-[#d13c3c]/5 p-8"><span className="text-[8px] uppercase tracking-[.16em] text-[#d13c3c]">Catalogue unavailable</span><h2 className="mt-4 font-[Georgia] text-3xl">The product API could not be reached.</h2><p className="mt-3 max-w-xl text-[12px] leading-6 text-black/65">{error} Start the Express server and MongoDB, then reload this page.</p></div>
            ) : loading ? (
              <div className="grid grid-cols-3 gap-[clamp(12px,1.8vw,26px)] max-[1150px]:grid-cols-2 max-[560px]:grid-cols-1 max-[560px]:gap-7">{Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}</div>
            ) : products.length ? (
              <>
                <div className="grid grid-cols-3 items-stretch gap-x-[clamp(12px,1.8vw,26px)] gap-y-[clamp(38px,4vw,62px)] max-[1150px]:grid-cols-2 max-[560px]:grid-cols-1 max-[560px]:gap-y-9">{products.map((product, index) => <ShopProductCard key={product._id || product.slug || product.id} product={product} index={index} />)}</div>
                {pagination.pages > 1 && (
                  <nav aria-label="Product pagination" className="mt-20 flex items-center justify-between gap-4 border-t border-black/10 pt-6 max-[560px]:flex-wrap">
                    <button disabled={pagination.page <= 1} onClick={() => updateFilter("page", String(pagination.page - 1), { keepPage: true })} className="group flex items-center gap-3 text-[8px] uppercase tracking-[.14em] transition disabled:pointer-events-none disabled:opacity-25"><span className="transition-transform group-hover:-translate-x-1">←</span><span>Previous</span></button>
                    <div className="flex flex-wrap justify-center gap-1.5">{Array.from({ length: pagination.pages }, (_, index) => index + 1).map((page) => <button aria-label={`Go to page ${page}`} aria-current={page === pagination.page ? "page" : undefined} key={page} onClick={() => updateFilter("page", String(page), { keepPage: true })} className={`grid h-9 min-w-9 place-items-center border px-2 text-[8px] tracking-[.1em] transition ${page === pagination.page ? "border-black bg-black text-white" : "border-black/15 hover:border-black hover:bg-white/50"}`}>{String(page).padStart(2, "0")}</button>)}</div>
                    <button disabled={pagination.page >= pagination.pages} onClick={() => updateFilter("page", String(pagination.page + 1), { keepPage: true })} className="group flex items-center gap-3 text-[8px] uppercase tracking-[.14em] transition disabled:pointer-events-none disabled:opacity-25"><span>Next</span><span className="transition-transform group-hover:translate-x-1">→</span></button>
                  </nav>
                )}
              </>
            ) : (
              <div className="grid min-h-[420px] place-items-center border border-black/10 bg-white/30 p-8 text-center"><div><span className="text-[8px] uppercase tracking-[.16em] text-[#d13c3c]">No match</span><h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.92]">Nothing on the shelf matches that edit.</h2><p className="mx-auto mt-5 max-w-lg text-[12px] leading-6 text-black/65">Try another category, clear the search, or widen your price range.</p><button onClick={resetFilters} className="mt-8 bg-black px-7 py-4 text-[8px] uppercase tracking-[.14em] text-white">Reset the collection</button></div></div>
            )}
          </div>
        </div>
      </section>

      {/* Section 4: A smaller shelf. A clearer ritual.. */}

      <section className="border-t border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)] py-[clamp(62px,7vw,100px)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[.72fr_1.28fr] items-end gap-14 max-[800px]:grid-cols-1">
          <div><span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">A smaller shelf. A clearer ritual.</span><h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.05em]">Less filtering.<br/><em className="font-normal text-[#d13c3c]">Better choosing.</em></h2></div>
          <div className="grid grid-cols-3 border-l border-t border-black/10 max-[620px]:grid-cols-1"><div className="border-b border-r border-black/10 p-7"><span className="text-[7px] uppercase tracking-[.15em] text-black/65">01</span><strong className="mt-10 block font-[Georgia] text-[26px] font-normal">Start with category.</strong><p className="mt-3 text-[10px] leading-5 text-black/65">Choose the type of formula you are actually shopping for.</p></div><div className="border-b border-r border-black/10 p-7"><span className="text-[7px] uppercase tracking-[.15em] text-black/65">02</span><strong className="mt-10 block font-[Georgia] text-[26px] font-normal">Set your range.</strong><p className="mt-3 text-[10px] leading-5 text-black/65">Narrow by price only when it helps the decision.</p></div><div className="border-b border-r border-black/10 p-7"><span className="text-[7px] uppercase tracking-[.15em] text-black/65">03</span><strong className="mt-10 block font-[Georgia] text-[26px] font-normal">Explore the formula.</strong><p className="mt-3 text-[10px] leading-5 text-black/65">The product page carries the ingredient and ritual detail.</p></div></div>
        </div>
      </section>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiltersOpen(false)}>
            <motion.aside className="absolute right-0 top-0 h-full w-[min(92vw,420px)] overflow-y-auto bg-[#fffaf1] p-6 shadow-[-20px_0_70px_rgba(0,0,0,.18)]" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: .3 }} onClick={(event) => event.stopPropagation()}>
              <div className="mb-8 flex items-center justify-between border-b border-black pb-5"><div><span className="text-[7px] uppercase tracking-[.15em] text-[#d13c3c]">Refine collection</span><h2 className="mt-2 font-[Georgia] text-4xl">Find your formula.</h2></div><button aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-black/15 text-xl transition hover:bg-black hover:text-white">×</button></div>
              <FilterPanel filters={filters} meta={meta} updateFilter={updateFilter} resetFilters={resetFilters} />
              <button onClick={() => setFiltersOpen(false)} className="sticky bottom-0 mt-8 flex w-full items-center justify-between bg-black px-6 py-4 text-[8px] uppercase tracking-[.14em] text-white"><span>Show {pagination.total} products</span><span>→</span></button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
