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

import ChatNav from '@/components/chat/chat-nav';
// import Stack from '@mui/material/Stack';
// import Container from '@mui/material/Container';
// import Typography from '@mui/material/Typography';


// import { useRouter, useSearchParams } from 'src/routes/hooks';

// import { useMockedUser } from './hooks/use-mocked-user';


// ----------------------------------------------------------------------

export default function ChatView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = _mockUser;

//   const settings = useSettingsContext();

//   const searchParams = useSearchParams();

//   const selectedConversationId = searchParams.get('id') || '';

//   const [recipients, setRecipients] = useState([]);

//   const { contacts } = useGetContacts();

//   const { conversations, conversationsLoading } = useGetConversations();

//   const { conversation, conversationError } = useGetConversation(`${selectedConversationId}`);

//   const participants = conversation
//     ? conversation.participants.filter((participant) => participant.id !== `${user.id}`)
//     : [];

//   useEffect(() => {
//     if (conversationError || !selectedConversationId) {
//       router.push(paths.dashboard.chat);
//     }
//   }, [conversationError, router, selectedConversationId]);

//   const handleAddRecipients = useCallback((selected) => {
//     setRecipients(selected);
//   }, []);

//   const details = !!conversation;

//   const renderHead = (
//     <Stack
//       direction="row"
//       alignItems="center"
//       flexShrink={0}
//       sx={{ pr: 1, pl: 2.5, py: 1, minHeight: 72 }}
//     >
//       {selectedConversationId ? (
//         <>{details && <ChatHeaderDetail participants={participants} />}</>
//       ) : (
//         <ChatHeaderCompose contacts={contacts} onAddRecipients={handleAddRecipients} />
//       )}
//     </Stack>
//   );

 // --- MOCK DATA INTEGRATION ---
  const contacts = _mockContacts;
  const conversations = _mockConversations;
  const conversationsLoading = false;

  const selectedConversationId = searchParams.get('id') || '';

  const conversation = _mockConversations.find(conv => conv.id === selectedConversationId) || _mockConversation;
  const conversationError = !conversation;

  // --- STATE MANAGEMENT ---
  const [recipients, setRecipients] = useState([]);
  
  const participants = conversation
    ? conversation.participants.filter((participant) => participant.id !== user.id)
    : [];
  
  const details = !!conversation;

//   useEffect(() => {
//     // Redirect if conversation is not found or no ID is provided
//     // if (conversationError || !selectedConversationId) {
//     //   router.push(paths.dashboard.chat);
//     // }
//   }, [conversationError, router, selectedConversationId]);

  const handleAddRecipients = useCallback((selected :any) => {
    setRecipients(selected);
  }, []);



  const renderNav = (
    <ChatNav
      contacts={contacts}
      conversations={conversations}
      loading={conversationsLoading}
      selectedConversationId={selectedConversationId}
       user={_mockUser}
    />
    // <p> hi </p>
  );

//   const renderMessages = (
//     <Stack
//       sx={{
//         width: 1,
//         height: 1,
//         overflow: 'hidden',
//       }}
//     >
//       <ChatMessageList messages={conversation?.messages} participants={participants} />

//       <ChatMessageInput
//         recipients={recipients}
//         onAddRecipients={handleAddRecipients}
//         //
//         selectedConversationId={selectedConversationId}
//         disabled={!recipients.length && !selectedConversationId}
//       />
//     </Stack>
//   );

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

    
     <div className="mt-20  mx-10 max-w-7xl px-4 sm:px-6 lg:px-8">
      <h4 className="text-2xl  mt-6 font-bold mb-6 md:mb-10">
        Chat
      </h4>

      <Card className="flex flex-row h-[72vh]">
        {/* renderNav corresponds to the navigation/sidebar */}
        {renderNav}
        {/* <p> render navigation </p> */}

        <div className="w-full h-full overflow-hidden flex flex-col">
          {/* renderHead corresponds to the chat header */}
          {/* {renderHead} */}
          <p> render head </p>

          <Separator className="bg-border" />

          <div className="flex flex-row w-full h-full overflow-hidden">
            {/* renderMessages corresponds to the main chat message area */}
            {/* {renderMessages} */}
            <p> place where messages will be rendered </p>

            {/* ChatRoom corresponds to the detailed view or side panel */}
            {/* {details && <ChatRoom conversation={conversation} participants={participants} />} */}
            <p> place for chat room </p>
          </div>
        </div>
      </Card>
    </div>
       </SidebarInset>
    </SidebarProvider>
  );
}
