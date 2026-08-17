/**
 * Server service for admin session. Encapsulates reusable business/security logic outside route handlers.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import crypto from "node:crypto";
import Admin from "../models/Admin.js";
import AdminSession from "../models/AdminSession.js";

export const ADMIN_COOKIE_NAME = "beyonist_admin_session";
const ADMIN_SESSION_HOURS = 12;
const SESSION_TOUCH_MINUTES = 10;

/**
 * Implements the parse cookies operation used by this module.
 */
function parseCookies(header = "") {
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
 * Performs the hash admin session token operation used by the authentication/security flow.
 */
export function hashAdminSessionToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Implements the public admin operation used by this module.
 */
export function publicAdmin(admin) {
  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    lastLoginAt: admin.lastLoginAt,
  };
}

/**
 * Implements the set admin cookie operation used by this module.
 */
function setAdminCookie(res, token) {
  const secure = process.env.NODE_ENV === "production";
  const maxAge = ADMIN_SESSION_HOURS * 60 * 60;
  const attributes = [
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${maxAge}`,
    `Expires=${new Date(Date.now() + maxAge * 1000).toUTCString()}`,
    "Priority=High",
  ];
  if (secure) attributes.push("Secure");
  res.setHeader("Set-Cookie", `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; ${attributes.join("; ")}`);
}

/**
 * Implements the clear admin cookie operation used by this module.
 */
export function clearAdminCookie(res) {
  const secure = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Priority=High${secure ? "; Secure" : ""}`
  );
}

/**
 * Creates admin session using the validated inputs supplied by the caller.
 */
export async function createAdminSession(adminId, req, res) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_HOURS * 60 * 60 * 1000);

  await AdminSession.create({
    admin: adminId,
    tokenHash: hashAdminSessionToken(token),
    expiresAt,
    userAgent: String(req.headers["user-agent"] || "").slice(0, 500),
    ipAddress: String(req.ip || req.socket?.remoteAddress || "").slice(0, 80),
  });

  setAdminCookie(res, token);
  return token;
}

/**
 * Implements the resolve admin session operation used by this module.
 */
export async function resolveAdminSession(req, { touch = true } = {}) {
  const token = parseCookies(req.headers.cookie || "")[ADMIN_COOKIE_NAME];
  if (!token || token.length > 200) return null;

  const session = await AdminSession.findOne({
    tokenHash: hashAdminSessionToken(token),
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;

  const admin = await Admin.findOne({ _id: session.admin, isActive: true });
  if (!admin) return null;

  if (touch) {
    const now = Date.now();
    const lastSeen = session.lastSeenAt?.getTime?.() || 0;
    if (now - lastSeen >= SESSION_TOUCH_MINUTES * 60 * 1000) {
      session.lastSeenAt = new Date(now);
      await session.save();
    }
  }

  return { admin, session, token };
}

/**
 * Implements the require admin operation used by this module.
 */
export async function requireAdmin(req, res, next) {
  try {
    const resolved = await resolveAdminSession(req);
    if (!resolved) {
      clearAdminCookie(res);
      return res.status(401).json({ success: false, message: "Admin authentication required." });
    }
    req.admin = resolved.admin;
    req.adminSession = resolved.session;
    return next();
  } catch (error) {
    return next(error);
  }
}
