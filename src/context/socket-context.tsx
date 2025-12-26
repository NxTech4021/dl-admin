"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { useSession } from "@/lib/auth-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinThread: (threadId: string) => void;
  leaveThread: (threadId: string) => void;
  sendTyping: (threadId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinThread: () => {},
  leaveThread: () => {},
  sendTyping: () => {},
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    if (!user?.id) return;

    const socketInstance = io(
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
      {
        auth: {
          userId: user.id,
          userName: user.name,
        },
        transports: ["websocket", "polling"],
        withCredentials: true,
        path: "/socket.io/",
      }
    );

    // Connection events
    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error: Error) => {
      console.error("❌ Socket connection error:", error);
      setIsConnected(false);
    });

    // Join user's personal room for notifications
    socketInstance.emit("join_user_room", user.id);

    setSocket(socketInstance);

    return () => {
      console.log("🧹 Cleaning up socket connection");
      socketInstance.disconnect();
    };
  }, [user?.id, user?.name]);

  const joinThread = (threadId: string) => {
    if (socket && isConnected) {
      socket.emit("join_thread", threadId);
      console.log(`📥 Joined thread: ${threadId}`);
    }
  };

  const leaveThread = (threadId: string) => {
    if (socket && isConnected) {
      socket.emit("leave_thread", threadId);
      console.log(`📤 Left thread: ${threadId}`);
    }
  };
  
const sendTyping = (threadId: string, isTyping: boolean) => {
  if (socket && isConnected && user?.id) {
    // console.log(`⌨️ Sending typing event:`, { threadId, userId: user.id, isTyping });
    
    if (isTyping) {
      socket.emit('typing_start', {
        threadId,
        senderId: user.id,
      });
    } else {
      socket.emit('typing_stop', {
        threadId,
        senderId: user.id,
      });
    }
  }
};

  const value: SocketContextType = {
    socket,
    isConnected,
    joinThread,
    leaveThread,
    sendTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
