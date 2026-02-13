"use client"

import { useNavigate } from "@tanstack/react-router"
import { ExternalLink, Mail, MapPin } from "lucide-react"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePlayer } from "@/hooks/queries"
import { getStatusColor } from "./constants"

interface ChatRoomParticipantDialogProps {
  participant: {
    id?: string
    name?: string
    displayName?: string
    avatarUrl?: string
    photoURL?: string
    role?: string
    email?: string
    status?: "online" | "offline" | "away" | "busy"
  }
  onClose: () => void
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

export default function ChatRoomParticipantDialog({
  participant,
  onClose,
}: ChatRoomParticipantDialogProps) {
  const navigate = useNavigate()

  // Fetch extended player data
  const { data: playerData } = usePlayer(participant?.id || "")

  const name = participant?.name || participant?.displayName || "Unknown"
  const avatarUrl = participant?.photoURL || participant?.avatarUrl
  const role = participant?.role || "Member"
  const status = participant?.status || "offline"
  const email = participant?.email || playerData?.email
  const area = playerData?.area

  const handleViewProfile = () => {
    if (participant?.id) {
      navigate({ to: "/players/$playerId", params: { playerId: participant.id } })
      onClose()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Avatar and Basic Info */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
          </Avatar>
          {/* Status indicator */}
          <div
            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background ${getStatusColor(status)}`}
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <h4 className="text-base font-medium truncate">{name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs capitalize">
              {role}
            </Badge>
            <span className="text-xs text-muted-foreground capitalize">{status}</span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 text-sm">
        {email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        )}
        {area && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{area}</span>
          </div>
        )}
      </div>

      {/* View Profile Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-1"
        onClick={handleViewProfile}
        disabled={!participant?.id}
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        View Profile
      </Button>
    </div>
  )
}
