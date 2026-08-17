/**
 * Maintenance script for seed posts. Intended for explicit development/administrative execution rather than normal request handling.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import "dotenv/config";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import { postSeed } from "../data/postSeed.js";

/**
 * Implements the run operation used by this module.
 */
async function run() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");

  await mongoose.connect(process.env.MONGODB_URI);

  for (const post of postSeed) {
    await Post.findOneAndUpdate(
      { slug: post.slug },
      { $set: post },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${postSeed.length} Beyonist Edit posts.`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
