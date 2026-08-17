/** Public delivered-order review invitation and testimonial API. */
import { normalizeCmsMedia } from "../utils/productImagePath.js";
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Unable to submit this review.");
  return normalizeCmsMedia(payload);
}
export const getReviewInvite = (order, token) => request(`/reviews/invite?order=${encodeURIComponent(order)}&token=${encodeURIComponent(token)}`);
export const submitInvitedProductReview = (data) => request("/reviews/invite/product", { method: "POST", body: JSON.stringify(data) });
export const submitInvitedOrderReview = (data) => request("/reviews/invite/order", { method: "POST", body: JSON.stringify(data) });
export const getPublishedTestimonials = () => request("/reviews/testimonials");
