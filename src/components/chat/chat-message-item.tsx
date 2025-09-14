// import PropTypes from "prop-types";
import { formatDistanceToNowStrict } from "date-fns";
import { Reply, Smile, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar"; 
import { Button } from "@/components/ui/button"; 


import { _mockUser } from "@/app/chat/hooks/_mockData";
import { useGetMessage } from "../../app/chat/hooks";

export default function ChatMessageItem({ message, participants, onOpenLightbox }) {
  const user  = _mockUser;

  const { me, senderDetails, hasImage } = useGetMessage({
    message,
    participants,
    currentUserId: `${user?.id}`,
  });

  const { firstName, avatarUrl } = senderDetails;
  const { body, createdAt } = message;

  const renderInfo = (
    <p
      className={`text-xs mb-1 text-muted-foreground truncate ${
        !me ? "mr-auto" : ""
      }`}
    >
      {!me && `${firstName},`} &nbsp;
      {formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true })}
    </p>
  );

  const renderBody = (
    <div
      className={`
        relative text-sm rounded-md 
        ${hasImage ? "p-0 bg-transparent" : "p-2"} 
        ${me ? "bg-primary/20 text-primary-foreground" : "bg-muted text-foreground"} 
        min-w-[48px] max-w-[320px]
      `}
    >
      {hasImage ? (
        <img
          src={body}
          alt="attachment"
          className="min-h-[220px] rounded-md cursor-pointer hover:opacity-90"
          onClick={() => onOpenLightbox(body)}
        />
      ) : (
        body
      )}
    </div>
  );

  const renderActions = (
    <div
      className={`
        absolute top-full mt-1 flex opacity-0 transition-opacity duration-200 
        message-actions
        ${me ? "right-0" : "left-0"}
      `}
    >
     <Button size="icon" variant="ghost" className="h-6 w-6">
        <Reply className="h-4 w-4" />
      </Button>

      <Button size="icon" variant="ghost" className="h-6 w-6">
        <Smile className="h-4 w-4" />
      </Button>

      <Button size="icon" variant="ghost" className="h-6 w-6">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div
      className={`flex items-start mb-5 ${
        me ? "justify-end" : "justify-start"
      }`}
    >
      {!me && (
        <Avatar className="h-8 w-8 mr-2">
          <img src={avatarUrl} alt={firstName} />
        </Avatar>
      )}

      <div className="flex flex-col items-end">
        {renderInfo}

        <div
          className="relative flex items-center group"
        >
          {renderBody}
          <div className="group-hover:opacity-100">{renderActions}</div>
        </div>
      </div>
    </div>
  );
}

// ChatMessageItem.propTypes = {
//   message: PropTypes.object,
//   onOpenLightbox: PropTypes.func,
//   participants: PropTypes.array,
// };
