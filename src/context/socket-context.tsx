"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3001",  
      {
        transports: ["websocket"],
        withCredentials: true,
      }
    );

    setSocket(socketInstance);

    console.log("✅ Socket connected:", socketInstance.id);
    console.log("Connecting to:", process.env.NEXT_PUBLIC_HOST_URL);

    socketInstance.on("connect", () => {
      console.log("🔌 Socket reconnected:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
