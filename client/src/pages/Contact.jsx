/**
 * Customer-facing Contact page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { submitContact } from "../services/contactApi.js";

const TOPICS = ["Product enquiry", "Order support", "Returns & refunds", "Stockist / business", "General enquiry"];

const contactItems = [
  {
    index: "01",
    label: "Call customer care",
    value: "+91 85279 99563",
    note: "For product and order-related conversations.",
    href: "tel:+918527999563",
  },
  {
    index: "02",
    label: "Write to us",
    value: "contact@beyonist.com",
    note: "Send a detailed note whenever email works better.",
    href: "mailto:contact@beyonist.com",
  },
  {
    index: "03",
    label: "Visit the office",
    value: "3rd Floor Landmark Tower, South City 1, Sector 41, Gurugram, Haryana 122001",
    note: "Beyonist’s address recovered from the original storefront.",
    href: "https://www.google.com/maps/search/?api=1&query=3rd%20Floor%20Landmark%20Tower%2C%20South%20City%201%2C%20Sector%2041%2C%20Gurugram%2C%20Haryana%20122001",
  },
];

/**
 * Renders the Instagram Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.5]">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.8" r=".9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Renders the Facebook Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
      <path d="M13.8 22v-9h3l.45-3.5H13.8V7.26c0-1.01.28-1.7 1.74-1.7h1.86V2.43A25 25 0 0 0 14.69 2c-2.68 0-4.51 1.64-4.51 4.65V9.5H7.15V13h3.03v9h3.62Z" />
    </svg>
  );
}

/**
 * Renders the You Tube Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[19px] w-[19px] fill-current">
      <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.65 4.6 12 4.6 12 4.6s-5.65 0-7.5.5A3 3 0 0 0 2.4 7.2C1.9 9.05 1.9 12 1.9 12s0 2.95.5 4.8a3 3 0 0 0 2.1 2.1c1.85.5 7.5.5 7.5.5s5.65 0 7.5-.5a3 3 0 0 0 2.1-2.1c.5-1.85.5-4.8.5-4.8s0-2.95-.5-4.8ZM10 15.3V8.7l5.7 3.3L10 15.3Z" />
    </svg>
  );
}

/**
 * Renders the XIcon component and coordinates the state/behavior owned by this UI boundary.
 */
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[16px] w-[16px] fill-current">
      <path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-6.4L6.45 22H3.34l7.26-8.3L2.95 2H9.36l4.42 5.84L18.9 2Zm-1.1 17.84h1.72L8.42 4.05H6.58L17.8 19.84Z" />
    </svg>
  );
}

/**
 * Renders the Contact component and coordinates the state/behavior owned by this UI boundary.
 */
