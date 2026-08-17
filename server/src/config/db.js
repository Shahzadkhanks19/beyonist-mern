/**
 * Server configuration for db. Centralizes infrastructure setup shared by the API runtime.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import mongoose from "mongoose";
/**
 * Implements the connect database operation used by this module.
 */
export async function connectDatabase(){
  if(!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
}
