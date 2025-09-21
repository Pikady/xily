import { useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { QuickReplies } from './QuickReplies';
import { ChatMessage as ChatMessageType, QuickReplyOption } from '@/types/ai-work';

interface ChatContainerProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  onQuickReply: (reply: string) => void;
  quickReplies: QuickReplyOption[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatContainer({
  messages,
  isTyping,
  onQuickReply,
  quickReplies,
  messagesEndRef
}: ChatContainerProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onQuickReply={onQuickReply}
        />
      ))}

      {isTyping && <TypingIndicator />}

      {/* 快捷回复 */}
      {quickReplies.length > 0 && !isTyping && (
        <QuickReplies
          options={quickReplies}
          onSelect={onQuickReply}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}