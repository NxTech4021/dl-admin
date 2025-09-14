"use client"

import { useState, useCallback } from "react"
import PropTypes from "prop-types"
import { ChevronDown, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

import { useBoolean } from "@/app/chat/hooks/use-boolean"
import ChatRoomParticipantDialog from "./chat-room-participant-dialog"

export default function ChatRoomGroup({ participants }) {
  const [selected, setSelected] = useState<any | null>(null)
  const collapse = useBoolean(true)

  const handleOpen = useCallback((participant: any) => {
    setSelected(participant)
  }, [])

  const handleClose = () => setSelected(null)

  const totalParticipants = participants.length

  const renderBtn = (
    <Button
      variant="ghost"
      onClick={collapse.onToggle}
      className="flex items-center justify-between w-full h-10 px-3 text-xs font-medium text-muted-foreground bg-muted/50"
    >
      <span>In room ({totalParticipants})</span>
      {collapse.value ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </Button>
  )

  const renderContent = (
    <ScrollArea className="h-[224px]">
      <ul className="divide-y divide-border">
        {participants.map((participant: any) => (
          <li
            key={participant.id}
            onClick={() => handleOpen(participant)}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/70"
          >
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                <AvatarFallback>
                  {participant.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              {/* Status dot */}
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-background",
                  participant.status === "online"
                    ? "bg-green-500"
                    : participant.status === "offline"
                    ? "bg-gray-400"
                    : "bg-yellow-500"
                )}
              />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {participant.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {participant.role}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )

  return (
    <>
      {renderBtn}

      <div
        className={cn(
          "transition-all overflow-hidden",
          collapse.value ? "max-h-[224px]" : "max-h-0"
        )}
      >
        {collapse.value && renderContent}
      </div>

      {selected && (
        <Dialog open={!!selected} onOpenChange={handleClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selected.name}</DialogTitle>
            </DialogHeader>
            <ChatRoomParticipantDialog
              participant={selected}
              open={!!selected}
              onClose={handleClose}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

ChatRoomGroup.propTypes = {
  participants: PropTypes.array,
}
