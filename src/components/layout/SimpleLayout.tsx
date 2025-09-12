import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Timer } from 'lucide-react';
import { useFloatWindow } from '@/hooks/useFloatWindow';

export function SimpleLayout() {
  const { toggleFloatWindow } = useFloatWindow();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">汐律</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">仪表板</Link>
              <Link to="/timer" className="text-gray-600 hover:text-gray-900">计时器</Link>
              <Link to="/works" className="text-gray-600 hover:text-gray-900">作品</Link>
              <Link to="/analytics" className="text-gray-600 hover:text-gray-900">分析</Link>
              <Link to="/settings" className="text-gray-600 hover:text-gray-900">设置</Link>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFloatWindow}
              >
                <Timer className="w-4 h-4 mr-2" />
                悬浮窗
              </Button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* React Router 将在此处渲染子路由页面 */}
        <Outlet />
      </main>
    </div>
  );
}