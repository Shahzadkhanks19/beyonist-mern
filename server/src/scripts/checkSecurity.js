/**
 * Maintenance script for check security. Intended for explicit development/administrative execution rather than normal request handling.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

const checks = [
  ["src/app.js", /requireTrustedOrigin/, "trusted-origin guard"],
  ["src/app.js", /createRateLimiter/, "rate limiting"],
  ["src/app.js", /securityHeaders/, "security headers"],
  ["src/app.js", /rejectUnsafeInput/, "NoSQL unsafe-key rejection"],
  ["src/services/adminSession.js", /HttpOnly/, "admin HttpOnly cookie"],
  ["src/services/adminSession.js", /SameSite=Strict/, "admin SameSite cookie"],
  ["src/services/customerSession.js", /HttpOnly/, "customer HttpOnly cookie"],
  ["src/routes/orderRoutes.js", /orderNumber, email/, "order tracking email verification"],
  ["src/routes/adminManagementRoutes.js", /router\.use\(requireAdmin\)/, "admin route authentication"],
];

let failed = false;
for (const [relative, pattern, label] of checks) {
  const file = path.join(root, relative);
  const content = fs.readFileSync(file, "utf8");
  if (!pattern.test(content)) {
    failed = true;
    console.error(`FAIL ${label} (${relative})`);
  } else {
    console.log(`OK   ${label}`);
  }
}

const orderRoutes = fs.readFileSync(path.join(root, "src/routes/orderRoutes.js"), "utf8");
if (/ORDER_ADMIN_KEY|x-order-admin-key/.test(orderRoutes)) {
  failed = true;
  console.error("FAIL legacy static order-admin key endpoint still exists");
} else {
  console.log("OK   legacy static order-admin key removed");
}

const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
if (/^ADMIN_PASSWORD=\S{16,}$/m.test(envExample) && !/replace-with/.test(envExample)) {
  failed = true;
  console.error("FAIL .env.example appears to contain a real administrator password");
} else {
  console.log("OK   .env.example contains placeholders only");
}

if (failed) process.exit(1);
console.log("\nBeyonist security smoke check passed.");
