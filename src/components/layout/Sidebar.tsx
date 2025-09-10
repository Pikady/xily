import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Timer, 
  BarChart3, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: '仪表板', icon: LayoutDashboard },
  { path: '/works', label: '作品管理', icon: FolderOpen },
  { path: '/timer', label: '计时器', icon: Timer },
  { path: '/analytics', label: '数据分析', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: SettingsIcon },
];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { dispatch } = useApp();
  const location = useLocation();

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  return (
    <aside className={cn(
      "bg-background border-r transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="flex flex-col h-full">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          {isOpen && (
            <h1 className="text-xl font-bold">汐律</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </Button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon size={18} />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}