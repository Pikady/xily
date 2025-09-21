import { QuickReplyOption } from '@/types/ai-work';
import { cn } from '@/lib/utils';

interface QuickRepliesProps {
  options: QuickReplyOption[];
  onSelect: (reply: string) => void;
  className?: string;
}

export function QuickReplies({ options, onSelect, className }: QuickRepliesProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.text)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20',
            'hover:scale-105 active:scale-95'
          )}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
}