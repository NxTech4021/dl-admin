"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ChatRoomGroup from "./chat-room-group";
import ChatRoomSingle from "./chat-room-single";
import type { Conversation, ChatParticipant } from "@/constants/types/chat";

interface ChatDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation | null;
  participants: ChatParticipant[];
}

export default function ChatDetailsSheet({
  open,
  onOpenChange,
  conversation,
  participants,
}: ChatDetailsSheetProps) {
  if (!conversation) return null;

  const isGroup = conversation.type === "group";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] p-0 overflow-y-auto">
        <SheetHeader className="sr-only">
          <SheetTitle>
            {isGroup ? "Group Details" : "Contact Details"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {isGroup ? (
            <ChatRoomGroup
              participants={participants}
              conversation={conversation}
            />
          ) : (
            <ChatRoomSingle
              participant={participants.find((p) => !p.isCurrentUser)}
              conversation={conversation}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
