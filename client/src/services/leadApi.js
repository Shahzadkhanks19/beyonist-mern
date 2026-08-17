/**
 * Client API service for lead api. Centralizes HTTP requests so components do not duplicate endpoint, credential, and error-handling logic.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

/**
 * Implements the capture lead operation used by this module.
 */
export async function captureLead(data) {
  const response = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Unable to save your subscription.");
  }

  return payload;
}
