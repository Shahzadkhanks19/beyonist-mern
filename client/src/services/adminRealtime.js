/** Authenticated Socket.IO client used by the admin shell for realtime commerce events. */
import { io } from "socket.io-client";
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
let socket;
export function connectAdminRealtime() {
  if (socket) return socket;
  socket = io(API_BASE, { withCredentials: true, transports: ["websocket", "polling"], autoConnect: true });
  ["order:created", "order:updated", "review:created", "review:updated"].forEach((event) => {
    socket.on(event, (payload) => window.dispatchEvent(new CustomEvent("beyonist:admin-realtime", { detail: { event, payload } })));
  });
  return socket;
}
export function disconnectAdminRealtime() { socket?.disconnect(); socket = undefined; }
