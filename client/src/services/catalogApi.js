/**
 * Client API service for catalog api. Centralizes HTTP requests so components do not duplicate endpoint, credential, and error-handling logic.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { normalizeProductCollection, normalizeProductImages } from "../utils/productImagePath.js";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

/**
 * Implements the request operation used by this module.
 */
async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include",
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Unable to load the Beyonist catalogue.");
  }
  return payload;
}

/**
 * Loads products data for the current flow.
 */
export function getProducts(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") search.set(key, String(value));
  });
  const query = search.toString();
  return request(`/products${query ? `?${query}` : ""}`).then((payload) => ({
    ...payload,
    data: normalizeProductCollection(payload.data),
  }));
}

/**
 * Loads catalog meta data for the current flow.
 */
export function getCatalogMeta() {
  return request("/products/meta");
}

/**
 * Loads product data for the current flow.
 */
export function getProduct(slug) {
  return request(`/products/${encodeURIComponent(slug)}`).then((payload) => ({
    ...payload,
    data: normalizeProductImages(payload.data),
  }));
}


/**
 * Loads product availability data for the current flow.
 */
export function getProductAvailability(slugs = []) {
  const unique = [...new Set(slugs.map((slug) => String(slug || "").trim()).filter(Boolean))];
  if (!unique.length) return Promise.resolve({ success: true, data: [] });

  const search = new URLSearchParams({ slugs: unique.join(",") });
  return request(`/products/availability?${search.toString()}`).then((payload) => ({
    ...payload,
    data: normalizeProductCollection(payload.data),
  }));
}
