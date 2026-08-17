/**
 * Client API service for order api. Centralizes HTTP requests so components do not duplicate endpoint, credential, and error-handling logic.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

/**
 * Implements the track order operation used by this module.
 */
export async function trackOrder({ orderNumber, email }) {
  const params = new URLSearchParams({
    orderNumber: orderNumber.trim(),
    email: String(email || "").trim().toLowerCase(),
  });

  const response = await fetch(`${API_BASE}/orders/track?${params.toString()}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Unable to find that order.");
  return payload;
}
