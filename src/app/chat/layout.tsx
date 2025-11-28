"use client";

import { SocketProvider } from "@/context/socket-context";

/**
 * Chat Layout - WebSocket Provider
 *
 * SocketProvider is ONLY needed for chat functionality.
 * By moving it here instead of root layout, we avoid:
 * - Unnecessary WebSocket connections on non-chat pages
 * - Slower compilation times
 * - Network overhead during development
 */
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SocketProvider>{children}</SocketProvider>;
}
