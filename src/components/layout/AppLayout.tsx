import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useFloatWindow } from '@/hooks/useFloatWindow';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed } = useUIStore();
  const { toggleFloatWindow } = useFloatWindow();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={!sidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleFloatWindow={toggleFloatWindow} />
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}