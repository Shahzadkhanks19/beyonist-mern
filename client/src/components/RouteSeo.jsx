/**
 * Reusable storefront component for route seo. Encapsulates shared UI behavior so page files stay focused on page composition.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Beyonist";
const DEFAULT_DESCRIPTION = "Beyonist skincare — considered formulas and everyday rituals for confident, luminous skin.";

const routeMeta = {
  "/": { title: "Beyonist — Skin Beyond Ordinary", description: DEFAULT_DESCRIPTION },
  "/shop": { title: "Shop Skincare | Beyonist", description: "Explore the Beyonist skincare collection, product formulas and everyday ritual essentials." },
  "/blogs": { title: "The Edit | Beyonist", description: "Read The Beyonist Edit — product notes, skincare rituals and formula-focused stories." },
  "/about": { title: "Our Story | Beyonist", description: "Discover the story, philosophy and point of view behind Beyonist skincare." },
  "/contact": { title: "Contact Beyonist", description: "Contact Beyonist customer care for product, order and general enquiries." },
  "/track-order": { title: "Track Your Order | Beyonist", description: "Track a Beyonist order securely with your order reference and checkout email.", noindex: true },
  "/faq": { title: "Frequently Asked Questions | Beyonist", description: "Answers about Beyonist orders, shipping, returns, products, accounts and customer care." },
  "/shipping-policy": { title: "Shipping Policy | Beyonist", description: "Read the Beyonist shipping, processing, tracking and delivery policy." },
  "/return-refund-policy": { title: "Returns & Refunds | Beyonist", description: "Read the Beyonist returns, exchanges and refund policy." },
  "/terms-and-conditions": { title: "Terms & Conditions | Beyonist", description: "Terms governing the Beyonist storefront, customer accounts and purchases." },
  "/cart": { title: "Your Bag | Beyonist", noindex: true },
  "/checkout": { title: "Checkout | Beyonist", noindex: true },
  "/login": { title: "Sign In | Beyonist", noindex: true },
  "/signup": { title: "Create Account | Beyonist", noindex: true },
  "/forgot-password": { title: "Forgot Password | Beyonist", noindex: true },
  "/reset-password": { title: "Reset Password | Beyonist", noindex: true },
  "/account": { title: "Your Account | Beyonist", noindex: true },
  "/payment/success": { title: "Order Confirmed | Beyonist", noindex: true },
  "/payment/failure": { title: "Payment Status | Beyonist", noindex: true },
  "/error": { title: "Something Went Wrong | Beyonist", noindex: true },
};

/**
 * Implements the ensure meta operation used by this module.
 */
function ensureMeta(name, content, attribute = "name") {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/**
 * Implements the ensure canonical operation used by this module.
 */
function ensureCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * Implements the resolve meta operation used by this module.
 */
function resolveMeta(pathname) {
  if (pathname.startsWith("/admin")) return { title: "Beyonist Administration", description: "Beyonist administrator workspace.", noindex: true };
  if (routeMeta[pathname]) return routeMeta[pathname];
  if (pathname.startsWith("/product/")) return { title: "Product | Beyonist", description: "Explore product details, ingredients, benefits and usage from Beyonist." };
  if (pathname.startsWith("/blogs/")) return { title: "The Edit | Beyonist", description: "A story from The Beyonist Edit." };
  return { title: "Page Not Found | Beyonist", description: DEFAULT_DESCRIPTION, noindex: true };
}

/**
 * Implements the apply seo operation used by this module.
 */
export function applySeo({ title, description = DEFAULT_DESCRIPTION, image = "/images/product-hamper.webp", noindex = false, canonicalPath, type = "website", structuredData } = {}) {
  const siteUrl = String(import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, "");
  const path = canonicalPath || window.location.pathname;
  const canonical = `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const imageUrl = image?.startsWith("http") ? image : `${siteUrl}${image?.startsWith("/") ? image : `/${image}`}`;

  document.title = title || `${SITE_NAME} — Skin Beyond Ordinary`;
  ensureMeta("description", description);
  ensureMeta("robots", noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
  ensureMeta("og:site_name", SITE_NAME, "property");
  ensureMeta("og:title", document.title, "property");
  ensureMeta("og:description", description, "property");
  ensureMeta("og:type", type, "property");
  ensureMeta("og:url", canonical, "property");
  ensureMeta("og:image", imageUrl, "property");
  ensureMeta("twitter:card", "summary_large_image");
  ensureMeta("twitter:title", document.title);
  ensureMeta("twitter:description", description);
  ensureMeta("twitter:image", imageUrl);
  ensureCanonical(canonical);

  const scriptId = "beyonist-route-structured-data";
  let script = document.getElementById(scriptId);
  if (structuredData) {
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  } else if (script) {
    script.remove();
  }
}

/**
 * Renders the Route Seo component and coordinates the state/behavior owned by this UI boundary.
 */
export default function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    applySeo({ ...resolveMeta(pathname), canonicalPath: pathname });
  }, [pathname]);

  return null;
}
