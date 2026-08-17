/**
 * Maintenance script for reset admin. Intended for explicit development/administrative execution rather than normal request handling.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import AdminSession from "../models/AdminSession.js";
import AdminPasswordResetToken from "../models/AdminPasswordResetToken.js";
import { hashPassword } from "../services/passwordService.js";

dotenv.config();

/**
 * Implements the run operation used by this module.
 */
async function run() {
  const name = String(process.env.ADMIN_NAME || "Beyonist Administrator").trim();
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing.");
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }

  if (password.length < 10 || password.length > 128) {
    throw new Error("ADMIN_PASSWORD must contain 10 to 128 characters.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  let admin = await Admin.findOne({ email }).select("+passwordHash");

  if (!admin) {
    admin = await Admin.create({
      name,
      email,
      passwordHash: hashPassword(password),
      role: "super_admin",
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      passwordChangedAt: new Date(),
    });

    console.log(`Created new Beyonist super admin: ${email}`);
  } else {
    admin.name = name || admin.name;
    admin.passwordHash = hashPassword(password);
    admin.role = "super_admin";
    admin.isActive = true;
    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;
    admin.passwordChangedAt = new Date();
    await admin.save();

    console.log(`Reset existing Beyonist admin credentials: ${email}`);
  }

  await Promise.all([
    AdminSession.deleteMany({ admin: admin._id }),
    AdminPasswordResetToken.deleteMany({ admin: admin._id }),
  ]);

  console.log("Admin is active and unlocked.");
  console.log("All previous admin sessions and reset tokens were revoked.");
  console.log("You can now sign in with ADMIN_EMAIL and ADMIN_PASSWORD.");
  console.log("Remove ADMIN_PASSWORD from .env after successful login.");
}

run()
  .catch((error) => {
    console.error("[reset-admin]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
