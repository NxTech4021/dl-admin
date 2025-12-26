"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Chat Components
import ChatNav from "@/components/chat/chat-nav";
import ChatHeaderDetail from "@/components/chat/chat-header-detail";
import ChatMessageList from "@/components/chat/chat-message-list";
import ChatMessageInput from "@/components/chat/chat-message-input";
import ChatDetailsSheet from "@/components/chat/chat-details-sheet";

// Hooks and Types
import { useChatData, useMessages } from "./hooks/chat";
import type {
  Conversation,
  ChatParticipant,
  Thread,
} from "@/constants/types/chat";

function ChatViewContent() {
  const searchParams = useSearch({ strict: false }) as { id?: string };
  const navigate = useNavigate();
  const { data: session } = useSession();
  const user = session?.user;

  const selectedConversationId = searchParams?.id || "";

  // Reply state
  const [replyingTo, setReplyingTo] = useState<any>(null);

  // Details sheet state
  const [showDetails, setShowDetails] = useState(false);

  // Fetch data
  const {
    threads,
    loading: threadsLoading,
    error: threadsError,
    refetch: refetchThreads,
  } = useChatData(user?.id);

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    deleteMessage,
    error: messagesError,
    refetch: refetchMessages,
  } = useMessages(selectedConversationId || undefined);

  // Handle errors
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

  // Clear reply when conversation changes
  useEffect(() => {
    setReplyingTo(null);
  }, [selectedConversationId]);

  // Transform threads to conversations for UI
  const conversations: Conversation[] = threads.map((thread: Thread) => {
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
            sender: { name: thread.messages[0].sender.name },
          }
        : null;

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
      unreadCount: 0,
    };
  });

  const currentConversation = selectedConversationId
    ? conversations.find((conv) => conv.id === selectedConversationId)
    : null;

  const participants = currentConversation?.participants || [];

  // Close details when conversation changes
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
        await sendMessage(content, user.id, replyingTo?.id);
        setReplyingTo(null);
      } catch (error) {
        console.error("Failed to send message:", error);
        toast.error("Failed to send message. Please try again.");
      }
    },
    [sendMessage, user?.id, selectedConversationId, replyingTo]
  );

  const handleConversationSelect = useCallback(
    (conversationId: string) => {
      navigate({ to: "/chat", search: { id: conversationId } });
    },
    [navigate]
  );

  // Loading state with full-screen elegant loader
  if (threadsLoading && threads.length === 0) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
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
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Empty state component - cleaner iMessage style
  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="flex-1 flex items-center justify-center px-8"
    >
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          No conversation selected
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose a chat from the sidebar to start messaging
        </p>
      </div>
    </motion.div>
  );

  // Header for conversation - cleaner with click-to-details
  const renderHeader = () => (
    <div className="flex items-center px-4 py-3 min-h-[68px] border-b bg-background sticky top-0 z-10">
      {selectedConversationId && currentConversation ? (
        <ChatHeaderDetail
          participants={participants}
          conversation={currentConversation}
          onDetailsClick={handleOpenDetails}
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

  // Messages area
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
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        {/* Two-column chat layout */}
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          {/* Left: Conversation list */}
          <div className="w-[340px] flex-shrink-0 border-r border-border/40 bg-background">
            <ChatNav
              conversations={conversations}
              loading={threadsLoading}
              selectedConversationId={selectedConversationId}
              user={user}
              onConversationSelect={handleConversationSelect}
              onThreadCreated={refetchThreads}
            />
          </div>

          {/* Right: Chat view */}
          <div className="flex-1 flex flex-col min-w-0 bg-background">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedConversationId || "empty"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {renderHeader()}
                {renderMessages()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Details Sheet - opens on header click */}
        <ChatDetailsSheet
          open={showDetails}
          onOpenChange={setShowDetails}
          conversation={currentConversation}
          participants={participants}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function ChatView() {
  return (
    <Suspense
      fallback={
        <SidebarProvider
          style={{
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties}
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </motion.div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      }
    >
      <ChatViewContent />
    </Suspense>
  );
}
