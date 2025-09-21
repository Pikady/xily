import { useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { ChatMessage as ChatMessageType } from '@/types/ai-work';

interface ChatContainerProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatContainer({
  messages,
  isTyping,
  messagesEndRef
}: ChatContainerProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
        />
      ))}

      {isTyping && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}