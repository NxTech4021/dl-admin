'use client';

import { cn } from "@/lib/utils";

interface ChatNavItemSkeletonProps {
  className?: string;
  index?: number;
}

const ChatNavItemSkeleton = ({ className, index = 0, ...other }: ChatNavItemSkeletonProps) => {
  // Stagger the animation delay based on index for a wave effect
  const animationDelay = `${index * 75}ms`;

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-3 px-4 py-3.5",
        className
      )}
      style={{ animationDelay }}
      {...other}
    >
      {/* Avatar Skeleton */}
      <div
        className="w-12 h-12 rounded-full bg-muted animate-pulse shrink-0"
        style={{ animationDelay }}
      />

      {/* Content Skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header row: Name + Time */}
        <div className="flex items-center justify-between gap-2">
          <div
            className="h-4 rounded-md bg-muted animate-pulse"
            style={{
              width: `${55 + (index % 3) * 15}%`,
              animationDelay,
            }}
          />
          <div
            className="h-3 w-10 rounded-md bg-muted/60 animate-pulse shrink-0"
            style={{ animationDelay }}
          />
        </div>
        {/* Message preview row */}
        <div
          className="h-3 rounded-md bg-muted/70 animate-pulse"
          style={{
            width: `${70 + (index % 4) * 8}%`,
            animationDelay,
          }}
        />
      </div>
    </div>
  );
};

export default ChatNavItemSkeleton;
