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
  const hasNotifications = unreadCount > 0;

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
          "h-9 w-9 rounded-md transition-all border cursor-pointer",
          isOpen 
            ? "bg-primary text-primary-foreground border-primary/80 shadow-sm" 
            : "border-border/60 hover:border-border bg-background hover:bg-muted/60 text-foreground/80 hover:text-foreground",
          hasNotifications && !isOpen && "ring-2 ring-red-500/20"
        )}
      >
        <IconBell className={cn(
          "h-4 w-4",
          isOpen ? "text-primary-foreground" : "text-foreground",
          hasNotifications && !isOpen && "text-red-600 dark:text-red-400"
        )} />
        {hasNotifications && (
          <Badge
            variant="destructive"
            className={cn(
              "absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px] font-bold flex items-center justify-center min-w-5 shadow-md border-2 border-background animate-pulse",
              isOpen && "border-primary-foreground/20 animate-none"
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </motion.button>
    </Button>
  );
}