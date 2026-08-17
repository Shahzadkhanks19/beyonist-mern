/**
 * Reusable storefront component for header. Encapsulates shared UI behavior so page files stay focused on page composition.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getProducts } from "../services/catalogApi.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { responsiveImageProps } from "../utils/productImagePath.js";

const menu = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["The Edit", "/blogs"],
  ["Our Story", "/about"],
  ["Contact", "/contact"],
  ["Track Order", "/track-order"],
];

/**
 * Renders the Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function Icon({ type }) {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.6"/><path d="m15.8 15.8 4.4 4.4"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4.1 3.1-6.1 7-6.1s6.2 2 7 6.1"/></>,
    bag: <><path d="M5.5 8.8h13l-1 10.7h-11z"/><path d="M9 9V6.7a3 3 0 0 1 6 0V9"/></>,
  };
  return <svg className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>;
}

/**
 * Renders the Search Panel component and coordinates the state/behavior owned by this UI boundary.
 */
function SearchPanel({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [state, setState] = useState("idle");

  useEffect(() => {
    if (!open) {
      setQuery("");
      setProducts([]);
      setState("idle");
      return;
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("overflow-hidden");
    };
  }, [open, onClose]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  /**
   * Implements the run search operation used by this module.
   */
  const runSearch = (value) => {
    setQuery(value);
    window.clearTimeout(timerRef.current);

    const cleaned = value.trim();
    if (cleaned.length < 2) {
      setProducts([]);
      setState("idle");
      return;
    }

    setState("loading");
    timerRef.current = window.setTimeout(async () => {
      try {
        const response = await getProducts({ q: cleaned, limit: 6 });
        setProducts(response.data || []);
        setState((response.data || []).length ? "results" : "empty");
      } catch {
        setProducts([]);
        setState("error");
      }
    }, 260);
  };

  /**
   * Implements the submit operation used by this module.
   */
  const submit = (event) => {
    event.preventDefault();
    const cleaned = query.trim();
    if (!cleaned) return;
    onClose();
    navigate(`/shop?q=${encodeURIComponent(cleaned)}`);
  };

  /**
   * Implements the choose product operation used by this module.
   */
  const chooseProduct = () => onClose();

  if (!open) return null;

  return (
        <div className="beyonist-overlay-in fixed inset-0 z-[90]">
          <button type="button" aria-label="Close search" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-black/55 backdrop-blur-[5px]" />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Search Beyonist"
            className="beyonist-search-in relative z-[2] max-h-[min(760px,92dvh)] overflow-y-auto bg-[#fffaf1] text-black shadow-[0_30px_90px_rgba(0,0,0,.28)]"
          >
            <div className="mx-auto max-w-[1500px] px-[clamp(22px,5vw,78px)] py-[clamp(28px,4vw,52px)]">
              <div className="flex items-center justify-between border-b border-black/10 pb-5">
                <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Search / Beyonist</span>
                <button type="button" onClick={onClose} className="group flex items-center gap-3 text-[8px] font-semibold uppercase tracking-[.14em]">
                  <span className="text-black/65 transition group-hover:text-black">Esc</span>
                  <span>Close ×</span>
                </button>
              </div>

              <form onSubmit={submit} className="grid grid-cols-[1fr_auto] items-end gap-5 border-b border-black py-[clamp(22px,3vw,34px)] max-[560px]:grid-cols-1">
                <label>
                  <span className="block text-[7px] font-semibold uppercase tracking-[.16em] text-black/65">What are you looking for?</span>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => runSearch(event.target.value)}
                    placeholder="Search products..."
                    autoComplete="off"
                    className="mt-3 w-full bg-transparent font-[Georgia] text-[clamp(34px,5vw,72px)] leading-none tracking-[-.045em] outline-none placeholder:text-black/60"
                  />
                </label>
                <button type="submit" disabled={!query.trim()} className="mb-1 inline-flex min-w-[180px] items-center justify-between bg-[#d13c3c] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.15em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-35">
                  <span>Search shop</span><span>↗</span>
                </button>
              </form>

              <div className="min-h-[220px] py-7">
                {state === "idle" && (
                  <div className="grid grid-cols-[.65fr_1.35fr] gap-10 max-[760px]:grid-cols-1">
                    <div>
                      <span className="text-[7px] font-semibold uppercase tracking-[.16em] text-black/65">Try searching</span>
                      <p className="mt-4 max-w-[330px] font-[Georgia] text-[26px] leading-[1.15]">Find a formula by product name or category.</p>
                    </div>
                    <div className="flex flex-wrap content-start gap-2">
                      {["Serum", "Sunblock", "Body lotion", "Soap", "Scrub", "Moisturiser"].map((term) => (
                        <button key={term} type="button" onClick={() => runSearch(term)} className="border border-black/15 bg-[#ffffff] px-4 py-3 text-[8px] uppercase tracking-[.13em] transition hover:border-black hover:bg-black hover:text-white">
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {state === "loading" && (
                  <div className="grid grid-cols-3 gap-4 max-[800px]:grid-cols-2 max-[520px]:grid-cols-1">
                    {[0, 1, 2].map((item) => <div key={item} className="h-[160px] animate-pulse bg-black/[.055]" />)}
                  </div>
                )}

                {state === "empty" && (
                  <div className="py-8">
                    <span className="text-[7px] font-semibold uppercase tracking-[.16em] text-[#d13c3c]">No exact match</span>
                    <h2 className="mt-3 font-[Georgia] text-[clamp(32px,4vw,52px)] font-normal tracking-[-.04em]">Nothing found for “{query.trim()}”.</h2>
                    <p className="mt-3 text-[10px] leading-5 text-black/65">Try a shorter product name, category or another skincare term.</p>
                  </div>
                )}

                {state === "error" && (
                  <div className="py-8">
                    <span className="text-[7px] font-semibold uppercase tracking-[.16em] text-[#d13c3c]">Search unavailable</span>
                    <p className="mt-3 font-[Georgia] text-[30px]">The catalogue could not be reached right now.</p>
                  </div>
                )}

                {state === "results" && (
                  <>
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-[7px] font-semibold uppercase tracking-[.16em] text-black/65">Live results / {products.length}</span>
                      <button type="button" onClick={submit} className="border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.13em]">View all results ↗</button>
                    </div>
                    <div className="grid grid-cols-3 border-l border-t border-black/10 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
                      {products.map((product, index) => {
                        const image = product.images?.[0] || product.image || "/images/product-hamper.webp";
                        const slug = product.slug || product.id;
                        return (
                          <Link key={product._id || slug} to={`/product/${slug}`} onClick={chooseProduct} className="group grid grid-cols-[105px_1fr] gap-4 border-b border-r border-black/10 bg-[#ffffff] p-3 transition hover:bg-white">
                            <div className="grid aspect-square place-items-center overflow-hidden bg-[#f0ebe4]">
                              <img {...responsiveImageProps(image, "105px")} alt={product.name} className="h-full w-full object-contain p-1 transition duration-500 group-hover:scale-[1.035]" width="480" height="480" loading="lazy" decoding="async"/>
                            </div>
                            <div className="flex min-w-0 flex-col justify-center">
                              <div className="flex items-center justify-between gap-3 text-[6px] uppercase tracking-[.13em] text-black/65">
                                <span className="truncate">{product.category}</span><span>{String(index + 1).padStart(2, "0")}</span>
                              </div>
                              <strong className="mt-2 line-clamp-2 font-[Georgia] text-[20px] font-normal leading-[1.05]">{product.name}</strong>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[9px] font-semibold">₹{product.price}</span>
                                <span className="text-[7px] uppercase tracking-[.12em] text-[#d13c3c]">View ↗</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
  );
}

/**
 * Renders the Header component and coordinates the state/behavior owned by this UI boundary.
 */
export default function Header() {
  const { itemCount } = useCart();
  const { customer } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", open);
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  return (
    <>
      <div className="grid h-7 grid-cols-[1fr_auto_1fr] items-center bg-[#080808] px-[clamp(18px,4vw,58px)] text-[8px] uppercase tracking-[.16em] text-white max-[900px]:hidden">
        <span>Complimentary shipping over ₹999</span>
        <span className="hidden opacity-55 sm:block">Beyonist / Skin beyond ordinary</span>
        <span className="text-right">India · INR</span>
      </div>

      <header className={`sticky top-0 z-50 grid h-[84px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[clamp(20px,2.4vw,42px)] border-b border-white/20 bg-[#d13c3c] px-[clamp(24px,4.2vw,64px)] text-white transition-all duration-300 max-[900px]:h-[68px] max-[900px]:grid-cols-[38px_minmax(0,1fr)_auto] max-[900px]:gap-3 max-[900px]:px-4 max-[420px]:grid-cols-[34px_minmax(0,1fr)_auto] max-[420px]:gap-2 max-[420px]:px-3 ${scrolled ? "shadow-[0_12px_30px_rgba(0,0,0,.14)]" : ""}`}>
        <button
          className="group hidden h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/[.04] max-[900px]:grid"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open navigation"
          aria-expanded={open}
        >
          <span className="relative block h-[12px] w-[15px]">
            <i className="absolute left-0 top-[2px] h-px w-[15px] bg-white transition-transform" />
            <i className="absolute bottom-[2px] left-0 h-px w-[10px] bg-white transition-all group-hover:w-[15px]" />
          </span>
        </button>

        <Link className="w-[clamp(145px,11.5vw,190px)] shrink-0 justify-self-start max-[900px]:justify-self-center max-[900px]:w-[118px] max-[420px]:w-[102px]" to="/" aria-label="Beyonist home">
          <img className="h-auto w-full" src="/brand/beyonist-wordmark-white.webp" srcSet="/brand/beyonist-wordmark-white-320.webp 320w, /brand/beyonist-wordmark-white-640.webp 640w, /brand/beyonist-wordmark-white.webp 720w" sizes="(max-width: 600px) 70vw, 225px" alt="Beyonist" loading="eager" width="720" height="112" decoding="async"/>
        </Link>

        <nav className="flex min-w-0 justify-self-center items-center justify-center gap-[clamp(16px,1.65vw,28px)] whitespace-nowrap text-[8px] uppercase tracking-[.12em] max-[900px]:hidden" aria-label="Primary navigation">
          {menu.map(([label, to]) => (
            <NavLink key={label} to={to} end={to === "/"} className={({ isActive }) => `relative py-2.5 after:absolute after:bottom-1 after:left-0 after:h-px after:bg-white after:transition-all after:duration-200 hover:after:w-full ${isActive ? "after:w-full" : "after:w-0"}`}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center justify-self-end gap-[5px] max-[900px]:gap-1 max-[420px]:gap-0">
          <button
            className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-white/10 max-[420px]:h-7 max-[420px]:w-7"
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
          >
            <Icon type="search" />
          </button>

          <Link
            className="relative grid h-8 w-8 place-items-center rounded-full transition hover:bg-white/10 max-[420px]:h-7 max-[420px]:w-7"
            to="/cart"
            aria-label={`Shopping cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <Icon type="bag" />
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-1 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-white px-1 text-[7px] font-extrabold leading-none text-[#d13c3c]">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>

          <Link
            className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-white/10 max-[420px]:h-7 max-[420px]:w-7"
            to={customer ? "/account" : "/login"}
            aria-label={customer ? "Open customer dashboard" : "Sign in"}
          >
            <Icon type="user" />
          </Link>
        </div>
      </header>

      {open ? (
          <div className="beyonist-overlay-in fixed inset-0 z-[80] max-[900px]:block">
            <button
              type="button"
              className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-[3px]"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            />

            <nav
              aria-label="Mobile navigation"
              className="beyonist-drawer-in relative flex h-dvh w-[min(86vw,360px)] flex-col overflow-y-auto bg-[#fffaf1] text-[#171313] shadow-[30px_0_80px_rgba(0,0,0,.24)]"
            >
              <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-black/10 px-5">
                <img className="w-[128px]" src="/brand/beyonist-wordmark-black.webp" alt="Beyonist" loading="eager" width="720" height="112" decoding="async"/>
                <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-black/15 text-[18px]" onClick={() => setOpen(false)} aria-label="Close menu">×</button>
              </div>

              <div className="px-5 py-4">
                {menu.map(([label, to]) => (
                  <NavLink
                    key={label}
                    to={to}
                    end={to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `flex items-center justify-between border-b border-black/10 py-4 text-[13px] font-semibold transition ${isActive ? "text-[#d13c3c]" : "text-black/72 hover:text-[#d13c3c]"}`}
                  >
                    <span>{label}</span><span className="text-[12px]">→</span>
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto border-t border-black/10 bg-[#faf6af] p-5">
                <strong className="font-[Georgia] text-[22px] font-normal">Skin beyond ordinary.</strong>
                <p className="mt-2 text-[9px] leading-5 text-black/65">Targeted skincare. Simple routines. Shop with confidence.</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link to="/shop" onClick={() => setOpen(false)} className="bg-[#d13c3c] px-3 py-3 text-center text-[7px] font-semibold uppercase tracking-[.1em] text-white">Shop now</Link>
                  <Link to={customer ? "/account" : "/login"} onClick={() => setOpen(false)} className="border border-black/20 px-3 py-3 text-center text-[7px] font-semibold uppercase tracking-[.1em]">{customer ? "My account" : "Sign in"}</Link>
                </div>
              </div>
            </nav>
          </div>
        ) : null}

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
