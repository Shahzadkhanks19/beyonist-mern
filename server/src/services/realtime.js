/** Server-side Socket.IO bridge. Routes can emit admin events without importing the HTTP server. */
let ioInstance = null;
export function setRealtimeServer(io) { ioInstance = io; }
export function emitAdmin(event, payload) { ioInstance?.to("admins").emit(event, payload); }
