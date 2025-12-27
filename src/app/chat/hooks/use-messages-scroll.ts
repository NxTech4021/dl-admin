import { useRef, useEffect, useCallback, RefObject } from 'react';

// ----------------------------------------------------------------------

interface Message {
  id: string;
  [key: string]: unknown;
}

interface UseMessagesScrollReturn {
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function useMessagesScroll(messages: Message[] | null | undefined): UseMessagesScrollReturn {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollMessagesToBottom = useCallback(() => {
    if (!messages) {
      return;
    }

    if (!messagesEndRef.current) {
      return;
    }

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(
    () => {
      scrollMessagesToBottom();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages]
  );

  return {
    messagesEndRef,
  };
}
