/**
 * Maintenance script for seed products. Intended for explicit development/administrative execution rather than normal request handling.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import "dotenv/config";
import { connectDatabase } from "../config/db.js";
import Product from "../models/Product.js";
import { productSeed } from "../data/productSeed.js";

/**
 * Implements the seed operation used by this module.
 */
async function seed() {
  await connectDatabase();
  await Product.bulkWrite(productSeed.map((product) => ({ updateOne: { filter: { slug: product.slug }, update: { $set: product }, upsert: true } })));
  console.log(`Seeded ${productSeed.length} Beyonist products.`);
  process.exit(0);
}

seed().catch((error) => { console.error(error); process.exit(1); });
