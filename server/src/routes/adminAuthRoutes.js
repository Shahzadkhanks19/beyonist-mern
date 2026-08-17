/**
 * Express router for admin auth routes. Defines HTTP endpoints, authorization boundaries, validation, and orchestration for this API area.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import crypto from "node:crypto";
import { Router } from "express";
import Admin from "../models/Admin.js";
import AdminSession from "../models/AdminSession.js";
import AdminPasswordResetToken from "../models/AdminPasswordResetToken.js";
import { hashPasswordAsync, verifyPasswordAsync } from "../services/passwordService.js";
import { sendAdminPasswordResetEmail } from "../services/emailService.js";
import {
  ADMIN_COOKIE_NAME,
  clearAdminCookie,
  createAdminSession,
  hashAdminSessionToken,
  publicAdmin,
  resolveAdminSession,
} from "../services/adminSession.js";

const router = Router();
const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const DUMMY_PASSWORD_HASH = await hashPasswordAsync("Beyonist-admin-dummy-password-not-a-real-account");

/**
 * Implements the read cookie operation used by this module.
 */
function readCookie(header = "", name) {
  return header.split(";").reduce((value, part) => {
    if (value) return value;
    const index = part.indexOf("=");
    if (index === -1) return value;
    const key = part.slice(0, index).trim();
    return key === name ? decodeURIComponent(part.slice(index + 1).trim()) : value;
  }, "");
}

// API: POST /login — handles the login request and returns a normalized JSON response.

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!/^\S+@\S+\.\S+$/.test(email) || !password || password.length > 128) {
      await verifyPasswordAsync(password || "invalid", DUMMY_PASSWORD_HASH);
      return res.status(401).json({ success: false, code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." });
    }

    const admin = await Admin.findOne({ email, isActive: true }).select("+passwordHash");
    const now = new Date();

    if (admin?.lockedUntil && admin.lockedUntil > now) {
      return res.status(429).json({
        success: false,
        code: "ADMIN_LOCKED",
        message: "Too many failed attempts. Try again in a few minutes or reset your password.",
      });
    }

    const passwordMatches = admin
      ? await verifyPasswordAsync(password, admin.passwordHash)
      : await verifyPasswordAsync(password, DUMMY_PASSWORD_HASH);

    if (!admin || !passwordMatches) {
      if (admin) {
        admin.failedLoginAttempts += 1;
        if (admin.failedLoginAttempts >= MAX_FAILED_LOGINS) {
          admin.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
          admin.failedLoginAttempts = 0;
        }
        await admin.save();
      }
      return res.status(401).json({ success: false, code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." });
    }

    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;
    admin.lastLoginAt = new Date();
    await admin.save();

    await AdminSession.deleteMany({ admin: admin._id, expiresAt: { $lte: new Date() } });
    await createAdminSession(admin._id, req, res);

    return res.json({ success: true, data: publicAdmin(admin) });
  } catch (error) {
    return next(error);
  }
});

// API: POST /logout — handles the logout request and returns a normalized JSON response.

router.post("/logout", async (req, res, next) => {
  try {
    const token = readCookie(req.headers.cookie || "", ADMIN_COOKIE_NAME);
    if (token) await AdminSession.deleteOne({ tokenHash: hashAdminSessionToken(token) });
    clearAdminCookie(res);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

// API: GET /me — handles the me request and returns a normalized JSON response.

router.get("/me", async (req, res, next) => {
  try {
    const resolved = await resolveAdminSession(req);
    if (!resolved) return res.status(401).json({ success: false, message: "Not signed in as an administrator." });
    return res.json({ success: true, data: publicAdmin(resolved.admin) });
  } catch (error) {
    return next(error);
  }
});

// API: POST /forgot-password — handles the forgot password request and returns a normalized JSON response.

router.post("/forgot-password", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const generic = {
      success: true,
      message: "If an active administrator exists for that email, a secure reset link has been sent.",
    };

    if (!/^\S+@\S+\.\S+$/.test(email)) return res.json(generic);

    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) return res.json(generic);

    await AdminPasswordResetToken.updateMany(
      { admin: admin._id, usedAt: null },
      { $set: { usedAt: new Date() } }
    );

    const rawToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await AdminPasswordResetToken.create({
      admin: admin._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000),
    });

    const delivery = await sendAdminPasswordResetEmail(admin, rawToken);

    if (!delivery.sent) {
      console.error(
        "[admin-auth] Password reset email was NOT delivered:",
        {
          reason: delivery.reason || "unknown",
          status: delivery.status || null,
          providerMessage: delivery.providerMessage || null,
          recipient: admin.email,
        }
      );

      if (process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_RESET_LINKS === "true") {
        const siteUrl = String(process.env.PUBLIC_SITE_URL || process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
        console.warn("[admin-auth] DEVELOPMENT RESET LINK ENABLED:", `${siteUrl}/admin/reset-password?token=${encodeURIComponent(rawToken)}`);
      }
    } else if (process.env.NODE_ENV !== "production") {
      console.info(
        `[admin-auth] Resend accepted admin reset email for ${admin.email}. Email id: ${delivery.id || "n/a"}`
      );
    }

    return res.json(generic);
  } catch (error) {
    return next(error);
  }
});

// API: POST /reset-password — handles the reset password request and returns a normalized JSON response.

router.post("/reset-password", async (req, res, next) => {
  try {
    const rawToken = String(req.body?.token || "").trim();
    const newPassword = String(req.body?.newPassword || "");

    if (!rawToken) return res.status(400).json({ success: false, message: "The reset link is invalid." });
    if (newPassword.length < 10 || newPassword.length > 128) {
      return res.status(400).json({ success: false, message: "Admin passwords must be between 10 and 128 characters." });
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const reset = await AdminPasswordResetToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      return res.status(400).json({
        success: false,
        code: "RESET_LINK_INVALID",
        message: "This admin reset link is invalid, expired, or already used.",
      });
    }

    const admin = await Admin.findOne({ _id: reset.admin, isActive: true }).select("+passwordHash");
    if (!admin) return res.status(400).json({ success: false, message: "This reset link is no longer valid." });
    if (await verifyPasswordAsync(newPassword, admin.passwordHash)) {
      return res.status(400).json({ success: false, message: "Choose a password different from the current password." });
    }

    const usedAt = new Date();
    const claimed = await AdminPasswordResetToken.findOneAndUpdate(
      { _id: reset._id, usedAt: null, expiresAt: { $gt: usedAt } },
      { $set: { usedAt } },
      { returnDocument: "after" }
    );
    if (!claimed) {
      return res.status(400).json({ success: false, code: "RESET_LINK_INVALID", message: "This admin reset link is invalid, expired, or already used." });
    }

    admin.passwordHash = await hashPasswordAsync(newPassword);
    admin.passwordChangedAt = usedAt;
    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;
    await admin.save();

    await Promise.all([
      AdminSession.deleteMany({ admin: admin._id }),
      AdminPasswordResetToken.updateMany(
        { admin: admin._id, _id: { $ne: reset._id }, usedAt: null },
        { $set: { usedAt } }
      ),
    ]);

    clearAdminCookie(res);
    return res.json({ success: true, message: "Admin password reset successfully. Sign in again with the new password." });
  } catch (error) {
    return next(error);
  }
});

export default router;
