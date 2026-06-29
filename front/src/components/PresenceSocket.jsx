"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { io } from "socket.io-client";

// presence socket sauf sur auth page
const AUTH_PAGES = ["/login", "/register", "/"];

export default function PresenceSocket() {
  const pathname = usePathname();
  const socketRef = useRef(null);

  // Create the socket
  useEffect(() => {
    const socket = io(`https://${window.location.hostname}:8443/presence`, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      autoConnect: false,
    });

    let authRetry = false;
    socket.on("connect", () => {
      authRetry = false;
    });
    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect" && !authRetry) {
        authRetry = true;
        fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
          .then((r) => {
            if (r.ok) socket.connect();
          })
          .catch(() => {});
      }
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // disconnect on auth pages et connect on others
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    if (AUTH_PAGES.includes(pathname)) {
      if (s.connected) s.disconnect();
    } else if (!s.connected) {
      s.connect();
    }
  }, [pathname]);

  return null;
}
