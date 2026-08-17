/**
 * Maintenance script for seed admin. Intended for explicit development/administrative execution rather than normal request handling.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import { hashPassword } from "../services/passwordService.js";

dotenv.config();

/**
 * Implements the run operation used by this module.
 */
async function run() {
  const name = String(process.env.ADMIN_NAME || "Beyonist Administrator").trim();
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");

  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("ADMIN_EMAIL must be a valid email address.");
  if (password.length < 10 || password.length > 128) throw new Error("ADMIN_PASSWORD must contain 10 to 128 characters.");

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  await Admin.create({
    name,
    email,
    passwordHash: hashPassword(password),
    role: "super_admin",
  });

  console.log(`Created Beyonist super admin: ${email}`);
  console.log("Remove ADMIN_PASSWORD from your environment after this one-time seed.");
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