export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: TOPICS[0], message: "" });
  const [topicOpen, setTopicOpen] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  /**
   * Updates update while preserving the surrounding domain invariants.
   */
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  /**
   * Handles the submit interaction and keeps related UI/API state synchronized.
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (form.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.trim().length < 10) {
      setStatus({ type: "error", message: "Please complete your name, email and message before sending." });
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitContact(form);
      setStatus({ type: "success", message: response.message || "Your note has reached Beyonist." });
      setForm({ name: "", email: "", phone: "", topic: TOPICS[0], message: "" });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "We could not send your note. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-[#fffaf1]">
      {/* Section 1: Page section 1. */}
      <section className="relative overflow-hidden bg-[#faf6af] text-[#171313]">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-[42%] top-[-42%] aspect-square w-[74vw] rounded-full border border-black/[.12]" />
          <div className="absolute left-[57%] top-[-2%] aspect-square w-[39vw] rounded-full border border-black/[.08]" />
          <div className="absolute inset-y-0 left-1/4 w-px bg-black/[.06]" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-black/[.06]" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-black/[.06]" />
        </div>

        <div className="relative mx-auto grid min-h-[540px] max-w-[1600px] grid-cols-[.78fr_1.22fr] max-[920px]:grid-cols-1 max-[920px]:min-h-0">
          <div className="relative z-10 flex flex-col justify-center px-[clamp(22px,5vw,78px)] py-[clamp(44px,5vw,68px)]">
            <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#d13c3c]">Contact / Beyonist</span>
            <h1 className="mt-5 max-w-[760px] font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.81] tracking-[-.065em]">
              Say hello.<br/><em className="font-normal text-[#d13c3c]">Stay in touch.</em>
            </h1>
            <p className="mt-5 max-w-[550px] text-[13px] leading-7 text-black/65">
              Product questions, an existing order, a business conversation or something else entirely—Beyonist customer care starts here.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="tel:+918527999563" className="inline-flex min-w-[210px] items-center justify-between bg-[#d13c3c] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.15em] transition hover:-translate-y-1">
                <span>Call customer care</span><span>↗</span>
              </a>
              <a href="mailto:contact@beyonist.com" className="inline-flex min-w-[210px] items-center justify-between border border-black/[.12] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.15em] transition hover:bg-[#171313] hover:text-white">
                <span>Email Beyonist</span><span>↗</span>
              </a>
            </div>
          </div>

          <div className="relative min-h-[540px] overflow-hidden max-[920px]:min-h-[430px] max-[560px]:min-h-[360px]">
            <div className="absolute inset-[7%_7%_7%_4%] bg-[#d9c0c2]" />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: .985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: .7 }}
              className="absolute inset-[10%_10%_10%_7%] z-[2] grid place-items-center"
            >
              <img src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist skincare collection" loading="eager" fetchPriority="high" className="h-full w-full object-contain p-[clamp(18px,5vw,62px)] drop-shadow-[0_34px_48px_rgba(0,0,0,.2)]"  width="1000" height="1000" decoding="async"/>
            </motion.div>

            <div className="absolute right-[5%] top-[8%] z-[4] bg-[#d13c3c] px-5 py-4 text-white">
              <span className="block text-[6px] uppercase tracking-[.18em] text-white/90">Customer care</span>
              <strong className="mt-1 block font-[Georgia] text-[22px] font-normal">A real conversation.</strong>
            </div>

            <div className="absolute bottom-[7%] left-[5%] z-[4] border-[7px] border-[#ffffff] bg-[#ffffff] p-2.5 text-black shadow-[0_24px_60px_rgba(0,0,0,.16)]">
              <img src="/images/ivy-serum-800.webp" srcSet="/images/ivy-serum-480.webp 480w, /images/ivy-serum-800.webp 800w, /images/ivy-serum.webp 1080w" sizes="170px" alt="" loading="lazy" fetchPriority="low" className="h-[clamp(105px,12vw,170px)] w-[clamp(105px,12vw,170px)] object-contain"  width="1080" height="1080" decoding="async"/>
              <div className="mt-2 flex justify-between text-[6px] uppercase tracking-[.14em]"><span>Ask us</span><span>01</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Get in touch / 01. */}

      <section className="border-b border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)] py-[clamp(60px,7vw,92px)]">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-[.7fr_1.3fr] items-end gap-12 max-[820px]:grid-cols-1">
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Get in touch / 01</span>
              <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">
                Choose the way<br/><em className="font-normal text-[#d13c3c]">that feels easiest.</em>
              </h2>
            </div>
            <p className="max-w-[620px] pb-1 text-[11px] leading-6 text-black/65">
              Call, write or find the Gurugram office. Every contact route below uses the details carried over from the original Beyonist storefront.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-3 border-l border-t border-black/10 max-[900px]:grid-cols-1">
            {contactItems.map((item) => (
              <a
                key={item.index}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group min-h-[300px] border-b border-r border-black/10 p-[clamp(26px,3vw,40px)] transition duration-300 hover:bg-[#fffaf1]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[7px] uppercase tracking-[.15em] text-black/65">{item.index}</span>
                  <span className="text-[13px] transition-transform duration-300 group-hover:translate-x-1">↗</span>
                </div>
                <span className="mt-16 block text-[7px] font-semibold uppercase tracking-[.15em] text-[#d13c3c]">{item.label}</span>
                <strong className="mt-3 block max-w-[420px] break-words font-[Georgia] text-[clamp(23px,2.6vw,34px)] font-normal leading-[1.12]">{item.value}</strong>
                <p className="mt-4 max-w-[330px] text-[9px] leading-5 text-black/65">{item.note}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Send a note / 02. */}

      <section className="px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[.62fr_1.38fr] gap-[clamp(50px,7vw,110px)] max-[920px]:grid-cols-1">
          <div className="self-start min-[921px]:sticky min-[921px]:top-[145px]">
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Send a note / 02</span>
            <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">
              Put the details<br/><em className="font-normal text-[#d13c3c]">in one place.</em>
            </h2>
            <p className="mt-6 max-w-[440px] text-[11px] leading-6 text-black/65">
              The form routes your message into the Beyonist contact system so product, order and business enquiries can be handled separately.
            </p>

            <div className="mt-9 border-t border-black/10">
              {[
                ["01", "Product enquiry", "Questions about formulas, use or choosing from the collection."],
                ["02", "Order support", "Existing-order questions and delivery-related help."],
                ["03", "Business", "Stockist, partnership and other professional conversations."],
              ].map(([number, title, copy]) => (
                <div key={number} className="grid grid-cols-[42px_1fr] gap-4 border-b border-black/10 py-5">
                  <span className="text-[7px] uppercase tracking-[.14em] text-black/65">{number}</span>
                  <div>
                    <strong className="font-[Georgia] text-[20px] font-normal">{title}</strong>
                    <p className="mt-1 text-[9px] leading-5 text-black/65">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="overflow-hidden border border-black/10 bg-[#ffffff] shadow-[0_24px_70px_rgba(0,0,0,.06)]">
            <div className="border-b border-black/10 bg-[#111] px-[clamp(24px,4vw,48px)] py-7 text-white">
              <span className="text-[7px] font-semibold uppercase tracking-[.17em] text-[#d13c3c]">Beyonist enquiry form</span>
              <div className="mt-3 flex items-end justify-between gap-6 max-[600px]:items-start max-[600px]:flex-col">
                <h3 className="font-[Georgia] text-[clamp(30px,3.5vw,46px)] font-normal leading-none">Tell us what’s going on.</h3>
                <span className="text-[7px] uppercase tracking-[.13em] text-white/90">Fields marked * are required</span>
              </div>
            </div>

            <div className="grid grid-cols-2 max-[650px]:grid-cols-1">
              <label className="group border-b border-r border-black/10 p-[clamp(24px,3vw,36px)] max-[650px]:border-r-0">
                <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 transition group-focus-within:text-[#d13c3c]">Your name *</span>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" className="mt-5 w-full bg-transparent font-[Georgia] text-[25px] outline-none placeholder:text-black/60" placeholder="Your name" />
              </label>

              <label className="group border-b border-black/10 p-[clamp(24px,3vw,36px)]">
                <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 transition group-focus-within:text-[#d13c3c]">Email address *</span>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" className="mt-5 w-full bg-transparent font-[Georgia] text-[25px] outline-none placeholder:text-black/60" placeholder="you@example.com" />
              </label>

              <label className="group border-b border-r border-black/10 p-[clamp(24px,3vw,36px)] max-[650px]:border-r-0">
                <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 transition group-focus-within:text-[#d13c3c]">Phone</span>
                <input value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/[^\d+\s-]/g, ""))} autoComplete="tel" className="mt-5 w-full bg-transparent font-[Georgia] text-[25px] outline-none placeholder:text-black/60" placeholder="+91" />
              </label>

              <div className="relative border-b border-black/10 p-[clamp(24px,3vw,36px)]">
                <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65">Enquiry type</span>
                <button type="button" onClick={() => setTopicOpen((open) => !open)} aria-haspopup="listbox" aria-expanded={topicOpen} className="mt-5 flex w-full items-center justify-between gap-4 text-left font-[Georgia] text-[25px]">
                  <span>{form.topic}</span>
                  <span className={`text-[14px] transition duration-300 ${topicOpen ? "rotate-180" : ""}`}>⌄</span>
                </button>

                {topicOpen && (
                  <div role="listbox" className="absolute left-0 right-0 top-full z-30 border border-black/10 bg-[#ffffff] p-2 shadow-[0_22px_55px_rgba(0,0,0,.14)]">
                    {TOPICS.map((topic, index) => (
                      <button
                        key={topic}
                        type="button"
                        role="option"
                        aria-selected={form.topic === topic}
                        onClick={() => {
                          update("topic", topic);
                          setTopicOpen(false);
                        }}
                        className={`flex w-full items-center gap-4 px-4 py-4 text-left transition ${form.topic === topic ? "bg-[#d13c3c] text-white" : "hover:bg-black/[.045]"}`}
                      >
                        <span className={`text-[7px] tracking-[.14em] ${form.topic === topic ? "text-white/90" : "text-black/65"}`}>{String(index + 1).padStart(2, "0")}</span>
                        <span className="flex-1 text-[8px] font-semibold uppercase tracking-[.12em]">{topic}</span>
                        <span className={`grid h-5 w-5 place-items-center rounded-full border text-[9px] ${form.topic === topic ? "border-white bg-white text-[#d13c3c]" : "border-black/15 text-transparent"}`}>✓</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <label className="group block p-[clamp(24px,3vw,36px)]">
              <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 transition group-focus-within:text-[#d13c3c]">Your message *</span>
              <textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={6} className="mt-5 w-full resize-none bg-transparent font-[Georgia] text-[clamp(25px,3vw,35px)] leading-[1.25] outline-none placeholder:text-black/60" placeholder="Tell us a little more..." />
            </label>

            <div className="flex items-center justify-between gap-6 border-t border-black/10 bg-[#fffaf1] px-[clamp(24px,3vw,36px)] py-4 text-[7px] uppercase tracking-[.12em] text-black/65 max-[650px]:items-start max-[650px]:flex-col">
              <span>Product · Order · Returns · Business · General</span>
              <span>Your message is stored securely for follow-up.</span>
            </div>

            {status.message && (
              <div className={`border-t px-[clamp(24px,3vw,36px)] py-4 text-[9px] uppercase tracking-[.1em] ${status.type === "success" ? "border-black/10 bg-black text-white" : "border-[#d13c3c]/20 bg-[#d13c3c]/10 text-[#a51622]"}`}>
                {status.message}
              </div>
            )}

            <button disabled={submitting} className="group flex w-full items-center justify-between bg-[#d13c3c] px-[clamp(24px,3vw,36px)] py-5 text-[8px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
              <span>{submitting ? "Sending your note..." : "Send to Beyonist"}</span>
              <span className="transition-transform group-hover:translate-x-1">↗</span>
            </button>
          </form>
        </div>
      </section>

      {/* Section 4: Find us / 03. */}

      <section className="border-y border-black/10 bg-[#111] text-white">
        <div className="mx-auto grid max-w-[1600px] grid-cols-[.72fr_1.28fr] max-[900px]:grid-cols-1">
          <div className="flex flex-col justify-between px-[clamp(22px,5vw,78px)] py-[clamp(60px,7vw,96px)]">
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Find us / 03</span>
              <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">
                Gurugram,<br/><em className="font-normal text-[#d13c3c]">Haryana.</em>
              </h2>
              <address className="mt-7 max-w-[430px] font-[Georgia] text-[clamp(20px,2.1vw,28px)] not-italic leading-[1.45] text-white/68">
                3rd Floor Landmark Tower,<br />
                South City 1, Sector 41,<br />
                Gurugram, Haryana 122001
              </address>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=3rd%20Floor%20Landmark%20Tower%2C%20South%20City%201%2C%20Sector%2041%2C%20Gurugram%2C%20Haryana%20122001"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex w-fit min-w-[220px] items-center justify-between border border-white/20 px-5 py-4 text-[8px] font-semibold uppercase tracking-[.15em] transition hover:bg-white hover:text-black"
            >
              <span>Open in Maps</span><span>↗</span>
            </a>
          </div>

          <div className="relative min-h-[560px] overflow-hidden bg-[#ddd] max-[650px]:min-h-[430px]">
            <iframe
              title="Beyonist office location in Gurugram"
              src="https://www.google.com/maps?q=3rd%20Floor%20Landmark%20Tower%2C%20South%20City%201%2C%20Sector%2041%2C%20Gurugram%2C%20Haryana%20122001&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 grayscale-[.35] contrast-[1.05]"
            />
            <div className="pointer-events-none absolute left-5 top-5 z-10 bg-[#d13c3c] px-4 py-3 text-white">
              <span className="block text-[6px] uppercase tracking-[.18em] text-white/90">Beyonist office</span>
              <strong className="mt-1 block font-[Georgia] text-[20px] font-normal">South City 1 / Gurugram</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Before you write / 04. */}

      <section className="bg-[#ffffff] px-[clamp(22px,5vw,78px)] py-[clamp(64px,7vw,96px)]">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-[.7fr_1.3fr] items-end gap-12 max-[820px]:grid-cols-1">
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Before you write / 04</span>
              <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">
                There may be a<br/><em className="font-normal text-[#d13c3c]">faster answer.</em>
              </h2>
            </div>

            <div className="grid grid-cols-3 border-l border-t border-black/10 max-[650px]:grid-cols-1">
              <Link to="/track-order" className="group border-b border-r border-black/10 p-7 transition hover:bg-[#fffaf1]">
                <span className="text-[7px] uppercase tracking-[.14em] text-black/65">01</span>
                <strong className="mt-12 block font-[Georgia] text-[27px] font-normal">Track an order.</strong>
                <span className="mt-5 inline-flex border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.13em]">Open tracker ↗</span>
              </Link>
              <Link to="/faq" className="group border-b border-r border-black/10 p-7 transition hover:bg-[#fffaf1]">
                <span className="text-[7px] uppercase tracking-[.14em] text-black/65">02</span>
                <strong className="mt-12 block font-[Georgia] text-[27px] font-normal">Read the FAQs.</strong>
                <span className="mt-5 inline-flex border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.13em]">Find an answer ↗</span>
              </Link>
              <Link to="/blogs" className="group border-b border-r border-black/10 p-7 transition hover:bg-[#fffaf1]">
                <span className="text-[7px] uppercase tracking-[.14em] text-black/65">03</span>
                <strong className="mt-12 block font-[Georgia] text-[27px] font-normal">Read The Edit.</strong>
                <span className="mt-5 inline-flex border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.13em]">Explore stories ↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Stay connected / 05. */}

      <section className="bg-[#d13c3c] px-[clamp(22px,5vw,78px)] py-[clamp(58px,7vw,92px)] text-white">
        <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-12 max-[720px]:items-start max-[720px]:flex-col">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-white/90">Stay connected / 05</span>
            <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.88] tracking-[-.055em]">
              Beyond the inbox.<br/><em className="font-normal text-black">Find Beyonist socially.</em>
            </h2>
          </div>

          <div className="flex gap-2">
            {[
              ["Instagram", <InstagramIcon key="i" />],
              ["Facebook", <FacebookIcon key="f" />],
              ["YouTube", <YouTubeIcon key="y" />],
              ["X", <XIcon key="x" />],
            ].map(([label, icon]) => (
              <a key={label} href="#" aria-label={label} className="grid h-12 w-12 place-items-center rounded-full border border-white/25 transition hover:bg-black hover:border-black">
                {icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="h-3 bg-black" aria-hidden="true" />
    </main>
  );
}
