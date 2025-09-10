import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { state } = useApp();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={state.sidebar_open} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}