"use client"

import PropTypes from "prop-types"
import { useBoolean } from "@/app/chat/hooks/use-boolean"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, MapPin, Phone, Mail } from "lucide-react"

export default function ChatRoomSingle({ participant }) {
  const collapse = useBoolean(true)
  const { name, avatarUrl, role, address, phoneNumber, email } = participant

  const renderInfo = (
    <div className="flex flex-col items-center py-5">
      <Avatar className="h-24 w-24 mb-2">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback>{name?.charAt(0)} </AvatarFallback>
      </Avatar>
      <p className="text-lg font-medium">{name}</p>
      <p className="text-sm text-muted-foreground mt-1">{role}</p>
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
      <div className="flex flex-col px-2 py-2.5 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span>{address}</span>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span>{phoneNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="truncate">{email}</span>
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

ChatRoomSingle.propTypes = {
  participant: PropTypes.object,
}
