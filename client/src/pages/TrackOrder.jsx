/**
 * Customer-facing Track Order page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { trackOrder } from "../services/orderApi.js";

const DEMO_STEPS = [
  { key: "placed", label: "Order placed", description: "We received your order." },
  { key: "confirmed", label: "Confirmed", description: "The order is being prepared for dispatch." },
  { key: "shipped", label: "Shipped", description: "Your package is on the way." },
  { key: "delivered", label: "Delivered", description: "The order has reached its destination." },
];

/**
 * Implements the status index operation used by this module.
 */
function statusIndex(status = "") {
  const map = { placed: 0, confirmed: 1, processing: 1, shipped: 2, out_for_delivery: 2, delivered: 3 };
  return map[status] ?? 0;
}

/**
 * Renders the Track Order component and coordinates the state/behavior owned by this UI boundary.
 */
export default function TrackOrder() {
  const [form, setForm] = useState({ orderNumber: "", email: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setOrder(null);

    if (form.orderNumber.trim().length < 3) {
      setStatus({ type: "error", message: "Enter your order number to continue." });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setStatus({ type: "error", message: "Enter the email address used for this order." });
      return;
    }

    setLoading(true);
    try {
      const response = await trackOrder(form);
      setOrder(response.data);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "We could not find that order." });
    } finally {
      setLoading(false);
    }
  }

  const activeStep = statusIndex(order?.status);

  return (
    <main className="bg-[#fffaf1]">
      {/* Section 1: Page section 1. */}
      <section className="relative overflow-hidden bg-[#d13c3c] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-[44%] top-[-38%] aspect-square w-[70vw] rounded-full border border-white/30" />
          <div className="absolute left-[58%] top-[0%] aspect-square w-[37vw] rounded-full border border-white/18" />
          <div className="absolute inset-y-0 left-1/4 w-px bg-white/10" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-white/10" />
        </div>

        <div className="relative mx-auto grid min-h-[540px] max-w-[1600px] grid-cols-[.8fr_1.2fr] max-[920px]:grid-cols-1 max-[920px]:min-h-0">
          <div className="relative z-10 flex flex-col justify-center px-[clamp(22px,5vw,78px)] py-[clamp(44px,5vw,68px)]">
            <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-white/90">Track Order / Customer Care</span>
            <h1 className="mt-5 max-w-[760px] font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.81] tracking-[-.065em]">
              Follow the<br/><em className="font-normal text-black">journey.</em>
            </h1>
            <p className="mt-5 max-w-[540px] text-[13px] leading-7 text-white/90">
              Enter your Beyonist order number and the email used at checkout to securely view the latest fulfilment status.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-[7px] uppercase tracking-[.15em] text-white/90">
              <span>Order placed</span><i className="h-px w-7 bg-white/35" /><span>Prepared</span><i className="h-px w-7 bg-white/35" /><span>Shipped</span><i className="h-px w-7 bg-white/35" /><span>Delivered</span>
            </div>
          </div>

          <div className="relative min-h-[540px] overflow-hidden max-[920px]:min-h-[430px] max-[560px]:min-h-[360px]">
            <div className="absolute inset-[7%_7%_7%_4%] bg-[#f0d7c4]" />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: .985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: .7 }}
              className="absolute inset-[10%_10%_10%_7%] z-[2] grid place-items-center"
            >
              <img src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw" alt="Beyonist order collection" loading="eager" fetchPriority="high" className="h-full w-full object-contain p-[clamp(18px,5vw,62px)] drop-shadow-[0_34px_48px_rgba(80,0,5,.18)]"  width="1000" height="1000" decoding="async"/>
            </motion.div>

            <div className="absolute right-[5%] top-[8%] z-[4] bg-black px-5 py-4 text-white">
              <span className="block text-[6px] uppercase tracking-[.18em] text-white/90">Your order</span>
              <strong className="mt-1 block font-[Georgia] text-[22px] font-normal">One journey. Four stages.</strong>
            </div>

            <div className="absolute bottom-[7%] left-[5%] z-[4] border-[7px] border-[#ffffff] bg-[#ffffff] p-2.5 text-black shadow-[0_24px_60px_rgba(0,0,0,.16)]">
              <img src="/images/sunblock-lotion-800.webp" srcSet="/images/sunblock-lotion-480.webp 480w, /images/sunblock-lotion-800.webp 800w, /images/sunblock-lotion.webp 1080w" sizes="165px" alt="" loading="lazy" fetchPriority="low" className="h-[clamp(105px,12vw,165px)] w-[clamp(105px,12vw,165px)] object-contain"  width="1080" height="1080" decoding="async"/>
              <div className="mt-2 flex justify-between text-[6px] uppercase tracking-[.14em]"><span>In transit</span><span>03</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Order lookup / 01. */}

      <section className="px-[clamp(22px,5vw,78px)] py-[clamp(64px,8vw,96px)]">
        <div className="mx-auto grid max-w-[1320px] grid-cols-[.62fr_1.38fr] gap-[clamp(50px,7vw,110px)] max-[900px]:grid-cols-1">
          <div className="self-start">
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Order lookup / 01</span>
            <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">
              Find your<br/><em className="font-normal text-[#d13c3c]">order.</em>
            </h2>
            <p className="mt-6 max-w-[430px] text-[11px] leading-6 text-black/65">
              Use the order number from your confirmation together with the email address used at checkout. Both details must match the order.
            </p>

            <div className="mt-9 border-t border-black/10">
              <div className="grid grid-cols-[42px_1fr] gap-4 border-b border-black/10 py-5">
                <span className="text-[7px] uppercase tracking-[.14em] text-black/65">01</span>
                <div>
                  <strong className="font-[Georgia] text-[20px] font-normal">Locate your confirmation.</strong>
                  <p className="mt-1 text-[9px] leading-5 text-black/65">Your order reference should appear in the purchase confirmation.</p>
                </div>
              </div>
              <div className="grid grid-cols-[42px_1fr] gap-4 border-b border-black/10 py-5">
                <span className="text-[7px] uppercase tracking-[.14em] text-black/65">02</span>
                <div>
                  <strong className="font-[Georgia] text-[20px] font-normal">Enter the reference.</strong>
                  <p className="mt-1 text-[9px] leading-5 text-black/65">We’ll look for the most recent status stored for that order.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden border border-black/10 bg-[#ffffff] shadow-[0_24px_70px_rgba(0,0,0,.06)]">
            <div className="bg-[#111] px-[clamp(24px,4vw,48px)] py-7 text-white">
              <span className="text-[7px] font-semibold uppercase tracking-[.17em] text-[#d13c3c]">Beyonist order tracker</span>
              <h3 className="mt-3 font-[Georgia] text-[clamp(30px,3.5vw,46px)] font-normal leading-none">Where is my order?</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-[1fr_.85fr] max-[650px]:grid-cols-1">
                <label className="group border-b border-r border-black/10 p-[clamp(24px,3vw,36px)] max-[650px]:border-r-0">
                  <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 transition group-focus-within:text-[#d13c3c]">Order number *</span>
                  <input
                    value={form.orderNumber}
                    onChange={(e) => update("orderNumber", e.target.value.toUpperCase())}
                    placeholder="BEY-1001"
                    autoComplete="off"
                    className="mt-5 w-full bg-transparent font-[Georgia] text-[28px] outline-none placeholder:text-black/60"
                  />
                </label>

                <label className="group border-b border-black/10 p-[clamp(24px,3vw,36px)]">
                  <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 transition group-focus-within:text-[#d13c3c]">Email *</span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="mt-5 w-full bg-transparent font-[Georgia] text-[24px] outline-none placeholder:text-black/60"
                  />
                </label>
              </div>

              {status.message && (
                <div className={`border-b px-[clamp(24px,3vw,36px)] py-4 text-[9px] uppercase tracking-[.1em] ${status.type === "error" ? "border-[#d13c3c]/20 bg-[#d13c3c]/10 text-[#a51622]" : "border-black/10 bg-black text-white"}`}>
                  {status.message}
                </div>
              )}

              <button disabled={loading} className="group flex w-full items-center justify-between bg-[#d13c3c] px-[clamp(24px,3vw,36px)] py-5 text-[8px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
                <span>{loading ? "Looking for your order..." : "Track this order"}</span>
                <span className="transition-transform group-hover:translate-x-1">↗</span>
              </button>
            </form>

            {order && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="border-t border-black/10">
                <div className="grid grid-cols-3 border-b border-black/10 bg-[#fffaf1] max-[620px]:grid-cols-1">
                  <div className="border-r border-black/10 p-5 max-[620px]:border-b max-[620px]:border-r-0">
                    <span className="text-[6px] uppercase tracking-[.15em] text-black/65">Order</span>
                    <strong className="mt-2 block font-[Georgia] text-[20px] font-normal">{order.orderNumber}</strong>
                  </div>
                  <div className="border-r border-black/10 p-5 max-[620px]:border-b max-[620px]:border-r-0">
                    <span className="text-[6px] uppercase tracking-[.15em] text-black/65">Status</span>
                    <strong className="mt-2 block font-[Georgia] text-[20px] font-normal capitalize">{String(order.status || "placed").replaceAll("_", " ")}</strong>
                  </div>
                  <div className="p-5">
                    <span className="text-[6px] uppercase tracking-[.15em] text-black/65">Last update</span>
                    <strong className="mt-2 block font-[Georgia] text-[20px] font-normal">{order.updatedAt ? new Date(order.updatedAt).toLocaleDateString("en-IN") : "—"}</strong>
                  </div>
                </div>

                <div className="p-[clamp(24px,4vw,46px)]">
                  <div className="relative">
                    <div className="absolute left-[18px] top-5 bottom-5 w-px bg-black/10" />
                    {DEMO_STEPS.map((step, index) => {
                      const complete = index <= activeStep;
                      return (
                        <div key={step.key} className="relative grid grid-cols-[38px_1fr] gap-5 pb-8 last:pb-0">
                          <div className={`relative z-[2] grid h-9 w-9 place-items-center rounded-full border text-[7px] font-semibold ${complete ? "border-[#d13c3c] bg-[#d13c3c] text-white" : "border-black/15 bg-[#ffffff] text-black/65"}`}>
                            {complete ? "✓" : String(index + 1).padStart(2, "0")}
                          </div>
                          <div>
                            <strong className={`font-[Georgia] text-[24px] font-normal ${complete ? "text-black" : "text-black/65"}`}>{step.label}</strong>
                            <p className="mt-1 text-[9px] leading-5 text-black/65">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {order.trackingNumber ? (
                    <div className="mt-8 border-t border-black/10 pt-5">
                      <span className="text-[7px] uppercase tracking-[.14em] text-black/65">Courier tracking</span>
                      <p className="mt-2 font-[Georgia] text-[22px]">{order.trackingNumber}</p>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Need a hand / 02. */}

      <section className="border-y border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)] py-[clamp(65px,7vw,100px)]">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-[.7fr_1.3fr] items-end gap-12 max-[820px]:grid-cols-1">
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Need a hand? / 02</span>
              <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">
                If the status<br/><em className="font-normal text-[#d13c3c]">doesn’t answer it.</em>
              </h2>
            </div>

            <div className="grid grid-cols-3 border-l border-t border-black/10 max-[650px]:grid-cols-1">
              <Link to="/contact" className="group border-b border-r border-black/10 p-7 transition hover:bg-[#fffaf1]">
                <span className="text-[7px] uppercase tracking-[.14em] text-black/65">01</span>
                <strong className="mt-12 block font-[Georgia] text-[27px] font-normal">Contact customer care.</strong>
                <span className="mt-5 inline-flex border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.13em]">Send a note ↗</span>
              </Link>

              <Link to="/shipping-policy" className="group border-b border-r border-black/10 p-7 transition hover:bg-[#fffaf1]">
                <span className="text-[7px] uppercase tracking-[.14em] text-black/65">02</span>
                <strong className="mt-12 block font-[Georgia] text-[27px] font-normal">Read shipping details.</strong>
                <span className="mt-5 inline-flex border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.13em]">Shipping policy ↗</span>
              </Link>

              <Link to="/faq" className="group border-b border-r border-black/10 p-7 transition hover:bg-[#fffaf1]">
                <span className="text-[7px] uppercase tracking-[.14em] text-black/65">03</span>
                <strong className="mt-12 block font-[Georgia] text-[27px] font-normal">Check common answers.</strong>
                <span className="mt-5 inline-flex border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.13em]">View FAQs ↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Customer care / 03. */}

      <section className="bg-[#111] px-[clamp(22px,5vw,78px)] py-[clamp(60px,7vw,92px)] text-white">
        <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-12 max-[720px]:items-start max-[720px]:flex-col">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Customer care / 03</span>
            <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.88] tracking-[-.055em]">
              Still unsure?<br/><em className="font-normal text-[#d13c3c]">Talk to Beyonist.</em>
            </h2>
          </div>

          <a href="tel:+918527999563" className="inline-flex min-w-[235px] items-center justify-between bg-[#d13c3c] px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em] text-white">
            <span>+91 85279 99563</span><span>↗</span>
          </a>
        </div>
      </section>

      <div className="h-3 bg-black" aria-hidden="true" />
    </main>
  );
}
