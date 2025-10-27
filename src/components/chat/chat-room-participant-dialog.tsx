"use client"

import PropTypes from "prop-types"
import { X, Phone, MessageCircle, Mail, Video } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function ChatRoomParticipantDialog({ participant, open, onClose }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs p-6 relative flex gap-4">
        <DialogClose asChild>
          <button className="absolute top-2 right-2 p-1 rounded hover:bg-muted/50">
            <X className="h-4 w-4" />
          </button>
        </DialogClose>

        <Avatar className="h-24 w-24">
          <AvatarImage src={participant.avatarUrl} alt={participant.name} />
          <AvatarFallback>{participant.name?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col flex-1 justify-between">
          <div className="space-y-1">
            <p className="text-xs text-primary">{participant.role}</p>
            <p className="text-lg font-medium">{participant.name}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <MessageCircle className="h-4 w-4 flex-shrink-0 mr-1" />
              {participant.address}
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <Button
              size="icon"
              variant="ghost"
              className="bg-red-100 hover:bg-red-200"
            >
              <Phone className="h-4 w-4 text-red-600" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="bg-sky-100 hover:bg-sky-200"
            >
              <MessageCircle className="h-4 w-4 text-sky-600" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="bg-primary/10 hover:bg-primary/20"
            >
              <Mail className="h-4 w-4 text-primary" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="bg-secondary/10 hover:bg-secondary/20"
            >
              <Video className="h-4 w-4 text-secondary" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

ChatRoomParticipantDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  participant: PropTypes.object,
}
