/**
 * Client API service for checkout api. Centralizes HTTP requests so components do not duplicate endpoint, credential, and error-handling logic.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

/**
 * Implements the request operation used by this module.
 */
async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Unable to complete the request.");
    error.code = data.code;
    throw error;
  }
  return data;
}

/**
 * Creates order using the validated inputs supplied by the caller.
 */
export const createOrder = (payload) => request("/orders", { method: "POST", body: JSON.stringify(payload) });
/**
 * Loads commerce settings data for the current flow.
 */
export const getCommerceSettings = () => request("/commerce/settings");
/**
 * Loads commerce quote data for the current flow.
 */
export const getCommerceQuote = (subtotal, couponCode = "") => request("/commerce/quote", {
  method: "POST",
  body: JSON.stringify({ subtotal, couponCode }),
});
