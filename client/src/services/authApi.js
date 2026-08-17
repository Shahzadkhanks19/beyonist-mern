/**
 * Client API service for auth api. Centralizes HTTP requests so components do not duplicate endpoint, credential, and error-handling logic.
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

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "Unable to complete this account request.");
    error.code = payload.code;
    throw error;
  }
  return payload;
}

/**
 * Implements the signup customer operation used by this module.
 */
export function signupCustomer(data) {
  return request("/auth/signup", { method: "POST", body: JSON.stringify(data) });
}

/**
 * Implements the login customer operation used by this module.
 */
export function loginCustomer(data) {
  return request("/auth/login", { method: "POST", body: JSON.stringify(data) });
}

/**
 * Implements the logout customer operation used by this module.
 */
export function logoutCustomer() {
  return request("/auth/logout", { method: "POST", body: JSON.stringify({}) });
}

/**
 * Loads me data for the current flow.
 */
export function getMe() {
  return request("/auth/me");
}


/**
 * Implements the forgot password operation used by this module.
 */
export function forgotPassword(email) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Implements the reset password operation used by this module.
 */
export function resetPassword(token, newPassword) {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}
