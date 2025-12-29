"use client"

import { useState, useCallback } from "react"
import { ChevronDown, ChevronRight, Users } from "lucide-react"

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

interface ChatRoomGroupProps {
  participants: any[]
  conversation: any
}

const getInitials = (name: string) => {
  if (!name) return "?"
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const getGroupInitials = (groupName: string) => {
  if (!groupName) return "G"

  const words = groupName.trim().split(" ")
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  } else {
    return words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
  }
}

export default function ChatRoomGroup({
  participants,
  conversation,
}: ChatRoomGroupProps) {
  const [selected, setSelected] = useState<any | null>(null)
  const collapse = useBoolean(true)

  const handleOpen = useCallback((participant: any) => {
    setSelected(participant)
  }, [])

  const handleClose = () => setSelected(null)
  
  // Use all participants length (includes current user)
  const totalParticipants = participants.length
  
  // To do implement socket 
  const onlineParticipants = participants.filter(
    (p) => p.status === "online"
  ).length

  const renderGroupInfo = (
    <div className="flex flex-col items-center py-5 px-3 border-b border-border">
      {/* Group Avatar */}
      <Avatar className="h-20 w-20 mb-3">
        <AvatarImage
          src={conversation?.photoURL || conversation?.avatarUrl}
          alt={conversation?.displayName || "Group Chat"}
        />
        <AvatarFallback className="text-lg bg-gradient-to-br from-brand-dark to-brand-light text-white font-semibold">
          {getGroupInitials(
            conversation?.displayName || conversation?.name || "Group"
          )}
        </AvatarFallback>
      </Avatar>

      {/* Group Name */}
      <h3 className="text-lg font-semibold text-center mb-1">
        {conversation?.displayName || conversation?.name || "Group Chat"}
      </h3>

      {/* Participants Count */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>
          {totalParticipants} members
          {onlineParticipants > 0 && (
            <span className="ml-1">• {onlineParticipants} online</span>
          )}
        </span>
      </div>
    </div>
  )

  const renderBtn = (
    <Button
      variant="ghost"
      onClick={collapse.onToggle}
      className="flex items-center justify-between w-full h-10 px-3 text-xs font-medium text-muted-foreground bg-muted/50"
    >
      <span>Members ({totalParticipants})</span>
      {collapse.value ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </Button>
  )

  const renderContent = (
    <ScrollArea className="h-[500px]">
      <ul className="divide-y divide-border">
        {participants.map((participant: any) => (
          <li
            key={participant.id}
            onClick={() => handleOpen(participant)}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={participant.photoURL || participant.avatarUrl}
                  alt={participant.name || participant.displayName}
                />
                <AvatarFallback>
                  {getInitials(participant.name || participant.displayName || "User")}
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

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {participant.name || participant.displayName}
                </span>
                {participant.isCurrentUser && (
                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {participant.role || "Member"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )

  return (
    <>
      {renderGroupInfo}
      {renderBtn}

      <div
        className={cn(
          "transition-all overflow-hidden",
          collapse.value ? "max-h-[500px]" : "max-h-0"
        )}
      >
        {collapse.value && renderContent}
      </div>

      {selected && (
        <Dialog open={!!selected} onOpenChange={handleClose}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="sr-only">
                {selected.name || selected.displayName}
              </DialogTitle>
            </DialogHeader>
            <ChatRoomParticipantDialog
              participant={selected}
              onClose={handleClose}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
