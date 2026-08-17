/**
 * Reusable storefront component for footer. Encapsulates shared UI behavior so page files stay focused on page composition.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { captureLead } from "../services/leadApi.js";

const address = "3rd Floor Landmark Tower, South City 1, Sector 41, Gurugram, Haryana 122001";

/**
 * Renders the Instagram Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function InstagramIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.25"/><circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none"/></svg>; }
/**
 * Renders the Facebook Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function FacebookIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path className="fill-current stroke-none" d="M14 21v-8h2.8l.45-3H14V8.2c0-.87.28-1.47 1.55-1.47H17.4V4.05A24 24 0 0 0 15 3.9c-2.4 0-4.05 1.46-4.05 4.14V10H8.2v3h2.75v8H14Z"/></svg>; }
/**
 * Renders the Youtube Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function YoutubeIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8.1a3 3 0 0 0-2.1-2.15C17.05 5.45 12 5.45 12 5.45s-5.05 0-6.9.5A3 3 0 0 0 3 8.1 31 31 0 0 0 2.5 12 31 31 0 0 0 3 15.9a3 3 0 0 0 2.1 2.15c1.85.5 6.9.5 6.9.5s5.05 0 6.9-.5A3 3 0 0 0 21 15.9a31 31 0 0 0 .5-3.9 31 31 0 0 0-.5-3.9Z"/><path className="fill-current stroke-none" d="m10 15.15 5-3.15-5-3.15v6.3Z"/></svg>; }
/**
 * Renders the XIcon component and coordinates the state/behavior owned by this UI boundary.
 */
function XIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path className="fill-current stroke-none" d="M5 4h3.4l4.5 6L18 4h1.8l-6 7.35L20 20h-3.4l-4.8-6.4L6.4 20H4.6l6.3-7.75L5 4Zm2.5 1.5 10 13h1L8.5 5.5h-1Z"/></svg>; }

const socials = [
  { label: "Instagram", href: "#instagram", icon: <InstagramIcon /> },
  { label: "Facebook", href: "#facebook", icon: <FacebookIcon /> },
  { label: "YouTube", href: "#youtube", icon: <YoutubeIcon /> },
  { label: "X", href: "#x", icon: <XIcon /> },
];
const eyebrow = "mb-2 text-[7px] font-semibold uppercase tracking-[.18em] text-white/80";
const footerLink = "font-[Georgia] text-[15px] leading-[1.3] text-white transition hover:text-white/90";

/**
 * Renders the Footer component and coordinates the state/behavior owned by this UI boundary.
 */
