/**
 * Maintenance script for seed site pages. Intended for explicit development/administrative execution rather than normal request handling.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import "dotenv/config";
import mongoose from "mongoose";
import SitePage from "../models/SitePage.js";
import { sitePageSeed } from "../data/sitePageSeed.js";

/**
 * Implements the run operation used by this module.
 */
async function run() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");

  await mongoose.connect(process.env.MONGODB_URI);

  for (const page of sitePageSeed) {
    await SitePage.findOneAndUpdate(
      { slug: page.slug },
      { $set: page },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${sitePageSeed.length} Beyonist site page.`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
