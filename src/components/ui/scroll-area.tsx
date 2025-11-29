"use client"

import * as React from "react"
// OPTIMIZATION: Named imports instead of wildcard
import {
  Root as ScrollAreaRoot,
  Viewport as ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  Corner as ScrollAreaCorner,
} from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaRoot>) {
  return (
    <ScrollAreaRoot
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaViewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaViewport>
      <ScrollBar />
      <ScrollAreaCorner />
    </ScrollAreaRoot>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaScrollbar>) {
  return (
    <ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
