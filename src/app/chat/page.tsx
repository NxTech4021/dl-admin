'use client';
import { useState, useCallback } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import ChatNav from '@/components/chat/chat-nav';
import ChatHeaderDetail from '@/components/chat/chat-header-detail';
import ChatMessageList from '@/components/chat/chat-message-list';
import ChatMessageInput from '@/components/chat/chat-message-input';
import ChatRoom from '@/components/chat/chat-room';
import { useChatData, useMessages } from './hooks/chat';
import { Loader2 } from 'lucide-react';

export default function ChatView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user;

  const selectedConversationId = searchParams.get('id') || '';
  const [recipients, setRecipients] = useState([]);

  // Only fetch threads and messages
  const { threads, loading: threadsLoading, error: threadsError } = useChatData(user?.id);
  const { messages, loading: messagesLoading, sendMessage } = useMessages(selectedConversationId);

  console.log("threads test", threads)
  // Transform threads to conversations format
  const conversations = threads.map(thread => ({
    id: thread.id,
    type: thread.isGroup ? 'group' : 'direct',
    displayName: thread.name || thread.members
      .filter(m => m.userId !== user?.id)
      .map(m => m.user.name)
      .join(', ') || 'Unknown',
    photoURL: thread.members.find(m => m.userId !== user?.id)?.user.image,
    participants: thread.members.map(m => ({
      id: m.userId,
      displayName: m.user.name,
      name: m.user.name,
      photoURL: m.user.image,
      status: 'online',
    })),
    messages: [],
    lastMessage: thread.messages[0] || null,
    unreadCount: 0,
  }));

  const conversation = selectedConversationId 
    ? conversations.find(conv => conv.id === selectedConversationId) 
    : null;
  
  const participants = conversation
    ? conversation.participants.filter((participant) => participant.id !== user?.id)
    : [];
  
  const details = !!conversation;

  const handleSendMessage = useCallback(async (content: string) => {
    if (!user?.id || !selectedConversationId) return;
    
    try {
      await sendMessage(content, user.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [sendMessage, user?.id, selectedConversationId]);

  const renderNav = (
    <ChatNav
      conversations={conversations}
      loading={threadsLoading}
      selectedConversationId={selectedConversationId}
      user={user}
    />
  );

  const renderMessages = (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {selectedConversationId ? (
        <>
          <ChatMessageList 
            messages={messages} 
            participants={participants}
            loading={messagesLoading}
          />
          <ChatMessageInput
            selectedConversationId={selectedConversationId}
            disabled={!selectedConversationId}
            onSendMessage={handleSendMessage}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
            <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderHeader = (
    <div className="flex items-center px-4 py-3 min-h-[72px]">
      {selectedConversationId && conversation ? (
        <ChatHeaderDetail participants={participants} />
      ) : (
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium">Messages</h3>
        </div>
      )}
    </div>
  );

  if (threadsLoading && !threads.length) {
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
        <div className="mt-20 mx-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <h4 className="text-2xl mt-6 font-bold mb-6 md:mb-10">Chat</h4>

          <Card className="flex flex-row h-[72vh]">
            {renderNav}
            
            <div className="w-full h-full overflow-hidden flex flex-col">
              {renderHeader}
              <Separator className="bg-border" />
              
              <div className="flex flex-row w-full h-full overflow-hidden">
                {renderMessages}
                {details && (
                  <ChatRoom 
                    conversation={conversation} 
                    participants={participants} 
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
