/**
 * Reusable storefront component for floating actions. Encapsulates shared UI behavior so page files stay focused on page composition.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const WHATSAPP_NUMBER = "918527999563";

const quickTopics = [
  { id: "products", label: "Product help", prompt: "I need help choosing a product." },
  { id: "order", label: "Track an order", prompt: "How can I track my order?" },
  { id: "shipping", label: "Shipping", prompt: "Tell me about shipping." },
  { id: "returns", label: "Returns", prompt: "What is the return policy?" },
];

const supportReplies = {
  products: {
    title: "Product help",
    text: "You can browse the full Beyonist collection and open any product for ingredients, usage instructions, cautions and product-specific details.",
    action: { label: "Browse products", to: "/shop" },
  },
  order: {
    title: "Track an order",
    text: "Use the Track Order page to check your order status. Keep your order reference handy.",
    action: { label: "Track order", to: "/track-order" },
  },
  shipping: {
    title: "Shipping",
    text: "Beyonist ships across India. Complimentary shipping is available on qualifying orders over ₹999. The Shipping Policy has the full details.",
    action: { label: "Shipping policy", to: "/shipping-policy" },
  },
  returns: {
    title: "Returns & refunds",
    text: "Return eligibility depends on the condition of the product and the policy terms. Review the full Returns & Refunds page before opening or using a product you may wish to return.",
    action: { label: "Returns & refunds", to: "/return-refund-policy" },
  },
  contact: {
    title: "Contact Beyonist",
    text: "You can reach the Beyonist team at +91 85279 99563 or contact@beyonist.com.",
    action: { label: "Contact page", to: "/contact" },
  },
  faq: {
    title: "Frequently asked questions",
    text: "The FAQ covers common questions about orders, products, shipping and customer care.",
    action: { label: "View FAQ", to: "/faq" },
  },
};

/**
 * Implements the resolve reply operation used by this module.
 */
function resolveReply(message = "") {
  const value = message.toLowerCase();

  if (/(track|order|where.*order|status)/.test(value)) return supportReplies.order;
  if (/(ship|delivery|deliver|dispatch)/.test(value)) return supportReplies.shipping;
  if (/(return|refund|exchange|cancel)/.test(value)) return supportReplies.returns;
  if (/(product|serum|soap|lotion|scrub|ingredient|skin|formula)/.test(value)) return supportReplies.products;
  if (/(contact|phone|email|call|address|support|help)/.test(value)) return supportReplies.contact;
  if (/(faq|question)/.test(value)) return supportReplies.faq;

  return {
    title: "Beyonist support",
    text: "I can help with products, order tracking, shipping, returns, FAQs or contact details. Choose a topic below or type one of those subjects.",
    action: { label: "View FAQ", to: "/faq" },
  };
}

/**
 * Renders the Arrow Up Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.6]">
      <path d="M12 20V5M6.5 10.5 12 5l5.5 5.5" />
    </svg>
  );
}

/**
 * Renders the Whats App Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[19px] w-[19px] fill-current">
      <path d="M12.03 2a9.81 9.81 0 0 0-8.42 14.86L2 22l5.3-1.55A9.97 9.97 0 0 0 12.03 22C17.53 22 22 17.52 22 12S17.53 2 12.03 2Zm0 18.18a8.13 8.13 0 0 1-4.14-1.14l-.3-.18-3.15.92.94-3.06-.2-.32a8.15 8.15 0 1 1 6.85 3.78Zm4.47-6.1c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

/**
 * Renders the Chat Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.6]">
      <path d="M5 18.5 3.8 21l3.7-1.1A8.8 8.8 0 1 0 5 18.5Z" />
      <path d="M8 10.5h8M8 14h5" />
    </svg>
  );
}

/**
 * Renders the Close Icon component and coordinates the state/behavior owned by this UI boundary.
 */
function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.5]">
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  );
}

/**
 * Renders the Floating Actions component and coordinates the state/behavior owned by this UI boundary.
 */
