"use client"

import { useBoolean } from "@/app/chat/hooks/use-boolean"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, MapPin, Phone, Mail, User } from "lucide-react"
import { ChatRoomSingleProps } from "../../constants/types/chat"
import { getStatusColor } from "./constants"

const getInitials = (name: string) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function ChatRoomSingle({ participant, conversation }: ChatRoomSingleProps) {
  const collapse = useBoolean(true)
  
  const name = participant?.name || participant?.displayName || 'Unknown User'
  const avatarUrl = participant?.photoURL || 'unknown'
  const role = participant?.role || 'User'
  const phoneNumber = participant?.phoneNumber || 'No phone number'
  const email = participant?.email || 'No email provided'
  const status = participant?.status || 'offline'


  const renderInfo = (
    <div className="flex flex-col items-center py-5 px-3 border-b border-border">
      <div className="relative mb-3">
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="text-lg">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        {/* Status indicator */}
        <div className={cn(
          "absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background",
          getStatusColor(status)
        )} />
      </div>
      
      <h3 className="text-lg font-semibold text-center mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground mb-1 capitalize">{status}</p>
      <p className="text-xs text-muted-foreground">{role}</p>
    </div>
  )

  const renderBtn = (
    <Button
      variant="ghost"
      onClick={collapse.onToggle}
      className="flex items-center justify-between w-full h-10 px-3 text-xs font-medium text-muted-foreground bg-muted/50"
    >
      <span>Information</span>
      {collapse.value ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </Button>
  )

  const renderContent = (
    <div
      className={cn(
        "overflow-hidden transition-all duration-200",
        collapse.value ? "max-h-40" : "max-h-0"
      )}
    >
      <div className="flex flex-col px-3 py-2.5 space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <User className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Role</span>
            <span className="text-sm">{role}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground">Email</span>
            <span className="text-sm truncate">{email}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Phone</span>
            <span className="text-sm">{phoneNumber}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {renderInfo}
      {renderBtn}
      {renderContent}
    </div>
  )
}
