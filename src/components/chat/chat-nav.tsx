'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Icons from lucide-react
import { Search, ChevronLeft, ChevronRight, Users, UserPlus } from 'lucide-react';

// Placeholders for other components
import ChatNavAccount from './chat-nav-account';
import ChatNavSearchResults from './chat-nav-search-results';
import ChatNavItemSkeleton from './chat-skeleton';
import ChatNavItem from './chat-nav-item';

// --- MOCK HOOKS & UTILITIES ---
// NOTE: In a real project, these would likely be defined in separate files.
const useResponsive = (query, start) => {
  const [isMatch, setIsMatch] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: 768px)`); // Corresponds to mdUp
    const handler = (e) => setIsMatch(e.matches);
    mediaQuery.addEventListener('change', handler);
    handler(mediaQuery);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  return isMatch;
};

const useCollapseNav = () => {
  const [collapseDesktop, setCollapseDesktop] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  return {
    collapseDesktop,
    onCollapseDesktop: () => setCollapseDesktop(prev => !prev),
    openMobile,
    onOpenMobile: () => setOpenMobile(true),
    onCloseMobile: () => setOpenMobile(false),
  };
};

// --- CONSTANTS ---
const NAV_WIDTH = 'w-[320px]';
const NAV_COLLAPSE_WIDTH = 'w-[96px]';
const paths = {
  dashboard: {
    chat: '/dashboard/chat',
  },
};

export default function ChatNav({ loading, user, contacts, conversations, selectedConversationId }) {
  const router = useRouter();
  const mdUp = useResponsive();
  const { collapseDesktop, onCollapseDesktop, openMobile, onOpenMobile, onCloseMobile } = useCollapseNav();

  const [searchContacts, setSearchContacts] = useState({
    query: '',
    results: [],
  });


  console.log("contacts mock", contacts)

  console.log("id mock", selectedConversationId)
  console.log(" mock user", user)
  console.log("contacts mock", contacts)


  useEffect(() => {
    if (!mdUp) {
      // In a real app, you might have an onCloseDesktop here.
      // For this mock hook, we'll just handle the mobile close.
    }
  }, [mdUp]);

  const handleToggleNav = useCallback(() => {
    if (mdUp) {
      onCollapseDesktop();
    } else {
      onCloseMobile();
    }
  }, [mdUp, onCloseMobile, onCollapseDesktop]);

  const handleClickCompose = useCallback(() => {
    if (!mdUp) {
      onCloseMobile();
    }
    router.push(paths.dashboard.chat);
  }, [mdUp, onCloseMobile, router]);

  const handleSearchContacts = useCallback(
    (inputValue) => {
      setSearchContacts((prevState) => ({
        ...prevState,
        query: inputValue,
      }));

      if (inputValue) {
        // Assuming contacts have a 'name' property
        const results = contacts.filter((contact) =>
          contact.displayName.toLowerCase().includes(inputValue.toLowerCase())
        );
        setSearchContacts((prevState) => ({
          ...prevState,
          results,
        }));
      }
    },
    [contacts]
  );

  const handleClickAwaySearch = useCallback(() => {
    setSearchContacts({
      query: '',
      results: [],
    });
  }, []);

  const handleClickResult = useCallback(
    (result : any) => {
      handleClickAwaySearch();
      router.push(`${paths.dashboard.chat}?id=${result.id}`);
    },
    [handleClickAwaySearch, router]
  );

  // SIDE BAR UI FOR MOBILE VIEW
  const renderToggleBtn = (
    <Button
      onClick={onOpenMobile}
      variant="ghost"
      className="fixed left-0 top-[84px] z-10 w-8 h-8 rounded-r-md bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 md:hidden"
    >
      <Users className="w-4 h-4" />
    
    </Button>
  );

  const renderSkeleton = (
    <>
      {[...Array(12)].map((_, index) => (
        <ChatNavItemSkeleton key={index} />
      ))}
    </>
  );

  //  Work on this soon 
   console.log("conversation mock", conversations)
   console.log("conversation mock.all", conversations.id)
  
  
   const renderList = (
    <>
      {conversations?.map((conversation : any) => (
        <ChatNavItem
          key={conversation.id}
          collapse={collapseDesktop}
          conversation={conversation}
          selected={conversation.id === selectedConversationId}
          onCloseMobile={onCloseMobile}
        />
      ))}
    </>
  );

  // Work tomorrow 
  const renderContent = (
    <>
      <div className="flex flex-row items-center justify-between ">
        {!collapseDesktop && (
          <div className="flex-start">
          
            <ChatNavAccount />
          </div>
        )}

        <Button variant="ghost" size="icon" onClick={handleToggleNav}>
          {collapseDesktop ? <ChevronRight /> : <ChevronLeft />}
        </Button>

      </div>

      <div className="p-2.5 pt-0">
        {!collapseDesktop && (
          <div className="relative" tabIndex={0} onBlur={handleClickAwaySearch}>
            <div className="relative mt-2.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchContacts.query}
                onChange={(event) => handleSearchContacts(event.target.value)}
                placeholder="Search contacts..."
                className="pl-10"
              />
              {searchContacts.query && (
                <div className="absolute top-12 left-0 right-0 z-20 bg-background shadow-lg rounded-lg max-h-[50vh] overflow-y-auto">
                  <ChatNavSearchResults
                    query={searchContacts.query}
                    results={searchContacts.results}
                    onClickResult={handleClickResult}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="pb-1">
        <div className="p-2.5">
          {loading && renderSkeleton}
          {/* {!searchContacts.query && !!conversations?.allIds?.length && renderList} */}
          {renderList}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <>
      {!mdUp && renderToggleBtn}

      {mdUp ? (
        <div
          className={`h-full flex-shrink-0 border-r transition-[width] duration-200 
            ${collapseDesktop ? NAV_COLLAPSE_WIDTH : NAV_WIDTH}`}
        >
          {renderContent}
      
        </div>
      ) : (
        <Sheet open={openMobile} onOpenChange={onCloseMobile} side="left">
          <SheetContent side="left" className="p-0 border-r-0" style={{ width: 320 }}>
            {renderContent}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