export default function FloatingActions() {
  const location = useLocation();
  const [showTop, setShowTop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState(null);
  const inputRef = useRef(null);

  const whatsappHref = useMemo(
    () => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Beyonist, I need help with my order or products.")}`,
    []
  );

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setChatOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (chatOpen) window.setTimeout(() => inputRef.current?.focus(), 160);
  }, [chatOpen]);

  /**
   * Implements the ask operation used by this module.
   */
  const ask = (text) => {
    const clean = text.trim();
    if (!clean) return;
    setReply(resolveReply(clean));
    setMessage("");
  };

  /**
   * Implements the choose topic operation used by this module.
   */
  const chooseTopic = (id) => {
    setReply(supportReplies[id]);
  };

  return (
    <>
      {chatOpen ? (
          <aside
            className="beyonist-float-in fixed bottom-[clamp(16px,2vw,28px)] right-[88px] z-[90] flex h-[min(620px,calc(100dvh-48px))] max-h-[calc(100dvh-48px)] w-[min(390px,calc(100vw-120px))] flex-col overflow-hidden border border-black/10 bg-[#ffffff] shadow-[0_26px_80px_rgba(0,0,0,.22)] max-[560px]:bottom-[76px] max-[560px]:right-4 max-[560px]:h-[min(560px,calc(100dvh-96px))] max-[560px]:max-h-[calc(100dvh-96px)] max-[560px]:w-[calc(100vw-32px)]"
            role="dialog"
            aria-label="Beyonist customer support"
          >
            <div className="flex shrink-0 items-start justify-between gap-5 bg-[#d13c3c] px-5 py-5 text-white">
              <div>
                <span className="text-[7px] font-semibold uppercase tracking-[.18em] text-white/90">Customer care</span>
                <h2 className="mt-2 font-[Georgia] text-[28px] font-normal leading-none max-[560px]:text-[25px]">How can we help?</h2>
                <p className="mt-2 text-[9px] leading-4 text-white/90">Quick support. No AI, no waiting.</p>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 transition hover:bg-white hover:text-[#d13c3c]"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
              <div className="rounded-[2px] bg-[#fffaf1] p-4">
                <span className="text-[6px] font-semibold uppercase tracking-[.16em] text-[#d13c3c]">Beyonist support</span>
                <p className="mt-2 text-[11px] leading-5 text-black/60">
                  Choose a quick topic or type what you need help with.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {quickTopics.map((topic) => (
                  <button
                    type="button"
                    key={topic.id}
                    onClick={() => chooseTopic(topic.id)}
                    className="border border-black/10 bg-white/50 px-3 py-3 text-left text-[8px] font-semibold uppercase tracking-[.1em] transition hover:border-black hover:bg-black hover:text-white"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>

              {reply ? (
                  <div
                    key={reply.title}
                    className="beyonist-reply-in mt-4 border-l-2 border-[#d13c3c] bg-[#fffaf1] p-4"
                  >
                    <strong className="font-[Georgia] text-[19px] font-normal">{reply.title}</strong>
                    <p className="mt-2 text-[10px] leading-5 text-black/65">{reply.text}</p>
                    {reply.action ? (
                      <Link
                        to={reply.action.to}
                        className="mt-4 inline-flex items-center gap-2 border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.13em]"
                      >
                        {reply.action.label} <span>↗</span>
                      </Link>
                    ) : null}
                  </div>
                ) : null}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                ask(message);
              }}
              className="grid shrink-0 grid-cols-[1fr_auto] border-t border-black/10 bg-white"
            >
              <input
                ref={inputRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type: shipping, returns, products..."
                aria-label="Support question"
                className="min-w-0 bg-transparent px-4 py-4 text-[10px] outline-none placeholder:text-black/65"
              />
              <button
                type="submit"
                className="min-w-[74px] bg-black px-4 text-[7px] font-semibold uppercase tracking-[.13em] text-white transition hover:bg-[#d13c3c]"
              >
                Send
              </button>
            </form>
          </aside>
        ) : null}

      <div className="fixed bottom-[clamp(16px,2vw,28px)] right-[clamp(16px,2vw,28px)] z-[85] flex flex-col items-center gap-2 max-[560px]:gap-1.5">
        {showTop ? (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Scroll to top"
              className="group order-1 grid h-12 w-12 place-items-center rounded-full border border-black/10 bg-[#ffffff] max-[560px]:h-11 max-[560px]:w-11 text-black shadow-[0_12px_35px_rgba(0,0,0,.13)] transition hover:-translate-y-1 hover:bg-black hover:text-white"
            >
              <ArrowUpIcon />
            </button>
          ) : null}

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Beyonist on WhatsApp"
          className="group order-2 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] max-[560px]:h-11 max-[560px]:w-11 text-white shadow-[0_12px_35px_rgba(0,0,0,.16)] transition hover:-translate-y-1"
        >
          <WhatsAppIcon />
        </a>

        <button
          type="button"
          onClick={() => setChatOpen((value) => !value)}
          aria-label={chatOpen ? "Close customer support chat" : "Open customer support chat"}
          aria-expanded={chatOpen}
          className={`group order-3 grid h-12 w-12 place-items-center rounded-full shadow-[0_12px_35px_rgba(0,0,0,.16)] transition hover:-translate-y-1 max-[560px]:h-11 max-[560px]:w-11 ${
            chatOpen ? "bg-[#d13c3c] text-white" : "bg-black text-white"
          }`}
        >
          {chatOpen ? <CloseIcon /> : <ChatIcon />}
        </button>
      </div>
    </>
  );
}
