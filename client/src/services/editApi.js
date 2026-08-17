/**
 * Client API service for edit api. Centralizes HTTP requests so components do not duplicate endpoint, credential, and error-handling logic.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { normalizeCmsMedia } from "../utils/productImagePath.js";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

/**
 * Implements the request operation used by this module.
 */
async function request(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Unable to load The Edit.");
  return normalizeCmsMedia(payload);
}

/**
 * Loads edit posts data for the current flow.
 */
export function getEditPosts() {
  return request("/posts");
}

/**
 * Loads edit post data for the current flow.
 */
export function getEditPost(slug) {
  return request(`/posts/${encodeURIComponent(slug)}`);
}
