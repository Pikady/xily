import React from 'react';
import { Outlet, Link } from 'react-router-dom';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

export function SimpleLayout({ children }: SimpleLayoutProps) {
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
              <Link to="/settings" className="text-gray-600 hover:text-gray-900">设置</Link>
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