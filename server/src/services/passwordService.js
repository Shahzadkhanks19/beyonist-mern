/**
 * Server service for password service. Encapsulates reusable business/security logic outside route handlers.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import crypto from "node:crypto";
import { promisify } from "node:util";

const PASSWORD_KEYLEN = 64;
const scryptAsync = promisify(crypto.scrypt);

/**
 * Implements the split stored operation used by this module.
 */
function splitStored(stored) {
  const [salt, expectedHex] = String(stored || "").split(":");
  if (!salt || !expectedHex || !/^[a-f0-9]+$/i.test(expectedHex)) return null;
  const expected = Buffer.from(expectedHex, "hex");
  if (!expected.length) return null;
  return { salt, expected };
}

// Kept for one-time CLI bootstrap/recovery scripts.
/**
 * Performs the hash password operation used by the authentication/security flow.
 */
export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(String(password), salt, PASSWORD_KEYLEN).toString("hex");
  return `${salt}:${derived}`;
}

/**
 * Performs the verify password operation used by the authentication/security flow.
 */
export function verifyPassword(password, stored) {
  const parsed = splitStored(stored);
  if (!parsed) return false;
  const actual = crypto.scryptSync(String(password), parsed.salt, parsed.expected.length);
  return parsed.expected.length === actual.length && crypto.timingSafeEqual(parsed.expected, actual);
}

// HTTP request paths use asynchronous scrypt so password work does not block
// the Node.js event loop under concurrent login/reset traffic.
/**
 * Performs the hash password async operation used by the authentication/security flow.
 */
export async function hashPasswordAsync(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = await scryptAsync(String(password), salt, PASSWORD_KEYLEN);
  return `${salt}:${Buffer.from(derived).toString("hex")}`;
}

/**
 * Performs the verify password async operation used by the authentication/security flow.
 */
export async function verifyPasswordAsync(password, stored) {
  const parsed = splitStored(stored);
  if (!parsed) return false;
  const actual = Buffer.from(await scryptAsync(String(password), parsed.salt, parsed.expected.length));
  return parsed.expected.length === actual.length && crypto.timingSafeEqual(parsed.expected, actual);
}
