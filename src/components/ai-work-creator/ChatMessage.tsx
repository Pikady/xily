import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType, QuickReplyOption } from '@/types/ai-work';
import { Bot, User, CheckCircle } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuickReply?: (reply: string) => void;
}

export function ChatMessage({ message, onQuickReply }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const processedContent = useMemo(() => {
    // 简单处理markdown格式的文本
    let content = message.content;

    // 处理粗体文本
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 处理换行
    content = content.replace(/\n/g, '<br>');

    return { __html: content };
  }, [message.content]);

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && !isSystem && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : isSystem
            ? 'bg-muted text-muted-foreground text-sm'
            : 'bg-muted'
        )}
      >
        {/* 消息内容 */}
        <div
          className="prose prose-sm max-w-none [&_strong]:font-semibold [&_br]:block [&_br]:h-4"
          dangerouslySetInnerHTML={processedContent}
        />

        {/* 快捷回复 */}
        {message.metadata?.quick_replies && onQuickReply && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.metadata.quick_replies.map((reply: string, index: number) => (
              <button
                key={index}
                onClick={() => onQuickReply(reply)}
                className="px-3 py-1 bg-background/50 hover:bg-background/70 rounded-full text-sm border transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* 置信度指示器 */}
        {message.metadata?.confidence && (
          <div className="mt-2 flex items-center gap-1 text-xs opacity-70">
            <CheckCircle className="h-3 w-3" />
            置信度: {Math.round(message.metadata.confidence * 100)}%
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}