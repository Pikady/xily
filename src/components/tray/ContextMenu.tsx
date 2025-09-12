import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TrayMenuItem, TrayContext } from '../../types/tray';
import { cn } from '../../lib/utils';

interface ContextMenuProps {
  context: TrayContext;
  onClose: () => void;
  onMenuItemClick: (itemId: string) => void;
}

export function ContextMenu({ context, onClose, onMenuItemClick }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: context.x, y: context.y });

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  // 调整菜单位置，确保不超出屏幕边界
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const { innerWidth: screenWidth, innerHeight: screenHeight } = window;
      
      let adjustedX = context.x;
      let adjustedY = context.y;

      // 右边界检查
      if (context.x + rect.width > screenWidth) {
        adjustedX = screenWidth - rect.width - 10;
      }

      // 下边界检查
      if (context.y + rect.height > screenHeight) {
        adjustedY = screenHeight - rect.height - 10;
      }

      // 左边界检查
      if (adjustedX < 10) {
        adjustedX = 10;
      }

      // 上边界检查
      if (adjustedY < 10) {
        adjustedY = 10;
      }

      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [context.x, context.y]);

  const handleMenuItemClick = useCallback((itemId: string) => {
    onMenuItemClick(itemId);
    onClose();
  }, [onMenuItemClick, onClose]);

  if (!context.visible) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-popover border border-border rounded-md shadow-lg min-w-[200px] py-1"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {context.items.map((item) => {
        if (item.separator) {
          return (
            <div
              key={item.id}
              className="h-px bg-border my-1"
            />
          );
        }

        return (
          <button
            key={item.id}
            className={cn(
              "w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
              "flex items-center space-x-2 transition-colors",
              !item.enabled && "opacity-50 cursor-not-allowed",
              item.checked && "bg-accent text-accent-foreground"
            )}
            onClick={() => item.enabled && handleMenuItemClick(item.id)}
            disabled={!item.enabled}
          >
            {item.icon && (
              <span className="w-4 h-4 flex items-center justify-center">
                {item.icon}
              </span>
            )}
            <span className="flex-1">{item.text}</span>
            {item.checked && (
              <span className="w-4 h-4 flex items-center justify-center">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// 右键菜单容器组件
interface TrayContextMenuProps {
  isVisible: boolean;
  items: TrayMenuItem[];
  position: { x: number; y: number };
  onItemClick: (itemId: string) => void;
  onClose: () => void;
}

export function TrayContextMenu({ 
  isVisible, 
  items, 
  position, 
  onItemClick, 
  onClose 
}: TrayContextMenuProps) {
  const [context, setContext] = useState<TrayContext>({
    x: position.x,
    y: position.y,
    visible: isVisible,
    items
  });

  useEffect(() => {
    setContext(prev => ({
      ...prev,
      visible: isVisible,
      x: position.x,
      y: position.y,
      items
    }));
  }, [isVisible, position, items]);

  const handleMenuItemClick = useCallback((itemId: string) => {
    onItemClick(itemId);
  }, [onItemClick]);

  return (
    <ContextMenu
      context={context}
      onClose={onClose}
      onMenuItemClick={handleMenuItemClick}
    />
  );
}