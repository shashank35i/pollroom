import { io } from "socket.io-client";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export const socket = io(API_BASE || window.location.origin, {
  path: "/socket.io",
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: true,
});
