"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { useSession } from "@/lib/auth-client";
import { getApiBaseUrl } from "@/lib/api-client";
import { logger } from "@/lib/logger";

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
      logger.debug("[Socket] Waiting for user session...");
      return;
    }

    logger.debug("[Socket] Initializing socket connection for user:", user.id);

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

    socketInstance.on("connect", () => {
      logger.debug("[Socket] Connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      logger.debug("[Socket] Disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error: Error) => {
      logger.error("[Socket] Connection error:", error);
      setIsConnected(false);
    });

    socketInstance.on("thread_joined", (data: { threadId: string; socketId: string }) => {
      logger.debug("[Socket] Joined thread:", data.threadId);
    });

    socketInstance.on("thread_join_error", (data: { threadId: string; error: string }) => {
      logger.error("[Socket] Failed to join thread:", data.threadId, data.error);
    });

    socketInstance.emit("join_user_room", user.id);

    setSocket(socketInstance);

    return () => {
      logger.debug("[Socket] Cleaning up connection");
      socketInstance.off("thread_joined");
      socketInstance.off("thread_join_error");
      socketInstance.disconnect();
    };
  }, [user?.id, user?.name]);

  const joinThread = (threadId: string) => {
    if (socket && isConnected) {
      socket.emit("join_thread", threadId);
      logger.debug("[Socket] Joined thread:", threadId);
    }
  };

  const leaveThread = (threadId: string) => {
    if (socket && isConnected) {
      socket.emit("leave_thread", threadId);
      logger.debug("[Socket] Left thread:", threadId);
    }
  };

  const sendTyping = (threadId: string, isTyping: boolean) => {
    if (socket && isConnected && user?.id) {
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
