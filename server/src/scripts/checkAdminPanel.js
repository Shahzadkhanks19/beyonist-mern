/**
 * Maintenance script for check admin panel. Intended for explicit development/administrative execution rather than normal request handling.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import dotenv from "dotenv";

dotenv.config();

const modules = [
  "../models/Admin.js",
  "../models/AdminSession.js",
  "../models/Order.js",
  "../models/Customer.js",
  "../models/Product.js",
  "../models/Post.js",
  "../models/ContactMessage.js",
  "../models/Lead.js",
  "../models/Coupon.js",
  "../models/StoreSettings.js",
  "../services/adminSession.js",
  "../services/pricingService.js",
  "../routes/adminAuthRoutes.js",
  "../routes/adminManagementRoutes.js",
  "../routes/commerceRoutes.js",
];

/**
 * Implements the run operation used by this module.
 */
async function run() {
  for (const modulePath of modules) {
    await import(modulePath);
    console.log(`OK ${modulePath}`);
  }

  console.log("");
  console.log("Admin panel module smoke check passed.");
  console.log("This check does not connect to or modify MongoDB.");
}

run().catch((error) => {
  console.error("Admin panel smoke check failed.");
  console.error(error);
  process.exitCode = 1;
});
