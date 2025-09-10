import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Bell, Settings, User, Moon, Sun, Timer } from 'lucide-react';

interface HeaderProps {
  onToggleFloatWindow: () => Promise<void>;
}

export function Header({ onToggleFloatWindow }: HeaderProps) {
  const { state, dispatch } = useApp();

  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">
            欢迎使用汐律
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* 浮动窗按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFloatWindow}
          >
            <Timer className="w-4 h-4 mr-2" />
            悬浮窗
          </Button>

          {/* 主题切换 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
          >
            {state.theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* 通知 */}
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>

          {/* 用户菜单 */}
          <Button variant="ghost" size="sm">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}