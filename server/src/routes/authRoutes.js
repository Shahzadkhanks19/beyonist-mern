/**
 * Express router for auth routes. Defines HTTP endpoints, authorization boundaries, validation, and orchestration for this API area.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import crypto from "node:crypto";
import { Router } from "express";
import Customer from "../models/Customer.js";
import CustomerSession from "../models/CustomerSession.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { hashPasswordAsync, verifyPasswordAsync } from "../services/passwordService.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import {
  CUSTOMER_COOKIE_NAME,
  clearSessionCookie,
  createCustomerSession,
  hashSessionToken,
  parseCookies,
  publicCustomer,
  resolveCustomerSession,
} from "../services/customerSession.js";

const router = Router();
const MAX_FAILED_LOGINS = 8;
const LOCK_MINUTES = 15;
const DUMMY_PASSWORD_HASH = await hashPasswordAsync("Beyonist-dummy-password-not-a-real-account");
// API: POST /signup — handles the signup request and returns a normalized JSON response.
router.post("/signup", async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || "").replace(/\D/g, "").slice(-10);
    const password = String(req.body?.password || "");
    const marketingOptIn = Boolean(req.body?.marketingOptIn);

    if (name.length < 2) return res.status(400).json({ success: false, message: "Please enter your name." });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ success: false, message: "Please enter a valid Indian mobile number." });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ success: false, message: "Password must be between 8 and 128 characters." });

    if (await Customer.exists({ $or: [{ email }, { previousEmails: email }] })) {
      return res.status(409).json({ success: false, code: "EMAIL_EXISTS", message: "An account already exists for this email." });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      passwordHash: await hashPasswordAsync(password),
      marketingOptIn,
    });

    await createCustomerSession(customer._id, res, req);
    return res.status(201).json({ success: true, data: publicCustomer(customer) });
  } catch (error) {
    return next(error);
  }
});

// API: POST /login — handles the login request and returns a normalized JSON response.

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!/^\S+@\S+\.\S+$/.test(email) || !password || password.length > 128) {
      await verifyPasswordAsync(password || "invalid", DUMMY_PASSWORD_HASH);
      return res.status(401).json({ success: false, code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." });
    }

    const customer = await Customer.findOne({ email, isActive: true }).select("+passwordHash");
    const now = new Date();

    if (customer?.lockedUntil && customer.lockedUntil > now) {
      return res.status(429).json({ success: false, code: "ACCOUNT_LOCKED", message: "Too many failed attempts. Try again in a few minutes or reset your password." });
    }

    const passwordMatches = customer
      ? await verifyPasswordAsync(password, customer.passwordHash)
      : await verifyPasswordAsync(password, DUMMY_PASSWORD_HASH);

    if (!customer || !passwordMatches) {
      if (customer) {
        customer.failedLoginAttempts = Number(customer.failedLoginAttempts || 0) + 1;
        if (customer.failedLoginAttempts >= MAX_FAILED_LOGINS) {
          customer.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
          customer.failedLoginAttempts = 0;
        }
        await customer.save();
      }
      return res.status(401).json({ success: false, code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." });
    }

    customer.failedLoginAttempts = 0;
    customer.lockedUntil = null;
    customer.lastLoginAt = new Date();
    await customer.save();

    await CustomerSession.deleteMany({ customer: customer._id, expiresAt: { $lte: new Date() } });
    await createCustomerSession(customer._id, res, req);

    return res.json({ success: true, data: publicCustomer(customer) });
  } catch (error) {
    return next(error);
  }
});

// API: POST /logout — handles the logout request and returns a normalized JSON response.

router.post("/logout", async (req, res, next) => {
  try {
    const token = parseCookies(req.headers.cookie || "")[CUSTOMER_COOKIE_NAME];
    if (token) await CustomerSession.deleteOne({ tokenHash: hashSessionToken(token) });
    clearSessionCookie(res);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});


// API: POST /forgot-password — handles the forgot password request and returns a normalized JSON response.


router.post("/forgot-password", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    const genericResponse = {
      success: true,
      message: "If a Beyonist account exists for that email, a reset link has been sent.",
    };

    if (!/^\S+@\S+\.\S+$/.test(email)) return res.json(genericResponse);

    const customer = await Customer.findOne({ email, isActive: true });
    if (!customer) return res.json(genericResponse);

    await PasswordResetToken.deleteMany({
      customer: customer._id,
      $or: [
        { usedAt: null },
        { expiresAt: { $lte: new Date() } },
      ],
    });

    const rawToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await PasswordResetToken.create({
      customer: customer._id,
      tokenHash,
      expiresAt,
    });

    const delivery = await sendPasswordResetEmail(customer, rawToken);
    if (!delivery.sent) {
      console.warn("[auth] Password reset email was not sent:", delivery.reason || "unknown");
    }

    return res.json(genericResponse);
  } catch (error) {
    return next(error);
  }
});

// API: POST /reset-password — handles the reset password request and returns a normalized JSON response.

router.post("/reset-password", async (req, res, next) => {
  try {
    const rawToken = String(req.body?.token || "").trim();
    const newPassword = String(req.body?.newPassword || "");

    if (!rawToken) {
      return res.status(400).json({ success: false, message: "The password reset link is invalid." });
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({ success: false, message: "New password must be between 8 and 128 characters." });
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const reset = await PasswordResetToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      return res.status(400).json({
        success: false,
        code: "RESET_LINK_INVALID",
        message: "This reset link is invalid, expired, or has already been used.",
      });
    }

    const customer = await Customer.findOne({ _id: reset.customer, isActive: true }).select("+passwordHash");
    if (!customer) {
      return res.status(400).json({ success: false, message: "This reset link is no longer valid." });
    }

    if (await verifyPasswordAsync(newPassword, customer.passwordHash)) {
      return res.status(400).json({ success: false, message: "Choose a password different from your current password." });
    }

    const usedAt = new Date();
    const claimed = await PasswordResetToken.findOneAndUpdate(
      { _id: reset._id, usedAt: null, expiresAt: { $gt: usedAt } },
      { $set: { usedAt } },
      { returnDocument: "after" }
    );
    if (!claimed) {
      return res.status(400).json({ success: false, code: "RESET_LINK_INVALID", message: "This reset link is invalid, expired, or has already been used." });
    }

    customer.passwordHash = await hashPasswordAsync(newPassword);
    customer.passwordChangedAt = usedAt;
    customer.failedLoginAttempts = 0;
    customer.lockedUntil = null;
    await customer.save();

    // Invalidate all existing customer sessions after a password reset.
    await CustomerSession.deleteMany({ customer: customer._id });

    // Invalidate any other outstanding reset links.
    await PasswordResetToken.updateMany(
      { customer: customer._id, _id: { $ne: reset._id }, usedAt: null },
      { $set: { usedAt: new Date() } }
    );

    return res.json({
      success: true,
      message: "Your password has been reset. You can now sign in with the new password.",
    });
  } catch (error) {
    return next(error);
  }
});

// API: GET /me — handles the me request and returns a normalized JSON response.

router.get("/me", async (req, res, next) => {
  try {
    const resolved = await resolveCustomerSession(req);
    if (!resolved) return res.json({ success: true, data: null, authenticated: false });
    return res.json({ success: true, data: publicCustomer(resolved.customer), authenticated: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
