import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@ipl-auction/shared";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }
  return socket;
}

export function connectSocket(token: string): void {
  const s = getSocket();
  if (s.connected) return;

  s.auth = { token };
  s.connect();
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}
