/**
 * Client API service for checkout flows. Production requests intentionally use the
 * storefront origin so authenticated checkout/customer cookies remain first-party.
 */

const API_BASE = import.meta.env.PROD
  ? "/api"
  : (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

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
    error.status = response.status;
    throw error;
  }
  return data;
}

export const createOrder = (payload) => request("/orders", {
  method: "POST",
  body: JSON.stringify(payload),
});

export const getCommerceSettings = () => request("/commerce/settings");

export const getCommerceQuote = (subtotal, couponCode = "") => request("/commerce/quote", {
  method: "POST",
  body: JSON.stringify({ subtotal, couponCode }),
});

/** Resolve an Indian 6-digit PIN into a district/city and state via the API backend. */
export const lookupPincode = (postalCode) => request(`/commerce/pincode/${encodeURIComponent(postalCode)}`);