export default function Footer() {
  const [leadForm, setLeadForm] = useState({ email: "", company: "" });
  const [leadStatus, setLeadStatus] = useState({ type: "", message: "" });
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  /**
   * Handles the lead submit interaction and keeps related UI/API state synchronized.
   */
  async function handleLeadSubmit(event) {
    event.preventDefault();
    setLeadStatus({ type: "", message: "" });

    const email = leadForm.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setLeadStatus({ type: "error", message: "Enter a valid email address." });
      return;
    }

    setLeadSubmitting(true);
    try {
      const response = await captureLead({
        email,
        source: "footer",
        company: leadForm.company,
      });

      setLeadStatus({
        type: "success",
        message: response.message || "You’re on the Beyonist Edit list.",
      });
      setLeadForm({ email: "", company: "" });
    } catch (error) {
      setLeadStatus({
        type: "error",
        message: error.message || "We could not save your email. Please try again.",
      });
    } finally {
      setLeadSubmitting(false);
    }
  }

  return (
    <footer className="bg-[#171313] font-[Arial] text-white">
      <section className="bg-[#d13c3c] px-[clamp(20px,5vw,72px)] py-[clamp(42px,5vw,66px)]">
        <div className="mx-auto grid max-w-[1420px] grid-cols-[1fr_minmax(320px,620px)] items-center gap-10 max-[820px]:grid-cols-1">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-white/90">The Beyonist Edit</span>
            <h2 className="mt-3 font-[Georgia] text-[clamp(32px,4vw,52px)] font-normal leading-[1.02] tracking-[-.035em]">Good skin notes,<br/><em className="font-normal text-[#171313]">straight to your inbox.</em></h2>
          </div>

          <form onSubmit={handleLeadSubmit} noValidate className="rounded-sm bg-white p-2 text-[#171313] shadow-[0_18px_45px_rgba(95,20,25,.18)]">
            <div className="flex items-center gap-2 max-[540px]:flex-col">
              <input
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[11px] outline-none placeholder:text-black/65 max-[540px]:w-full"
                type="email"
                value={leadForm.email}
                onChange={(event) => {
                  setLeadForm((current) => ({ ...current, email: event.target.value }));
                  if (leadStatus.message) setLeadStatus({ type: "", message: "" });
                }}
                autoComplete="email"
                inputMode="email"
                aria-label="Email address"
                placeholder="Enter your email address"
                disabled={leadSubmitting}
              />
              <input
                type="text"
                name="company"
                value={leadForm.company}
                onChange={(event) => setLeadForm((current) => ({ ...current, company: event.target.value }))}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="pointer-events-none absolute h-px w-px opacity-0"
              />
              <button
                className="shrink-0 bg-[#171313] px-6 py-3.5 text-[8px] font-semibold uppercase tracking-[.13em] text-white transition hover:bg-[#d13c3c] disabled:opacity-50 max-[540px]:w-full"
                disabled={leadSubmitting}
              >
                {leadSubmitting ? "Joining..." : "Join the list"}
              </button>
            </div>
            <div aria-live="polite" className="min-h-[21px] px-4 pt-1">
              {leadStatus.message ? <p className={`text-[7px] ${leadStatus.type === "error" ? "text-[#d13c3c]" : "text-[#337144]"}`}>{leadStatus.message}</p> : <p className="text-[7px] text-black/65">Product notes, launches and member updates. Unsubscribe anytime.</p>}
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1420px] grid-cols-[1.25fr_.75fr_.9fr_1.1fr] gap-[clamp(30px,5vw,72px)] px-[clamp(20px,5vw,72px)] py-[clamp(54px,6vw,82px)] max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
        <div>
          <img
            src="/brand/beyonist-wordmark-white.webp"
            srcSet="/brand/beyonist-wordmark-white-320.webp 320w, /brand/beyonist-wordmark-white-640.webp 640w, /brand/beyonist-wordmark-white.webp 720w"
            sizes="210px"
            alt="Beyonist"
            loading="lazy"
            decoding="async"
            className="w-[195px]"
            width="720"
            height="112"
          />
          <p className="mt-6 max-w-[360px] font-[Arial] text-[10px] leading-6 text-white/58">Targeted skincare, simple routines and products designed to earn a permanent place on your shelf.</p>
          <div className="mt-6 flex gap-2" aria-label="Beyonist social media">
            {socials.map((social) => (
              <a key={social.label} href={social.href} aria-label={social.label} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 transition hover:border-white hover:bg-white hover:text-black">
                <span className="h-4 w-4 [&_svg]:h-full [&_svg]:w-full [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.65]">{social.icon}</span>
              </a>
            ))}
          </div>
        </div>

        <nav className="flex flex-col gap-3" aria-label="Footer shop navigation">
          <strong className="mb-2 text-[8px] uppercase tracking-[.16em] text-white/90">Shop</strong>
          <Link to="/shop" className="font-[Arial] text-[10px] leading-5 text-white/68 transition hover:text-white">All Products</Link>
          <Link to="/shop?view=bestsellers" className="font-[Arial] text-[10px] leading-5 text-white/68 transition hover:text-white">Bestsellers</Link>
          <Link to="/shop?category=serums" className="font-[Arial] text-[10px] leading-5 text-white/68 transition hover:text-white">Serums</Link>
          <Link to="/blogs" className="font-[Arial] text-[10px] leading-5 text-white/68 transition hover:text-white">The Edit</Link>
          <Link to="/about" className="font-[Arial] text-[10px] leading-5 text-white/68 transition hover:text-white">Our Story</Link>
        </nav>

        <nav className="flex flex-col gap-3" aria-label="Footer help navigation">
          <strong className="mb-2 text-[8px] uppercase tracking-[.16em] text-white/90">Help</strong>
          <Link to="/account" className="font-[Arial] text-[10px] leading-5 text-white/68 transition hover:text-white">My Account</Link>
          <Link to="/track-order" className="font-[Arial] text-[10px] leading-5 text-white/68 transition hover:text-white">Track Order</Link>
          <Link to="/contact" className="font-[Arial] text-[10px] leading-5 text-white/68 transition hover:text-white">Contact Us</Link>
          <Link to="/faq" className="font-[Arial] text-[10px] leading-5 text-white/68 transition hover:text-white">FAQs</Link>
          <Link to="/shipping-policy" className="font-[Arial] text-[10px] leading-5 text-white/68 transition hover:text-white">Shipping</Link>
          <Link to="/return-refund-policy" className="font-[Arial] text-[10px] leading-5 text-white/68 transition hover:text-white">Returns & Refunds</Link>
        </nav>

        <div>
          <strong className="text-[8px] uppercase tracking-[.16em] text-white/90">Get in touch</strong>
          <a href="tel:+918527999563" className="mt-5 block font-[Arial] text-[20px] font-medium tracking-[-.02em] text-white">+91 85279 99563</a>
          <a href="mailto:contact@beyonist.com" className="mt-3 block break-all font-[Arial] text-[10px] text-white/68 hover:text-white">contact@beyonist.com</a>
          <address className="mt-5 max-w-[320px] not-italic font-[Arial] text-[10px] leading-6 text-white/90">{address}</address>
        </div>
      </div>

      <div className="border-t border-white/10 px-[clamp(20px,5vw,72px)]">
        <div className="mx-auto flex max-w-[1420px] items-center justify-between gap-6 py-5 text-[7px] uppercase tracking-[.11em] text-white/90 max-[650px]:flex-col max-[650px]:items-start">
          <span>© Beyonist Skincare Pvt. Ltd. · All rights reserved</span>
          <div className="flex flex-wrap gap-5">
            <Link to="/terms-and-conditions">Terms</Link>
            <Link to="/shipping-policy">Shipping</Link>
            <Link to="/return-refund-policy">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
