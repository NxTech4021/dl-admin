'use client';

import { cn } from "@/lib/utils"; 

const ChatNavItemSkeleton = ({ className, ...other } : any) => {
  return (
    <div
      className={cn("flex flex-row items-center space-x-2 px-2.5 py-1.5", className)}
      {...other}
    >
      {/* Avatar Skeleton */}
      <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />

      {/* Text Skeletons */}
      <div className="flex flex-col flex-grow space-y-1">
        <div className="w-[75%] h-2 rounded bg-gray-200 animate-pulse" />
        <div className="w-[50%] h-2 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
};

export default ChatNavItemSkeleton;
