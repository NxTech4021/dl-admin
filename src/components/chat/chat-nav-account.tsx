'use client';

import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { LogOut, User, Settings } from "lucide-react";

// Assuming this hook is available
import { useMockedUser } from '@/app/chat/hooks/use-mocked-user';

export default function ChatNavAccount() {
  const { user } = useMockedUser();
  const [status, setStatus] = useState('online');

  const statusOptions = ['online', 'away', 'busy', 'offline'];

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <div className="relative">
                <Avatar className="w-12 h-12 cursor-pointer">
                  <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                  <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                {/* Status Badge */}
                <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background 
                  ${status === 'online' && 'bg-green-500'}
                  ${status === 'away' && 'bg-yellow-500'}
                  ${status === 'busy' && 'bg-red-500'}
                  ${status === 'offline' && 'bg-gray-500'}
                `} />
              </div>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{user?.displayName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-64 p-0">
        <div className="flex flex-row items-center space-x-2 py-2 pr-1 pl-2.5">
          <div className="flex-grow">
            <div className="font-semibold text-sm">{user?.displayName}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipContent asChild>
                <Button variant="ghost" className="text-red-500">
                  <LogOut className="w-5 h-5" />
                </Button>
              </TooltipContent>
              <TooltipContent>
                <p>Log out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator className="border-dashed my-0" />

        <div className="flex flex-col p-1">
          <div className="flex items-center space-x-2 p-2">
            <div className="relative h-4 w-4">
              {/* Status Badge in Popover */}
              <span className={`absolute h-3 w-3 rounded-full 
                ${status === 'online' && 'bg-green-500'}
                ${status === 'away' && 'bg-yellow-500'}
                ${status === 'busy' && 'bg-red-500'}
                ${status === 'offline' && 'bg-gray-500'}
              `} />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full border-none focus:ring-0 shadow-none capitalize pl-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option} className="capitalize">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="ghost" className="justify-start space-x-2">
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Button>

          <Button variant="ghost" className="justify-start space-x-2">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}