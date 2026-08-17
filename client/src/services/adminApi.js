/**
 * Client API service for admin api. Centralizes HTTP requests so components do not duplicate endpoint, credential, and error-handling logic.
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
    const error = new Error(payload.message || "Unable to complete the administrator request.");
    error.code = payload.code || "ADMIN_REQUEST_FAILED";
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return normalizeCmsMedia(payload);
}

/**
 * Implements the qs operation used by this module.
 */
function qs(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== "") search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

/**
 * Implements the admin me operation used by this module.
 */
export const adminMe = () => request("/admin/auth/me");
/**
 * Implements the admin login operation used by this module.
 */
export const adminLogin = (email, password) => request("/admin/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
/**
 * Implements the admin logout operation used by this module.
 */
export const adminLogout = () => request("/admin/auth/logout", { method: "POST" });
/**
 * Implements the admin forgot password operation used by this module.
 */
export const adminForgotPassword = (email) => request("/admin/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
/**
 * Implements the admin reset password operation used by this module.
 */
export const adminResetPassword = (token, newPassword) => request("/admin/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) });

/**
 * Loads admin dashboard data for the current flow.
 */
export const getAdminDashboard = () => request("/admin/dashboard");

/**
 * Loads admin orders data for the current flow.
 */
export const getAdminOrders = (params) => request(`/admin/orders${qs(params)}`);
/**
 * Loads admin order data for the current flow.
 */
export const getAdminOrder = (orderNumber) => request(`/admin/orders/${encodeURIComponent(orderNumber)}`);
/**
 * Updates admin order while preserving the surrounding domain invariants.
 */
export const updateAdminOrder = (orderNumber, data) => request(`/admin/orders/${encodeURIComponent(orderNumber)}`, { method: "PATCH", body: JSON.stringify(data) });
/**
 * Loads admin order bill data for the current flow.
 */
export const getAdminOrderBill = (orderNumber) => request(`/admin/orders/${encodeURIComponent(orderNumber)}/bill`);

/**
 * Loads admin customers data for the current flow.
 */
export const getAdminCustomers = (params) => request(`/admin/customers${qs(params)}`);
/**
 * Loads admin customer data for the current flow.
 */
export const getAdminCustomer = (id) => request(`/admin/customers/${id}`);
/**
 * Updates admin customer while preserving the surrounding domain invariants.
 */
export const updateAdminCustomer = (id, data) => request(`/admin/customers/${id}`, { method: "PATCH", body: JSON.stringify(data) });

/**
 * Loads admin products data for the current flow.
 */
export const getAdminProducts = (params) => request(`/admin/products${qs(params)}`);
/**
 * Creates admin product using the validated inputs supplied by the caller.
 */
export const createAdminProduct = (data) => request("/admin/products", { method: "POST", body: JSON.stringify(data) });
/**
 * Updates admin product while preserving the surrounding domain invariants.
 */
export const updateAdminProduct = (id, data) => request(`/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(data) });
/**
 * Removes admin product from the current workflow.
 */
export const deleteAdminProduct = (id) => request(`/admin/products/${id}`, { method: "DELETE" });

/**
 * Loads admin posts data for the current flow.
 */
export const getAdminPosts = (params) => request(`/admin/posts${qs(params)}`);
/**
 * Creates admin post using the validated inputs supplied by the caller.
 */
export const createAdminPost = (data) => request("/admin/posts", { method: "POST", body: JSON.stringify(data) });
/**
 * Updates admin post while preserving the surrounding domain invariants.
 */
export const updateAdminPost = (id, data) => request(`/admin/posts/${id}`, { method: "PATCH", body: JSON.stringify(data) });
/**
 * Removes admin post from the current workflow.
 */
export const deleteAdminPost = (id) => request(`/admin/posts/${id}`, { method: "DELETE" });

/**
 * Loads admin messages data for the current flow.
 */
export const getAdminMessages = (params) => request(`/admin/messages${qs(params)}`);
/**
 * Updates admin message while preserving the surrounding domain invariants.
 */
export const updateAdminMessage = (id, status) => request(`/admin/messages/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
/**
 * Removes admin message from the current workflow.
 */
export const deleteAdminMessage = (id) => request(`/admin/messages/${id}`, { method: "DELETE" });

/**
 * Loads admin leads data for the current flow.
 */
export const getAdminLeads = (params) => request(`/admin/leads${qs(params)}`);
/**
 * Updates admin lead while preserving the surrounding domain invariants.
 */
export const updateAdminLead = (id, status) => request(`/admin/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
/**
 * Removes admin lead from the current workflow.
 */
export const deleteAdminLead = (id) => request(`/admin/leads/${id}`, { method: "DELETE" });

/**
 * Loads admin settings data for the current flow.
 */
export const getAdminSettings = () => request("/admin/settings");
/**
 * Updates admin profile while preserving the surrounding domain invariants.
 */
export const updateAdminProfile = (data) => request("/admin/settings/profile", { method: "PATCH", body: JSON.stringify(data) });
/**
 * Updates admin password while preserving the surrounding domain invariants.
 */
export const updateAdminPassword = (data) => request("/admin/settings/password", { method: "PATCH", body: JSON.stringify(data) });


/**
 * Loads admin coupons data for the current flow.
 */
export const getAdminCoupons = (params) => request(`/admin/coupons${qs(params)}`);
/**
 * Creates admin coupon using the validated inputs supplied by the caller.
 */
export const createAdminCoupon = (data) => request("/admin/coupons", { method: "POST", body: JSON.stringify(data) });
/**
 * Updates admin coupon while preserving the surrounding domain invariants.
 */
export const updateAdminCoupon = (id, data) => request(`/admin/coupons/${id}`, { method: "PATCH", body: JSON.stringify(data) });
/**
 * Removes admin coupon from the current workflow.
 */
export const deleteAdminCoupon = (id) => request(`/admin/coupons/${id}`, { method: "DELETE" });

/**
 * Loads admin commerce settings data for the current flow.
 */
export const getAdminCommerceSettings = () => request("/admin/commerce-settings");
/**
 * Updates admin commerce settings while preserving the surrounding domain invariants.
 */
export const updateAdminCommerceSettings = (data) => request("/admin/commerce-settings", { method: "PATCH", body: JSON.stringify(data) });

/**
 * Loads admin analytics data for the current flow.
 */
export const getAdminAnalytics = (days = 30) => request(`/admin/analytics?days=${encodeURIComponent(days)}`);

/** Review moderation APIs. */
export const getAdminReviews = (params) => request(`/admin/reviews${qs(params)}`);
export const updateAdminReview = (type, id, status) => request(`/admin/reviews/${type}/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
export const deleteAdminReview = (type, id) => request(`/admin/reviews/${type}/${id}`, { method: "DELETE" });
