'use client';
import { useState, useEffect, useCallback } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { _mockContacts, _mockConversation, _mockConversations, _mockUser } from "./hooks/_mockData";
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import ChatNav from '@/components/chat/chat-nav';
import ChatHeaderDetail from '@/components/chat/chat-header-detail';
import ChatHeaderCompose from '@/components/chat/chat-header-compose';
import ChatMessageList from '@/components/chat/chat-message-list';
import ChatMessageInput from '@/components/chat/chat-message-input';
import ChatRoom from '@/components/chat/chat-room';


export default function ChatView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user;

  const contacts = _mockContacts;
  const conversations = _mockConversations;
  const conversationsLoading = false;

  const selectedConversationId = searchParams.get('id') || '';
  const [recipients, setRecipients] = useState([]);
  
  // Get current conversation or use mock conversation
  const conversation = selectedConversationId 
    ? conversations.find(conv => conv.id === selectedConversationId) 
    : null;
  
  const participants = conversation
    ? conversation.participants.filter((participant) => participant.id !== user.id)
    : [];
  
  const details = !!conversation;

  const handleAddRecipients = useCallback((selected: any) => {
    setRecipients(selected);
  }, []);

  const renderHead = (
    <div className="flex items-center px-4 py-3 min-h-[72px]">
      {selectedConversationId && conversation ? (
        <ChatHeaderDetail participants={participants} />
      ) : (
        <ChatHeaderCompose contacts={contacts} onAddRecipients={handleAddRecipients} />
      )}
    </div>
  );

  const renderNav = (
    <ChatNav
      contacts={contacts}
      conversations={conversations}
      loading={conversationsLoading}
      selectedConversationId={selectedConversationId}
      user={user}
    />
  );

  const renderMessages = (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <ChatMessageList 
        messages={conversation?.messages || []} 
        participants={participants} 
      />
      <ChatMessageInput
        recipients={recipients}
        onAddRecipients={handleAddRecipients}
        selectedConversationId={selectedConversationId}
        disabled={!recipients.length && !selectedConversationId}
      />
    </div>
  );

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
          <h4 className="text-2xl mt-6 font-bold mb-6 md:mb-10">
            Chat
          </h4>

          <Card className="flex flex-row h-[72vh]">
            {renderNav}
            
            <div className="w-full h-full overflow-hidden flex flex-col">
              {renderHead}
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
