"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { useSession } from "@/lib/auth-client";
import { getApiBaseUrl } from "@/lib/api-client";

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
    if (!user?.id) {
      console.log("⏳ [Socket] Waiting for user session...");
      return;
    }

    console.log("🚀 [Socket] Initializing socket connection for user:", user.id);

    const socketInstance = io(
      getApiBaseUrl(),
      {
        auth: {
          userId: user.id,
          userName: user.name,
        },
        transports: ["websocket", "polling"],
        withCredentials: true,
        path: "/socket.io/",
        extraHeaders: {
          'x-user-id': user.id,
        },
      }
    );

    // Connection events
    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      console.log("🔌 Socket transport:", socketInstance.io.engine.transport.name);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error: Error) => {
      console.error("❌ Socket connection error:", error);
      setIsConnected(false);
    });

    // Listen for thread join confirmations
    socketInstance.on("thread_joined", (data: { threadId: string; socketId: string }) => {
      console.log(`✅ Successfully joined thread: ${data.threadId}`);
    });

    socketInstance.on("thread_join_error", (data: { threadId: string; error: string }) => {
      console.error(`❌ Failed to join thread ${data.threadId}:`, data.error);
    });

    // Join user's personal room for notifications
    socketInstance.emit("join_user_room", user.id);

    setSocket(socketInstance);

    return () => {
      console.log("🧹 Cleaning up socket connection");
      socketInstance.off("thread_joined");
      socketInstance.off("thread_join_error");
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
