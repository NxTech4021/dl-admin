"use client"

import { useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useResponsive } from "@/app/chat/hooks/use-responsive"
import { useCollapseNav } from "../../app/chat/hooks"
import ChatRoomGroup from "./chat-room-group"
// import ChatRoomAttachments from "./chat-room-attachments"
import { ArrowLeft, ArrowRight } from "lucide-react"
import ChatRoomSingle from "./chat-room-single"
import type { Conversation, ChatParticipant } from "@/constants/types/chat"

const NAV_WIDTH = 240

interface ChatRoomProps {
  participants: ChatParticipant[];
  conversation: Conversation;
}

export default function ChatRoom({ participants, conversation }: ChatRoomProps) {
  const lgUp = useResponsive("up", "lg")

  const {
    collapseDesktop,
    onCloseDesktop,
    onCollapseDesktop,
    //
    openMobile,
    onOpenMobile,
    onCloseMobile,
  } = useCollapseNav()

  useEffect(() => {
    if (!lgUp) {
      onCloseDesktop()
    }
  }, [onCloseDesktop, lgUp])

  const handleToggleNav = useCallback(() => {
    if (lgUp) {
      onCollapseDesktop()
    } else {
      onOpenMobile()
    }
  }, [lgUp, onCollapseDesktop, onOpenMobile])

  const isGroup = conversation?.type === 'group'

  const renderContent = (
    <div className="flex flex-col h-full">
      {isGroup ? (
        <ChatRoomGroup 
          participants={participants} 
          conversation={conversation}
        />
      ) : (
        <ChatRoomSingle 
          participant={participants.find(p => !p.isCurrentUser)}
          conversation={conversation}
        />
      )}

      {/* <ChatRoomAttachments attachments={""} /> */}
    </div>
  )

  const renderToggleBtn = (
    <Button
      size="icon"
      variant="outline"
      onClick={handleToggleNav}
      className={cn(
        "absolute top-3 h-8 w-8 rounded-l-md shadow-md border bg-background",
        lgUp && !collapseDesktop ? "right-[240px]" : "right-0"
      )}
    >
      {lgUp ? (
        collapseDesktop ? (
          <ArrowLeft className="h-4 w-4" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )
      ) : (
        <ArrowLeft className="h-4 w-4" />
      )}
    </Button>
  )

  return (
    <div className="relative h-full">
      {renderToggleBtn}

      {lgUp ? (
        <div
          className={cn(
            "h-full shrink-0 border-l transition-all duration-200 ease-in-out",
            collapseDesktop ? "w-0" : "w-[240px]"
          )}
        >
          {!collapseDesktop && renderContent}
        </div>
      ) : (
        <Sheet open={openMobile} onOpenChange={onCloseMobile}>
          <SheetContent side="right" className="w-[240px] p-0">
            {renderContent}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
