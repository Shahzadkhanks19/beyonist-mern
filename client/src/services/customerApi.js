/**
 * Client API service for customer api. Centralizes HTTP requests so components do not duplicate endpoint, credential, and error-handling logic.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { normalizeCmsMedia } from "../utils/productImagePath.js";

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

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "Unable to complete this customer request.");
    error.code = payload.code;
    throw error;
  }
  return normalizeCmsMedia(payload);
}

/**
 * Loads customer dashboard data for the current flow.
 */
export const getCustomerDashboard = () => request("/customer/dashboard");
/**
 * Loads customer orders data for the current flow.
 */
export const getCustomerOrders = () => request("/customer/orders");
/**
 * Loads addresses data for the current flow.
 */
export const getAddresses = () => request("/customer/addresses");
/**
 * Creates address using the validated inputs supplied by the caller.
 */
export const createAddress = (data) => request("/customer/addresses", { method: "POST", body: JSON.stringify(data) });
/**
 * Updates address while preserving the surrounding domain invariants.
 */
export const updateAddress = (id, data) => request(`/customer/addresses/${id}`, { method: "PATCH", body: JSON.stringify(data) });
/**
 * Removes address from the current workflow.
 */
export const deleteAddress = (id) => request(`/customer/addresses/${id}`, { method: "DELETE" });
/**
 * Updates profile while preserving the surrounding domain invariants.
 */
export const updateProfile = (data) => request("/customer/profile", { method: "PATCH", body: JSON.stringify(data) });
/**
 * Implements the change password operation used by this module.
 */
export const changePassword = (data) => request("/customer/password", { method: "PATCH", body: JSON.stringify(data) });
/**
 * Loads reviews data for the current flow.
 */
export const getReviews = () => request("/customer/reviews");
/**
 * Creates review using the validated inputs supplied by the caller.
 */
export const createReview = (data) => request("/customer/reviews", { method: "POST", body: JSON.stringify(data) });
/**
 * Updates review while preserving the surrounding domain invariants.
 */
export const updateReview = (id, data) => request(`/customer/reviews/${id}`, { method: "PATCH", body: JSON.stringify(data) });
/**
 * Removes review from the current workflow.
 */
export const deleteReview = (id) => request(`/customer/reviews/${id}`, { method: "DELETE" });

/** Loads a delivered order snapshot for invoice download/printing. */
export const getCustomerInvoice = (orderNumber) => request(`/customer/orders/${encodeURIComponent(orderNumber)}/invoice`);
/** Creates an overall delivered-order review. */
export const createOrderReview = (data) => request("/customer/order-reviews", { method: "POST", body: JSON.stringify(data) });
/** Updates an overall order review. */
export const updateOrderReview = (id, data) => request(`/customer/order-reviews/${id}`, { method: "PATCH", body: JSON.stringify(data) });
/** Deletes an overall order review. */
export const deleteOrderReview = (id) => request(`/customer/order-reviews/${id}`, { method: "DELETE" });

/** Loads the authenticated customer's saved products. */
export const getWishlist = () => request("/customer/wishlist");
/** Saves a product to the authenticated customer's wishlist. */
export const addToWishlist = (slug) => request(`/customer/wishlist/${encodeURIComponent(slug)}`, { method: "PATCH" });
/** Removes a product from the authenticated customer's wishlist. */
export const removeFromWishlist = (slug) => request(`/customer/wishlist/${encodeURIComponent(slug)}`, { method: "DELETE" });
