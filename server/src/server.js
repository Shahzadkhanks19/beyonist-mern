/**
 * API process entry point. Loads environment configuration, connects infrastructure, and starts the Express HTTP server.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const { validateProductionSecurityConfig, corsOptions } = await import("./middleware/security.js");
const { resolveAdminSession } = await import("./services/adminSession.js");
const { setRealtimeServer } = await import("./services/realtime.js");
const { default: app } = await import("./app.js");

const PORT = Number(process.env.PORT || 5000);

/**
 * Implements the start operation used by this module.
 */
async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");
  validateProductionSecurityConfig();

  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 20,
  });

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

  httpServer.listen(PORT, () => console.log(`Beyonist API running on http://localhost:${PORT}`));
}

start().catch((error) => {
  console.error("[startup]", error?.stack || error);
  process.exit(1);
});
