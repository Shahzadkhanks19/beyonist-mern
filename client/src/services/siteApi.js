/**
 * Client API service for site api. Centralizes HTTP requests so components do not duplicate endpoint, credential, and error-handling logic.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

/**
 * Loads site page data for the current flow.
 */
export async function getSitePage(slug) {
  const response = await fetch(`${API_BASE}/site-pages/${encodeURIComponent(slug)}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Unable to load page content.");
  return payload;
}
