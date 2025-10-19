'use client';

import { sub } from "date-fns";
import PropTypes from "prop-types";
import { useRef, useMemo, useState, useCallback } from "react";

import { useRouter } from "next/navigation";
// import { paths } from "src/routes/paths";

import { _mockContacts, _mockUser } from "@/app/chat/hooks/_mockData";
// import uuidv4 from "src/utils/uuidv4";
// import { sendMessage, createConversation } from "src/api/chat";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smile, ImagePlus, Paperclip, Mic, Send } from "lucide-react";
import { uuidv4 } from "zod";

export default function ChatMessageInput({
  recipients,
  onAddRecipients,
  disabled,
  selectedConversationId,
}) {
  const router = useRouter();
  const user  = _mockUser
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [message, setMessage] = useState("");

  const myContact = useMemo(
    () => ({
      id: `${user?.id}`,
      role: `${user?.role}`,
      email: `${user?.email}`,
      // address: `${user?.address}`,
      name: `${user?.displayName}`,
      lastActivity: new Date(),
      avatarUrl: `${user?.photoURL}`,
      phoneNumber: `${user?.phoneNumber}`,
      status: "online",
    }),
    [user]
  );

  const messageData = useMemo(
    () => ({
      id: uuidv4(),
      attachments: [],
      body: message,
      contentType: "text",
      createdAt: sub(new Date(), { minutes: 1 }),
      senderId: myContact.id,
    }),
    [message, myContact.id]
  );

  const conversationData = useMemo(
    () => ({
      id: uuidv4(),
      messages: [messageData],
      participants: [...recipients, myContact],
      type: recipients.length > 1 ? "GROUP" : "ONE_TO_ONE",
      unreadCount: 0,
    }),
    [messageData, myContact, recipients]
  );

  const handleAttach = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleChangeMessage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(event.target.value);
    },
    []
  );

  const handleSendMessage = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      try {
        if (event.key === "Enter") {
          if (message) {
            if (selectedConversationId) {
              // await sendMessage(selectedConversationId, messageData);
            } else {
              // const res = await createConversation(conversationData);

              router.push(`${paths.dashboard.chat}?id=${res.conversation.id}`);
              onAddRecipients([]);
            }
          }
          setMessage("");
        }
      } catch (error) {
        console.error(error);
      }
    },
    [conversationData, message, messageData, onAddRecipients, router, selectedConversationId]
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t bg-background">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Paperclip className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <ImagePlus className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Select a conversation to start messaging" : "Type a message..."}
            disabled={disabled}
            className="w-full"
          />
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Smile className="h-4 w-4" />
        </Button>

        <Button 
          // onClick={handleSendMessage}
          disabled={disabled || !message.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input type="file" ref={fileRef} className="hidden" />
    </div>
  );
}

ChatMessageInput.propTypes = {
  disabled: PropTypes.bool,
  onAddRecipients: PropTypes.func,
  recipients: PropTypes.array,
  selectedConversationId: PropTypes.string,
};
