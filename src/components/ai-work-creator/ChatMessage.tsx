import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/types/ai-work';
import { Bot, User, CheckCircle } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const processedContent = useMemo(() => {
    // 移除所有markdown语法，只保留纯文本内容
    let content = message.content;

    // 移除粗体语法 **text**
    content = content.replace(/\*\*(.*?)\*\*/g, '$1');

    // 移除斜体语法 *text* 或 _text_
    content = content.replace(/(\*|_)(.*?)\1/g, '$2');

    // 移除标题语法 # ## ###
    content = content.replace(/^#{1,6}\s+/gm, '');

    // 移除链接语法 [text](url)
    content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // 移除图片语法 ![alt](url)
    content = content.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

    // 移除代码块语法 ```code``` 或 `code`
    content = content.replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```/g, '').trim();
    });
    content = content.replace(/`([^`]+)`/g, '$1');

    // 移除列表语法 - 或 *
    content = content.replace(/^[\s]*[-*]\s+/gm, '');

    // 移除引用语法 >
    content = content.replace(/^[\s]*>\s+/gm, '');

    // 移除分割线语法 ---
    content = content.replace(/^[\s]*-{3,}\s*$/gm, '');

    // 处理换行 - 保留换行符
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