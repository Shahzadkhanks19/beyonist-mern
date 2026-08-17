/**
 * Customer-facing FAQ page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

const FAQS = [
  {
    category: "Orders",
    question: "How do I track my Beyonist order?",
    answer:
      "Open Track Order and enter the order number from your confirmation email. Signed-in customers can also open their customer dashboard to see recent orders and jump directly into tracking.",
  },
  {
    category: "Orders",
    question: "Will I receive an order confirmation?",
    answer:
      "Yes. The checkout flow sends the order confirmation to the email entered during checkout, whether you checked out as a guest or as a signed-in customer.",
  },
  {
    category: "Orders",
    question: "Do I need an account to place an order?",
    answer:
      "No. Guest checkout remains available. Creating an account is optional and adds customer-dashboard features such as saved addresses, order history, reviews and member-benefit eligibility.",
  },
  {
    category: "Shipping",
    question: "How long does standard shipping take?",
    answer:
      "The recovered Beyonist shipping policy states that standard shipping typically takes 7 business days for delivery within India.",
  },
  {
    category: "Shipping",
    question: "Is express shipping available?",
    answer:
      "Yes. The recovered shipping policy lists express shipping with a general delivery time of 5 business days within India.",
  },
  {
    category: "Shipping",
    question: "How quickly are orders processed?",
    answer:
      "The recovered policy states that order processing typically takes 2 business days and that tracking information is sent after dispatch.",
  },
  {
    category: "Shipping",
    question: "When do I get complimentary shipping?",
    answer:
      "The reconstructed storefront currently unlocks complimentary shipping when the cart subtotal reaches ₹999. Below that threshold, shipping is calculated during checkout.",
  },
  {
    category: "Returns",
    question: "Can I return an item?",
    answer:
      "The recovered returns policy allows eligible returns through customer support. Returned items are inspected before a refund is approved.",
  },
  {
    category: "Returns",
    question: "How long do approved refunds take?",
    answer:
      "According to the recovered refund policy, approved refunds are processed to the original payment method within 15 business days.",
  },
  {
    category: "Returns",
    question: "What if my item arrives damaged or defective?",
    answer:
      "Contact customer support as soon as possible. The recovered policy states that Beyonist will arrange a replacement or refund according to the applicable resolution.",
  },
  {
    category: "Products",
    question: "Where can I find ingredients and usage instructions?",
    answer:
      "Open the product detail page. The reconstructed catalogue carries the recovered product description, ingredients, usage instructions, benefits and cautions where they were available in the original material.",
  },
  {
    category: "Products",
    question: "How do I choose between Beyonist products?",
    answer:
      "Use the Shop page to browse the current collection, open a product for its detailed information, or use the navbar search to look for a formula by name or product category.",
  },
  {
    category: "Account",
    question: "What do I get by creating a customer account?",
    answer:
      "A customer account gives you a dashboard with order history, saved addresses, profile and preference management, password security, product reviews, reward-point visibility and eligibility for member-only offers or discounts when campaigns are active.",
  },
  {
    category: "Account",
    question: "Can I save more than one delivery address?",
    answer:
      "Yes. Signed-in customers can add, edit and delete saved addresses from the customer dashboard and choose one as the default address for checkout.",
  },
  {
    category: "Account",
    question: "Can I change my email or password?",
    answer:
      "Yes. Profile details can be updated from the customer dashboard. Changing the account email requires the current password, while the Security section provides a separate change-password flow.",
  },
  {
    category: "Account",
    question: "What if I forget my password?",
    answer:
      "Use Forgot Password from the sign-in page. Beyonist sends a single-use reset link to the account email. The reset link expires after 30 minutes and existing customer sessions are revoked after a successful password reset.",
  },
  {
    category: "Reviews",
    question: "Who can review a product?",
    answer:
      "Customer reviews are tied to delivered orders. Once an eligible order is delivered, a signed-in customer can review products from that order through the dashboard.",
  },
  {
    category: "Reviews",
    question: "Can I edit or delete my review?",
    answer:
      "Yes. Reviews can be edited or deleted from My Reviews. New or edited reviews return to pending moderation before publication.",
  },
  {
    category: "Support",
    question: "How can I contact Beyonist?",
    answer:
      "Call +91 85279 99563 or email contact@beyonist.com. The recovered storefront lists the office at 3rd Floor Landmark Tower, South City 1, Sector 41, Gurugram, Haryana 122001.",
  },
];

const CATEGORIES = ["All", "Orders", "Shipping", "Returns", "Products", "Account", "Reviews", "Support"];

/**
 * Renders the Search Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.5]">
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m15.7 15.7 4.3 4.3" />
    </svg>
  );
}

/**
 * Renders the FAQItem component and coordinates the state/behavior owned by this UI boundary.
 */
