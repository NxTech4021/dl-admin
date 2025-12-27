"use client";

import { useTypingIndicator } from '@/app/chat/hooks/chat';
import { useSession } from '@/lib/auth-client';
import { motion, AnimatePresence } from 'framer-motion';
import type { ThreadMember, ChatParticipant } from '@/constants/types/chat';

interface TypingIndicatorProps {
  threadId?: string;
  members?: ThreadMember[] | ChatParticipant[];
}

// Elegant wave animation for typing dots
const dotVariants = {
  initial: { y: 0, opacity: 0.4 },
  animate: (i: number) => ({
    y: [-1, 1, -1],
    opacity: [0.4, 0.8, 0.4],
    transition: {
      y: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: i * 0.12,
      },
      opacity: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: i * 0.12,
      },
    },
  }),
};

export default function TypingIndicator({ threadId, members }: TypingIndicatorProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const { typingUsers } = useTypingIndicator(threadId, members);

  const otherTypingUsers = typingUsers.filter(typingUser => typingUser.userId !== user?.id);

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0].userName} is typing`;
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0].userName} and ${otherTypingUsers[1].userName} are typing`;
    } else {
      return `${otherTypingUsers[0].userName} and ${otherTypingUsers.length - 1} others are typing`;
    }
  };

  return (
    <AnimatePresence>
      {otherTypingUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: 8, height: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="px-4 py-2.5 overflow-hidden"
        >
          <div className="flex items-center gap-2.5">
            {/* Elegant wave dots */}
            <div className="flex gap-0.5 items-center h-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={dotVariants}
                  initial="initial"
                  animate="animate"
                  className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full"
                />
              ))}
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-muted-foreground/70"
            >
              {getTypingText()}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}