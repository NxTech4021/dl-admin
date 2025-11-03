"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconBell } from "@tabler/icons-react";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  onClick: () => void;
  className?: string;
  isOpen?: boolean;
}

const varHover = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export default function NotificationBell({ onClick, className, isOpen = false }: NotificationBellProps) {
  const { unreadCount } = useNotifications();

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
    >
      <motion.button
        whileTap="tap"
        whileHover="hover"
        variants={varHover}
        onClick={onClick}
        className={cn(
          "h-12 w-12 rounded-lg transition-colors border border-border/50 hover:border-border",
          isOpen 
            ? "bg-primary text-primary-foreground border-primary" 
            : "hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <IconBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 text-xs font-semibold flex items-center justify-center min-w-6 shadow-md"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </motion.button>
    </Button>
  );
}