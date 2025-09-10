import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useAppStore } from '@/stores/appStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FloatWindow } from '@/components/timer/FloatWindow';
import { useFloatWindow } from '@/hooks/useFloatWindow';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed } = useUIStore();
  const { 
    isVisible: isFloatWindowVisible, 
    toggleFloatWindow, 
    expandFloatWindow 
  } = useFloatWindow();

  return (
    <>
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={!sidebarCollapsed} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* 悬浮窗 */}
      <FloatWindow
        isVisible={isFloatWindowVisible}
        onToggleVisibility={toggleFloatWindow}
        onExpand={expandFloatWindow}
      />
    </>
  );
}