function FAQItem({ item, index, open, onToggle }) {
  return (
    <article className="border-b border-black/10">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group grid w-full grid-cols-[54px_minmax(0,1fr)_44px] items-center gap-4 py-[clamp(20px,2.5vw,28px)] text-left max-[560px]:grid-cols-[38px_minmax(0,1fr)_34px]"
      >
        <span className="text-[7px] font-semibold uppercase tracking-[.14em] text-[#d13c3c]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span>
          <small className="mb-2 block text-[6px] font-semibold uppercase tracking-[.15em] text-black/65">{item.category}</small>
          <strong className="block font-[Georgia] text-[clamp(21px,2.4vw,32px)] font-normal leading-[1.05] tracking-[-.025em]">
            {item.question}
          </strong>
        </span>
        <span className={`grid h-9 w-9 place-items-center rounded-full border text-[20px] font-light transition duration-300 ${
          open ? "rotate-45 border-[#d13c3c] bg-[#d13c3c] text-white" : "border-black/15 group-hover:border-black"
        }`}>
          +
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: .28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-[54px_minmax(0,1fr)_44px] gap-4 pb-[clamp(22px,3vw,34px)] max-[560px]:grid-cols-[38px_minmax(0,1fr)_34px]">
              <span />
              <p className="max-w-[860px] text-[11px] leading-7 text-black/65">{item.answer}</p>
              <span />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

/**
 * Renders the FAQ component and coordinates the state/behavior owned by this UI boundary.
 */
export default function FAQ() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [openQuestion, setOpenQuestion] = useState(FAQS[0].question);

  const filtered = useMemo(() => {
    const cleaned = query.trim().toLowerCase();
    return FAQS.filter((item) => {
      const categoryMatch = category === "All" || item.category === category;
      const searchMatch =
        !cleaned ||
        item.question.toLowerCase().includes(cleaned) ||
        item.answer.toLowerCase().includes(cleaned) ||
        item.category.toLowerCase().includes(cleaned);
      return categoryMatch && searchMatch;
    });
  }, [category, query]);

  return (
    <main className="bg-[#fffaf1]">
      {/* Section 1: Page section 1. */}
      <section className="relative overflow-hidden bg-[#faf6af] text-[#171313]">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-[44%] top-[-42%] aspect-square w-[72vw] rounded-full border border-black/[.12]" />
          <div className="absolute left-[58%] top-[0%] aspect-square w-[38vw] rounded-full border border-black/[.08]" />
          <div className="absolute inset-y-0 left-1/4 w-px bg-black/[.06]" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-black/[.06]" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-black/[.06]" />
        </div>

        <div className="relative mx-auto grid min-h-[540px] max-w-[1600px] grid-cols-[.8fr_1.2fr] max-[920px]:grid-cols-1 max-[920px]:min-h-0">
          <div className="relative z-10 flex flex-col justify-center px-[clamp(22px,5vw,78px)] py-[clamp(44px,5vw,68px)]">
            <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#d13c3c]">Customer Care / FAQ</span>
            <h1 className="mt-5 max-w-[760px] font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.81] tracking-[-.065em]">
              Answers,<br/><em className="font-normal text-[#d13c3c]">without the runaround.</em>
            </h1>
            <p className="mt-5 max-w-[560px] text-[13px] leading-7 text-black/65">
              Orders, shipping, returns, products, accounts and reviews—search the help center before you need to wait for a reply.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-[7px] uppercase tracking-[.15em] text-black/65">
              <span>Orders</span><i className="h-px w-7 bg-black/10" /><span>Products</span><i className="h-px w-7 bg-black/10" /><span>Accounts</span><i className="h-px w-7 bg-black/10" /><span>Support</span>
            </div>
          </div>

          <div className="relative min-h-[540px] overflow-hidden max-[920px]:min-h-[430px] max-[560px]:min-h-[360px]">
            <div className="absolute inset-[7%_7%_7%_4%] bg-[#d7c0c1]" />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: .985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: .7 }}
              className="absolute inset-[10%_10%_10%_7%] z-[2] grid place-items-center"
            >
              <img
                src="/images/product-hamper-840.webp" srcSet="/images/product-hamper-480.webp 480w, /images/product-hamper-840.webp 840w, /images/product-hamper.webp 1000w" sizes="(max-width: 700px) 92vw, 50vw"
                alt="Beyonist skincare collection" loading="eager" fetchPriority="high"
                className="h-full w-full object-contain p-[clamp(18px,5vw,62px)] drop-shadow-[0_34px_48px_rgba(0,0,0,.2)]"
               width="1000" height="1000" decoding="async"/>
            </motion.div>

            <div className="absolute right-[5%] top-[8%] z-[4] bg-[#d13c3c] px-5 py-4 text-white">
              <span className="block text-[6px] uppercase tracking-[.18em] text-white/90">Help center</span>
              <strong className="mt-1 block font-[Georgia] text-[22px] font-normal">Start with a question.</strong>
            </div>

            <div className="absolute bottom-[7%] left-[5%] z-[4] border-[7px] border-[#ffffff] bg-[#ffffff] p-2.5 text-black shadow-[0_24px_60px_rgba(0,0,0,.16)]">
              <img src="/images/gluta-kojic-800.webp" srcSet="/images/gluta-kojic-480.webp 480w, /images/gluta-kojic-800.webp 800w, /images/gluta-kojic.webp 1080w" sizes="165px" alt="" loading="lazy" fetchPriority="low" className="h-[clamp(105px,12vw,165px)] w-[clamp(105px,12vw,165px)] object-contain"  width="1080" height="1080" decoding="async"/>
              <div className="mt-2 flex justify-between text-[6px] uppercase tracking-[.14em]"><span>Product help</span><span>01</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Clear. */}

      <section className="border-b border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)]">
        <div className="mx-auto max-w-[1440px] py-5">
          <label className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-black pb-4">
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the help center..."
              className="min-w-0 bg-transparent font-[Georgia] text-[clamp(24px,3.2vw,38px)] outline-none placeholder:text-black/60"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="text-[7px] font-semibold uppercase tracking-[.13em] text-black/65">Clear</button>
            ) : (
              <span className="text-[7px] uppercase tracking-[.13em] text-black/65">{FAQS.length} answers</span>
            )}
          </label>

          <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-[7px] font-semibold uppercase tracking-[.13em] transition ${
                  category === item
                    ? "border-black bg-black text-white"
                    : "border-black/[.12] text-black/65 hover:border-black hover:text-black"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Help center / 01. */}

      <section className="px-[clamp(22px,5vw,78px)] py-[clamp(64px,7vw,96px)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[300px_minmax(0,1fr)] gap-[clamp(45px,7vw,105px)] max-[900px]:grid-cols-1">
          <aside className="self-start min-[901px]:sticky min-[901px]:top-[145px]">
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Help center / 01</span>
            <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.92] tracking-[-.045em]">
              Find it.<br/><em className="font-normal text-[#d13c3c]">Then move on.</em>
            </h2>
            <p className="mt-6 text-[10px] leading-6 text-black/65">
              Filter by topic or search across the full answer set. If the FAQ does not solve it, customer care is one click away.
            </p>

            <div className="mt-8 border-t border-black/10">
              <Link to="/track-order" className="flex items-center justify-between border-b border-black/10 py-4 text-[7px] font-semibold uppercase tracking-[.12em]">
                <span>Track an order</span><span>↗</span>
              </Link>
              <Link to="/contact" className="flex items-center justify-between border-b border-black/10 py-4 text-[7px] font-semibold uppercase tracking-[.12em]">
                <span>Contact customer care</span><span>↗</span>
              </Link>
              <Link to="/return-refund-policy" className="flex items-center justify-between border-b border-black/10 py-4 text-[7px] font-semibold uppercase tracking-[.12em]">
                <span>Returns & refunds</span><span>↗</span>
              </Link>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex items-center justify-between gap-5 border-b border-black pb-4">
              <span className="text-[8px] font-semibold uppercase tracking-[.15em]">
                {category === "All" ? "All questions" : category}
              </span>
              <span className="text-[7px] uppercase tracking-[.13em] text-black/65">{filtered.length} results</span>
            </div>

            {filtered.length ? (
              filtered.map((item, index) => (
                <FAQItem
                  key={item.question}
                  item={item}
                  index={index}
                  open={openQuestion === item.question}
                  onToggle={() => setOpenQuestion((current) => current === item.question ? "" : item.question)}
                />
              ))
            ) : (
              <div className="grid min-h-[340px] place-items-center border border-black/10 bg-[#ffffff] p-8 text-center">
                <div>
                  <span className="text-[8px] font-semibold uppercase tracking-[.16em] text-[#d13c3c]">No matching answer</span>
                  <h3 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,52px)] font-normal">Try another phrase.</h3>
                  <p className="mx-auto mt-3 max-w-[460px] text-[10px] leading-5 text-black/65">Or send the question directly to Beyonist customer care.</p>
                  <Link to="/contact" className="mt-6 inline-flex min-w-[200px] items-center justify-between bg-black px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white">
                    <span>Contact Beyonist</span><span>↗</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 4: Still need help / 02. */}

      <section className="border-y border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)] py-[clamp(60px,7vw,96px)]">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-[.72fr_1.28fr] items-end gap-12 max-[820px]:grid-cols-1">
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Still need help? / 02</span>
              <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.055em]">
                The FAQ can stop.<br/><em className="font-normal text-[#d13c3c]">The conversation doesn’t.</em>
              </h2>
            </div>

            <div className="grid grid-cols-3 border-l border-t border-black/10 max-[700px]:grid-cols-1">
              <a href="tel:+918527999563" className="group border-b border-r border-black/10 p-6 transition hover:bg-[#fffaf1]">
                <span className="text-[6px] uppercase tracking-[.14em] text-black/65">01 / Call</span>
                <strong className="mt-12 block font-[Georgia] text-[26px] font-normal">+91 85279 99563</strong>
                <span className="mt-5 inline-flex border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.12em]">Call customer care ↗</span>
              </a>
              <a href="mailto:contact@beyonist.com" className="group border-b border-r border-black/10 p-6 transition hover:bg-[#fffaf1]">
                <span className="text-[6px] uppercase tracking-[.14em] text-black/65">02 / Email</span>
                <strong className="mt-12 block break-all font-[Georgia] text-[26px] font-normal">contact@beyonist.com</strong>
                <span className="mt-5 inline-flex border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.12em]">Write to us ↗</span>
              </a>
              <Link to="/contact" className="group border-b border-r border-black/10 p-6 transition hover:bg-[#fffaf1]">
                <span className="text-[6px] uppercase tracking-[.14em] text-black/65">03 / Form</span>
                <strong className="mt-12 block font-[Georgia] text-[26px] font-normal">Send a detailed enquiry.</strong>
                <span className="mt-5 inline-flex border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.12em]">Open contact page ↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Beyonist customer care / 03. */}

      <section className="bg-[#d13c3c] px-[clamp(22px,5vw,78px)] py-[clamp(58px,7vw,92px)] text-white">
        <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-10 max-[720px]:items-start max-[720px]:flex-col">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-white/90">Beyonist customer care / 03</span>
            <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.88] tracking-[-.055em]">
              Need product context?<br/><em className="font-normal text-black">Read The Edit.</em>
            </h2>
          </div>
          <Link to="/blogs" className="inline-flex min-w-[220px] items-center justify-between bg-black px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em]">
            <span>Explore stories</span><span>↗</span>
          </Link>
        </div>
      </section>

      <div className="h-3 bg-black" aria-hidden="true" />
    </main>
  );
}
