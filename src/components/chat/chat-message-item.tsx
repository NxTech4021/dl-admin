"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { Reply, Smile, Trash2, MoreHorizontal, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useGetMessage } from "@/app/chat/hooks";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

interface ChatMessageItemProps {
  message: any;
  participants: any[];
  onOpenLightbox?: (url: string) => void;
  onReply?: (message: any) => void;
  onDelete?: (messageId: string) => void;
}

export default function ChatMessageItem({
  message,
  participants,
  onOpenLightbox,
  onReply,
  onDelete,
}: ChatMessageItemProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { me, senderDetails, hasImage } = useGetMessage({
    message,
    participants,
    currentUserId: user?.id || "",
  });

  const { firstName, avatarUrl } = senderDetails;
  const messageContent = message.content || message.body || "";
  const createdAt = message.createdAt;
  const isDeleted = message.isDeleted || false;

  const handleReply = () => {
    if (onReply && !isDeleted) {
      onReply(message);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
    setShowDeleteDialog(false);
  };

  const isReplyMine = message.repliesTo?.sender?.id === user?.id;
  const replyDisplayName = isReplyMine
    ? "You"
    : message.repliesTo?.sender?.name || "User";

  const renderReplyPreview = message.repliesTo && (
    <div className="mb-3">
      <div
        className={`
        relative rounded-lg px-3 py-2 border-l-4 
        ${
          isReplyMine
            ? "border-l-brand-dark bg-blue-500/10"
            : "border-l-gray-400 bg-blue-500/10"
        }
      `}
      >
        {/* Reply header */}
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-xs font-medium text-white">
            {replyDisplayName}
          </p>
        </div>

        {/* Reply content bubble */}
        <div className="rounded-md px-3 py-2 text-xs leading-relaxed bg-muted text-black border">
          <p className="line-clamp-3">
            {message.repliesTo.isDeleted ? (
              <span className="italic flex items-center gap-1 text-gray-500">
                <Trash2 className="h-3 w-3" />
                Message deleted
              </span>
            ) : (
              message.repliesTo.content
            )}
          </p>
        </div>
      </div>
    </div>
  );

  const renderSenderName = !me && (
    <div className="mb-1">
      <p className="text-xs text-muted-foreground font-medium">{firstName}</p>
    </div>
  );

 const renderBody = isDeleted ? (
    <div
    className={`
      flex items-center gap-2 px-3 py-2 rounded-lg italic text-sm
      ${me ? "ml-auto bg-brand-light text-white" : "mr-auto bg-muted text-black"}
    `}
  >
    <Trash2 className="h-3 w-3" />
    <span>Message has been deleted</span>
  </div>
) : (
  <div
    className={`
      relative rounded-lg px-3 py-2 max-w-xs lg:max-w-md
      ${hasImage ? "p-0 bg-transparent" : ""}
      ${me ? "bg-brand-light text-white ml-auto" : "bg-muted text-foreground mr-auto"}
    `}
  >
    {/* Reply preview only when message is NOT deleted */}
    {renderReplyPreview}

    {hasImage ? (
      <Image
        src={messageContent}
        alt="attachment"
        width={400}
        height={220}
        className="min-h-[220px] w-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => onOpenLightbox?.(messageContent)}
      />
    ) : (
      <p className="text-sm whitespace-pre-wrap break-words">
        {messageContent}
      </p>
    )}
  </div>
);


  const renderTimestampAndActions = (
    <div
      className={`
        flex items-center gap-2 mt-1
        ${me ? "flex-row-reverse" : "flex-row"}
      `}
    >
      {/* Timestamp */}
      <p className="text-xs text-muted-foreground">
        {formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true })}
      </p>

      {/* Actions - only show if not deleted */}
      {!isDeleted && (
        <div
          className={`
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            flex items-center gap-1
          `}
        >
          {/* Reply Button */}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={handleReply}
            title="Reply to message"
          >
            <Reply className="h-3 w-3" />
          </Button>

          {/* React Button */}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-muted"
            title="React to message"
          >
            <Smile className="h-3 w-3" />
          </Button>

          {/* Delete Button - only for own messages */}
          {me && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleDelete}
              title="Delete message"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}

          {/* More Options */}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-muted"
            title="More options"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div
        className={`group flex gap-3 px-4 py-2 hover:bg-muted/50 ${
          me ? "flex-row-reverse" : "flex-row"
        } ${isDeleted ? "opacity-60" : ""}`}
      >
        {!me && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={avatarUrl} alt={firstName} />
            <AvatarFallback>
              {firstName?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={`flex flex-col flex-1 ${me ? "items-end" : "items-start"}`}
        >
          {renderSenderName}
          {renderBody}
          {renderTimestampAndActions}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
