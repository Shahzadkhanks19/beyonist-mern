/**
 * Server service for customer session. Encapsulates reusable business/security logic outside route handlers.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import crypto from "node:crypto";
import Customer from "../models/Customer.js";
import CustomerSession from "../models/CustomerSession.js";

export const CUSTOMER_COOKIE_NAME = "beyonist_customer_session";
const SESSION_DAYS = 30;
const SESSION_TOUCH_MINUTES = 15;

/**
 * Implements the parse cookies operation used by this module.
 */
export function parseCookies(header = "") {
  return header.split(";").reduce((cookies, part) => {
    const index = part.indexOf("=");
    if (index === -1) return cookies;
    const key = part.slice(0, index).trim();
    const raw = part.slice(index + 1).trim();
    if (!key) return cookies;
    try {
      cookies[key] = decodeURIComponent(raw);
    } catch {
      cookies[key] = raw;
    }
    return cookies;
  }, {});
}

/**
 * Performs the hash session token operation used by the authentication/security flow.
 */
export function hashSessionToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Implements the public customer operation used by this module.
 */
export function publicCustomer(customer) {
  return {
    id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    membershipTier: customer.membershipTier,
    offerAccess: customer.offerAccess,
    discountAccess: customer.discountAccess,
    rewardPoints: customer.rewardPoints,
    marketingOptIn: customer.marketingOptIn,
    wishlist: Array.isArray(customer.wishlist) ? customer.wishlist : [],
  };
}

/**
 * Implements the cookie attributes operation used by this module.
 */
function cookieAttributes(maxAge) {
  const secure = process.env.NODE_ENV === "production";
  const attributes = [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    `Expires=${new Date(Date.now() + maxAge * 1000).toUTCString()}`,
    "Priority=High",
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
}

/**
 * Implements the set session cookie operation used by this module.
 */
export function setSessionCookie(res, token) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  res.setHeader("Set-Cookie", `${CUSTOMER_COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieAttributes(maxAge)}`);
}

/**
 * Implements the clear session cookie operation used by this module.
 */
export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `${CUSTOMER_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Priority=High${secure ? "; Secure" : ""}`
  );
}

/**
 * Creates customer session using the validated inputs supplied by the caller.
 */
export async function createCustomerSession(customerId, res, req = null) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await CustomerSession.create({
    customer: customerId,
    tokenHash: hashSessionToken(token),
    expiresAt,
    userAgent: String(req?.headers?.["user-agent"] || "").slice(0, 500),
    ipAddress: String(req?.ip || req?.socket?.remoteAddress || "").slice(0, 80),
  });

  setSessionCookie(res, token);
  return token;
}

/**
 * Implements the resolve customer session operation used by this module.
 */
export async function resolveCustomerSession(req, { touch = true } = {}) {
  const token = parseCookies(req.headers.cookie || "")[CUSTOMER_COOKIE_NAME];
  if (!token || token.length > 200) return null;

  const session = await CustomerSession.findOne({
    tokenHash: hashSessionToken(token),
    expiresAt: { $gt: new Date() },
  });

  if (!session) return null;

  const customer = await Customer.findOne({ _id: session.customer, isActive: true });
  if (!customer) return null;

  if (touch) {
    const now = Date.now();
    const lastSeen = session.lastSeenAt?.getTime?.() || 0;
    if (now - lastSeen >= SESSION_TOUCH_MINUTES * 60 * 1000) {
      session.lastSeenAt = new Date(now);
      await session.save();
    }
  }

  return { customer, session, token };
}

/**
 * Implements the require customer operation used by this module.
 */
export async function requireCustomer(req, res, next) {
  try {
    const resolved = await resolveCustomerSession(req);
    if (!resolved) {
      clearSessionCookie(res);
      return res.status(401).json({ success: false, message: "Please sign in to continue." });
    }
    req.customer = resolved.customer;
    req.customerSession = resolved.session;
    return next();
  } catch (error) {
    return next(error);
  }
}
