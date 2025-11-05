"use client";

import { useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// UI Components
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";

// Chat Components
import ChatNav from "@/components/chat/chat-nav";
import ChatHeaderDetail from "@/components/chat/chat-header-detail";
import ChatMessageList from "@/components/chat/chat-message-list";
import ChatMessageInput from "@/components/chat/chat-message-input";
import ChatRoom from "@/components/chat/chat-room";

// Hooks and Types
import { useChatData, useMessages } from "./hooks/chat";
import type {
  Conversation,
  ChatParticipant,
  Thread,
} from "@/components/chat/types";

function ChatViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const selectedConversationId = searchParams.get("id") || "";

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

  // Transform threads to conversations for UI
  const conversations: Conversation[] = threads.map((thread: Thread) => {
    const displayName = thread.isGroup
      ? thread.name || "Unnamed Group"
      : thread.members
          .filter((m) => m.userId !== user?.id)
          .map((m) => m.user.name)
          .join(", ") || "Unknown";

    // Get photo URL (group avatar or other participant's image)
    const photoURL = thread.isGroup
      ? thread.avatarUrl
      : thread.members.find((m) => m.userId !== user?.id)?.user.image;

    // Transform thread members to chat participants
    const participants: ChatParticipant[] = thread.members.map((member) => ({
      id: member.userId,
      name: member.user.name,
      username: member.user.username,
      email: member.user.email,
      phoneNumber: member.user.phoneNumber,
      image: member.user.image,
      displayName: member.user.name,
      photoURL: member.user.image,
      status: "online" as const, // TODO: Implement real status
      role: member.role,
      isCurrentUser: member.userId === user?.id,
    }));

    // Get last message for preview
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

  // Get current conversation and participants
  const currentConversation = selectedConversationId
    ? conversations.find((conv) => conv.id === selectedConversationId)
    : null;

  const participants = currentConversation?.participants || [];
  const showDetails = !!currentConversation;

  // Handlers
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!user?.id || !selectedConversationId) {
        toast.error("Unable to send message. Please select a conversation.");
        return;
      }

      try {
        await sendMessage(content, user.id);
      } catch (error) {
        console.error("Failed to send message:", error);
        toast.error("Failed to send message. Please try again.");
      }
    },
    [sendMessage, user?.id, selectedConversationId]
  );

  const handleConversationSelect = useCallback(
    (conversationId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("id", conversationId);
      router.push(`/chat?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Loading state
  if (threadsLoading && threads.length === 0) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="mt-20 mx-10 max-w-7xl px-4 sm:px-6 lg:px-8">
            <h4 className="text-2xl mt-6 font-bold mb-6 md:mb-10">Chat</h4>
            <Card className="flex items-center justify-center h-[72vh]">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading conversations...</span>
              </div>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Render functions
  const renderNavigation = () => (
    <ChatNav
      conversations={conversations}
      loading={threadsLoading}
      selectedConversationId={selectedConversationId}
      user={user}
      onConversationSelect={handleConversationSelect}
    />
  );

  const renderHeader = () => (
    <div className="flex items-center px-4 py-3 min-h-[72px] border-b">
      {selectedConversationId && currentConversation ? (
        <ChatHeaderDetail
          participants={participants}
          conversation={currentConversation}
        />
      ) : (
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium">Messages</h3>
          <span className="text-sm text-muted-foreground">
            {conversations.length} conversation
            {conversations.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );

  const renderMessages = () => {
    if (!selectedConversationId || !currentConversation) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground max-w-md">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
            <p className="text-sm">
              Choose a chat from the sidebar to start messaging, or create a new
              conversation.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col w-full h-full overflow-hidden">
        <ChatMessageList
          messages={messages}
          participants={participants}
          loading={messagesLoading}
          threadId={selectedConversationId}
        />
        <ChatMessageInput
          selectedConversationId={selectedConversationId}
          disabled={!selectedConversationId || messagesLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    );
  };

  const renderChatRoom = () => {
    if (!showDetails || !currentConversation) return null;

    return (
      <ChatRoom
        conversation={currentConversation}
        participants={participants}
      />
    );
  };

  // Debug logging
  // console.log("Chat View Debug:", {
  //   threadsCount: threads.length,
  //   conversationsCount: conversations.length,
  //   selectedConversationId,
  //   currentConversation: currentConversation?.displayName,
  //   messagesCount: messages.length,
  //   user: user?.id,
  // });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="mt-20 mx-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h4 className="text-2xl mt-6 font-bold">Chat</h4>
          </div>

          <Card className="flex flex-row h-[72vh] overflow-hidden">
            {renderNavigation()}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {renderHeader()}

              {/* Messages and Chat Room */}
              <div className="flex flex-row flex-1 overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {renderMessages()}
                </div>

                {/* Chat Room Details */}
                {renderChatRoom()}
              </div>
            </div>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function ChatView() {
  return (
    <Suspense
      fallback={
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="mt-20 mx-10 max-w-7xl px-4 sm:px-6 lg:px-8">
              <h4 className="text-2xl mt-6 font-bold mb-6 md:mb-10">Chat</h4>
              <Card className="flex items-center justify-center h-[72vh]">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading...</span>
                </div>
              </Card>
            </div>
          </SidebarInset>
        </SidebarProvider>
      }
    >
      <ChatViewContent />
    </Suspense>
  );
}
