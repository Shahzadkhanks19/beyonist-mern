/**
 * Vercel production entry point for the Beyonist API.
 *
 * The local development server remains `src/server.js`. Vercel invokes this
 * module as a Node Function, so it connects MongoDB during module startup,
 * mounts the existing Express app unchanged, and exports the underlying HTTP
 * server so Socket.IO can share the same endpoint.
 */

import mongoose from "mongoose";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

import app from "../src/app.js";
import { validateProductionSecurityConfig, corsOptions } from "../src/middleware/security.js";
import { resolveAdminSession } from "../src/services/adminSession.js";
import { setRealtimeServer } from "../src/services/realtime.js";

validateProductionSecurityConfig();
mongoose.set("strictQuery", true);

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is missing");
}

/** Reuse an existing Mongoose connection inside a warm Vercel Function. */
async function ensureDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 20,
  });
}

await ensureDatabase();

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: corsOptions(),
  transports: ["websocket", "polling"],
});

io.use(async (socket, next) => {
  try {
    const resolved = await resolveAdminSession(socket.request, { touch: false });
    if (!resolved?.admin) return next(new Error("ADMIN_AUTH_REQUIRED"));
    socket.data.adminId = String(resolved.admin._id);
    return next();
  } catch {
    return next(new Error("ADMIN_AUTH_REQUIRED"));
  }
});

io.on("connection", (socket) => {
  socket.join("admins");
});

setRealtimeServer(io);

export default httpServer;
