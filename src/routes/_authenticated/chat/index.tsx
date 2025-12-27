import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useState, Suspense, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { SiteHeader } from "@/components/site-header";
import ChatNav from "@/components/chat/chat-nav";
import ChatHeaderDetail from "@/components/chat/chat-header-detail";
import ChatMessageList from "@/components/chat/chat-message-list";
import ChatMessageInput from "@/components/chat/chat-message-input";
import ChatDetailsSheet from "@/components/chat/chat-details-sheet";

import { useChatData, useMessages } from "@/app/chat/hooks/chat";
import type {
  Conversation,
  ChatParticipant,
  Thread,
} from "@/constants/types/chat";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: (search.id as string) || "",
    };
  },
});

function ChatPage() {
  const navigate = useNavigate();
  const { id: selectedConversationId } = useSearch({ from: "/_authenticated/chat/" });
  const { data: session } = useSession();
  const user = session?.user;

  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const {
    threads,
    loading: threadsLoading,
    error: threadsError,
    refetch: refetchThreads,
    updateThreadLastMessage,
    markThreadAsRead,
  } = useChatData(user?.id, selectedConversationId);

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    deleteMessage,
    error: messagesError,
    refetch: refetchMessages,
  } = useMessages(selectedConversationId || undefined);

  useEffect(() => {
    if (threadsError) {
      console.error("Threads error:", threadsError);
      toast.error("Failed to load conversations");
    }
    if (messagesError) {
      console.error("Messages error:", messagesError);
      toast.error("Failed to load messages");
    }
  }, [threadsError, messagesError]);

  useEffect(() => {
    setReplyingTo(null);
  }, [selectedConversationId]);

  // Mark thread as read when conversation is opened
  useEffect(() => {
    if (selectedConversationId && user?.id) {
      markThreadAsRead(selectedConversationId);
    }
  }, [selectedConversationId, user?.id, markThreadAsRead]);

  const conversations: Conversation[] = useMemo(() => {
    return threads.map((thread: Thread) => {
      const displayName = thread.isGroup
        ? thread.name || "Unnamed Group"
        : thread.members
            .filter((m) => m.userId !== user?.id)
            .map((m) => m.user.name)
            .join(", ") || "Unknown";

      const photoURL = thread.isGroup
        ? thread.avatarUrl
        : thread.members.find((m) => m.userId !== user?.id)?.user.image;

      const participants: ChatParticipant[] = thread.members.map((member) => ({
        id: member.userId,
        name: member.user.name,
        username: member.user.username,
        email: member.user.email,
        phoneNumber: member.user.phoneNumber,
        image: member.user.image,
        displayName: member.user.name,
        photoURL: member.user.image,
        status: "online" as const,
        role: member.role,
        isCurrentUser: member.userId === user?.id,
      }));

      const lastMessage =
        thread.messages.length > 0
          ? {
              content: thread.messages[0].content,
              createdAt: thread.messages[0].createdAt,
              senderId: thread.messages[0].senderId,
              sender: {
                id: thread.messages[0].sender?.id,
                name: thread.messages[0].sender.name,
                image: thread.messages[0].sender?.image,
              },
              // Include match message info for smart preview
              messageType: thread.messages[0].messageType,
              matchData: thread.messages[0].matchData,
            }
          : null;

      // Map division data for context badges
      const division = thread.division
        ? {
            name: thread.division.name,
            season: thread.division.season
              ? { name: thread.division.season.name }
              : undefined,
            league: thread.division.league
              ? {
                  name: thread.division.league.name,
                  sportType: thread.division.league.sportType,
                }
              : undefined,
          }
        : undefined;

      return {
        id: thread.id,
        type: thread.isGroup ? "group" : "direct",
        displayName,
        name: thread.name,
        photoURL,
        avatarUrl: thread.avatarUrl,
        isGroup: thread.isGroup,
        participants,
        messages: [],
        lastMessage,
        unreadCount: thread.unreadCount ?? 0,
        divisionId: thread.divisionId,
        division,
      };
    });
  }, [threads, user?.id]);

  const currentConversation = selectedConversationId
    ? conversations.find((conv) => conv.id === selectedConversationId)
    : null;

  const participants = currentConversation?.participants || [];

  useEffect(() => {
    setShowDetails(false);
  }, [selectedConversationId]);

  const handleOpenDetails = useCallback(() => {
    setShowDetails(true);
  }, []);

  const handleReply = useCallback((message: any) => {
    setReplyingTo(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      if (!deleteMessage) {
        toast.error("Delete functionality not available");
        return;
      }
      try {
        await deleteMessage(messageId);
        toast.success("Message deleted successfully");
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    },
    [deleteMessage]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!user?.id || !selectedConversationId) {
        toast.error("Unable to send message. Please select a conversation.");
        return;
      }
      try {
        const newMessage = await sendMessage(content, user.id, replyingTo?.id);
        setReplyingTo(null);
        // Update the thread list with the new message
        if (newMessage) {
          updateThreadLastMessage(selectedConversationId, newMessage);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        toast.error("Failed to send message. Please try again.");
      }
    },
    [sendMessage, user?.id, selectedConversationId, replyingTo, updateThreadLastMessage]
  );

  const handleConversationSelect = useCallback(
    (conversationId: string) => {
      navigate({ to: "/chat", search: { id: conversationId } });
    },
    [navigate]
  );

  const handleBackToConversations = useCallback(() => {
    navigate({ to: "/chat", search: { id: "" } });
  }, [navigate]);

  if (threadsLoading && threads.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-2 border-2 border-brand-light/30 border-t-brand-light rounded-full"
              />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Loading conversations...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="flex-1 flex items-center justify-center px-4 md:px-8"
    >
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-2">
          No conversation selected
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground">
          Choose a chat from the sidebar to start messaging
        </p>
      </div>
    </motion.div>
  );

  const renderHeader = () => (
    <div className="flex items-center px-3 md:px-4 py-2 md:py-3 min-h-[60px] md:min-h-[68px] border-b bg-background sticky top-0 z-10">
      {selectedConversationId && currentConversation ? (
        <ChatHeaderDetail
          participants={participants}
          conversation={currentConversation}
          onDetailsClick={handleOpenDetails}
          onBack={handleBackToConversations}
        />
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold">Messages</h3>
            <p className="text-xs text-muted-foreground">
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderMessages = () => {
    if (!selectedConversationId || !currentConversation) {
      return renderEmptyState();
    }

    return (
      <div className="flex flex-col w-full h-full overflow-hidden">
        <ChatMessageList
          messages={messages}
          participants={participants}
          loading={messagesLoading}
          threadId={selectedConversationId}
          onReply={handleReply}
          onDelete={handleDeleteMessage}
        />

        <ChatMessageInput
          selectedConversationId={selectedConversationId}
          disabled={!selectedConversationId || messagesLoading}
          onSendMessage={handleSendMessage}
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
        />
      </div>
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex min-h-0">
        {/* Desktop: Sidebar always visible */}
        <div className="hidden md:block md:w-[360px] flex-shrink-0 border-r border-border/40 bg-background overflow-y-auto">
          <ChatNav
            conversations={conversations}
            loading={threadsLoading}
            selectedConversationId={selectedConversationId}
            user={user}
            onConversationSelect={handleConversationSelect}
            onThreadCreated={refetchThreads}
          />
        </div>

        {/* Mobile/Tablet: Show list view when no conversation selected, chat view when selected */}
        {/* Desktop: Always show chat view area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background">
          <AnimatePresence mode="wait">
            {!selectedConversationId ? (
              // Mobile: Conversation list view (hidden on desktop)
              <motion.div
                key="conversation-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="flex-1 flex flex-col min-h-0 md:hidden"
              >
                <ChatNav
                  conversations={conversations}
                  loading={threadsLoading}
                  selectedConversationId={selectedConversationId}
                  user={user}
                  onConversationSelect={handleConversationSelect}
                  onThreadCreated={refetchThreads}
                  forceMobileList={true}
                />
              </motion.div>
            ) : (
              // Mobile: Chat view with messages (hidden on desktop)
              <motion.div
                key={selectedConversationId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="flex-1 flex flex-col min-h-0 md:hidden"
              >
                {renderHeader()}
                {renderMessages()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop: Always show chat view area (even when no conversation selected) */}
          <div className="hidden md:flex flex-1 flex flex-col min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedConversationId || "empty"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="flex-1 flex flex-col min-h-0"
              >
                {renderHeader()}
                {renderMessages()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ChatDetailsSheet
        open={showDetails}
        onOpenChange={setShowDetails}
        conversation={currentConversation}
        participants={participants}
      />
    </div>
  );
}
