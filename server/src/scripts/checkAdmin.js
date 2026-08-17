/**
 * Maintenance script for check admin. Intended for explicit development/administrative execution rather than normal request handling.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

dotenv.config();

/**
 * Implements the run operation used by this module.
 */
async function run() {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing.");
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const admin = await Admin.findOne({ email }).lean();

  if (!admin) {
    console.log(`NO ADMIN FOUND for: ${email}`);
    console.log("Run: npm run reset:admin");
    return;
  }

  console.log("ADMIN FOUND");
  console.log(`Email: ${admin.email}`);
  console.log(`Name: ${admin.name}`);
  console.log(`Role: ${admin.role}`);
  console.log(`Active: ${admin.isActive ? "YES" : "NO"}`);
  console.log(`Locked until: ${admin.lockedUntil ? new Date(admin.lockedUntil).toISOString() : "NOT LOCKED"}`);
  console.log(`Failed attempts: ${admin.failedLoginAttempts || 0}`);
  console.log(`Last login: ${admin.lastLoginAt ? new Date(admin.lastLoginAt).toISOString() : "NEVER"}`);
}

run()
  .catch((error) => {
    console.error("[check-admin]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
