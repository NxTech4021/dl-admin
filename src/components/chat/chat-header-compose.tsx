"use client";

import { useState, useCallback } from 'react';
import { Check, ChevronsUpDown, X, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name?: string;
  displayName?: string;
  avatarUrl?: string;
  photoURL?: string;
}

interface ChatHeaderComposeProps {
  contacts: Contact[];
  onAddRecipients: (recipients: Contact[]) => void;
}

export default function ChatHeaderCompose({ 
  contacts = [], 
  onAddRecipients 
}: ChatHeaderComposeProps) {
  const [open, setOpen] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<Contact[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const handleAddRecipients = useCallback((recipients: Contact[]) => {
    setSelectedRecipients(recipients);
    onAddRecipients(recipients);
  }, [onAddRecipients]);

  const handleSelectContact = (contact: Contact) => {
    const isAlreadySelected = selectedRecipients.some(r => r.id === contact.id);
    
    if (isAlreadySelected) {
      const newRecipients = selectedRecipients.filter(r => r.id !== contact.id);
      handleAddRecipients(newRecipients);
    } else {
      const newRecipients = [...selectedRecipients, contact];
      handleAddRecipients(newRecipients);
    }
  };

  const removeRecipient = (contactId: string) => {
    const newRecipients = selectedRecipients.filter(r => r.id !== contactId);
    handleAddRecipients(newRecipients);
  };

  const filteredContacts = contacts.filter(contact => {
    const name = contact.displayName || contact.name || '';
    return name.toLowerCase().includes(searchValue.toLowerCase());
  });

  const getContactName = (contact: Contact) => contact.displayName || contact.name || 'Unknown';
  const getContactAvatar = (contact: Contact) => contact.photoURL || contact.avatarUrl;

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-sm font-medium text-foreground">To:</span>
      
      {/* Selected Recipients */}
      {selectedRecipients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedRecipients.slice(0, 3).map((recipient) => (
            <Badge
              key={recipient.id}
              variant="secondary"
              className="flex items-center gap-2 px-2 py-1"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage 
                  src={getContactAvatar(recipient)} 
                  alt={getContactName(recipient)} 
                />
                <AvatarFallback className="text-xs">
                  {getContactName(recipient).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{getContactName(recipient)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeRecipient(recipient.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {selectedRecipients.length > 3 && (
            <Badge variant="outline">
              +{selectedRecipients.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Contact Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[300px] justify-between"
          >
            <span className="text-muted-foreground">
              {selectedRecipients.length === 0 
                ? "+ Add recipients" 
                : `${selectedRecipients.length} selected`
              }
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search contacts..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-6">
                <Search className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {searchValue ? `No contacts found for "${searchValue}"` : 'No contacts available'}
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {filteredContacts.map((contact) => {
                const isSelected = selectedRecipients.some(r => r.id === contact.id);
                return (
                  <CommandItem
                    key={contact.id}
                    value={getContactName(contact)}
                    onSelect={() => handleSelectContact(contact)}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={getContactAvatar(contact)} 
                          alt={getContactName(contact)} 
                        />
                        <AvatarFallback>
                          {getContactName(contact).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Selection overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/80 rounded-full">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <span className="flex-1 text-sm">
                      {getContactName(contact)}
                    </span>
                    
                    {isSelected && (
                      <Check className={cn("ml-auto h-4 w-4 text-primary")} />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}