import PropTypes from "prop-types";
import { ScrollArea } from "@/components/ui/scroll-area"; 
// import Lightbox, { useLightBox } from "src/components/lightbox";

import { useMessagesScroll } from "../../app/chat/hooks";
import ChatMessageItem from "./chat-message-item";

export default function ChatMessageList({ messages = [], participants }) {
  const { messagesEndRef } = useMessagesScroll(messages);

  const slides = messages
    .filter((message) => message.contentType === "image")
    .map((message) => ({ src: message.body }));

  const lightbox = useLightBox(slides);

  return (
    <>
      <ScrollArea className="w-full h-full px-3 py-5">
        <div ref={messagesEndRef} className="space-y-4">
          {messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              participants={participants}
              onOpenLightbox={() => lightbox.onOpen(message.body)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
      /> */}
    </>
  );
}

ChatMessageList.propTypes = {
  messages: PropTypes.array,
  participants: PropTypes.array,
};
