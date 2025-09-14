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
import { Smile, ImagePlus, Paperclip, Mic } from "lucide-react";
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

  return (
    <div className="border-t border-border flex items-center gap-2 px-2 h-14 flex-shrink-0">
      {/* Left icon (emoji) */}
      <Button variant="ghost" size="icon">
        <Smile className="h-5 w-5" />
      </Button>

      {/* Input field */}
      <Input
        value={message}
        onKeyUp={handleSendMessage}
        onChange={handleChangeMessage}
        placeholder="Type a message"
        disabled={disabled}
        className="flex-1 border-none focus-visible:ring-0 shadow-none"
      />

      {/* Right side actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={handleAttach}>
          <ImagePlus className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleAttach}>
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Mic className="h-5 w-5" />
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
