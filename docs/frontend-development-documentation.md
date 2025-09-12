# 汐律前端开发文档

## 1. 项目概述

### 1.1 项目简介
汐律是一个基于 Tauri + TypeScript 的桌面端智能时间管理工具，通过潮汐节律理念帮助用户建立健康的学习创作节奏。本文档详细描述了前端架构、组件设计、开发流程等内容。

### 1.2 技术栈
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **桌面应用**: Tauri 2.x
- **状态管理**: Zustand
- **UI组件库**: Shadcn UI
- **样式框架**: Tailwind CSS
- **图表库**: Recharts
- **动画库**: Framer Motion
- **图标库**: Lucide React
- **表单处理**: React Hook Form + Zod
- **代码质量**: ESLint + Prettier
- **测试框架**: Vitest + Testing Library

### 1.3 开发环境
- **Node.js**: >= 18.0.0
- **包管理器**: npm
- **开发服务器**: http://localhost:1420
- **HMR端口**: 1421
- **Shadcn UI CLI**: 用于组件管理
- **Tailwind CSS**: 原子化CSS框架

## 2. 项目架构

### 2.1 目录结构
```
src/
├── components/           # Shadcn UI 组件 + 自定义组件
│   ├── ui/              # Shadcn UI 基础组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── features/        # 功能组件
│   │   ├── timer/       # 计时器相关组件
│   │   ├── works/       # 作品管理组件
│   │   ├── analytics/   # 数据分析组件
│   │   └── tide/        # 潮汐模式组件
│   ├── charts/          # 图表组件
│   ├── layout/          # 布局组件
│   └── forms/           # 表单组件
├── pages/              # 页面组件
│   ├── dashboard.tsx    # 仪表板
│   ├── works.tsx        # 作品管理
│   ├── timer.tsx        # 计时器
│   ├── analytics.tsx    # 数据分析
│   └── settings.tsx     # 设置
├── hooks/              # 自定义Hooks
├── stores/             # Zustand 状态管理
├── services/           # API服务
├── lib/                # 工具库
│   ├── utils.ts        # 通用工具函数
│   ├── validations.ts  # 表单验证
│   └── constants.ts    # 常量定义
├── types/              # TypeScript 类型定义
├── styles/             # 样式文件
│   └── globals.css     # Tailwind 全局样式
├── assets/             # 静态资源
└── App.tsx             # 应用入口
```

### 2.2 组件设计原则

#### 2.2.1 原子化设计
- **Atoms**: 基础UI元素（按钮、输入框等）
- **Molecules**: 简单组件组合（搜索框、表单项等）
- **Organisms**: 复杂功能组件（作品卡片、计时器等）
- **Templates**: 页面布局模板
- **Pages**: 完整页面

#### 2.2.2 组件规范
- 使用函数式组件和Hooks
- 单一职责原则
- 可复用性和可组合性
- 类型安全的Props
- 响应式设计
- 使用Tailwind CSS进行样式开发
- 遵循Shadcn UI的组件命名约定
- 使用clsx进行条件类名合并

### 2.3 状态管理架构

#### 2.3.1 Zustand Store结构
```typescript
// stores/index.ts
export interface AppState {
  // 作品状态
  works: Work[];
  currentWork: Work | null;
  
  // 计时器状态
  timer: TimerState;
  
  // UI状态
  ui: UIState;
  
  // 应用状态
  app: AppState;
}
```

#### 2.3.2 Store模块划分
- **worksStore**: 作品管理状态
- **timerStore**: 计时器状态
- **uiStore**: UI交互状态
- **appStore**: 应用全局状态

## 3. 核心功能模块

### 3.1 系统托盘和右键菜单系统

系统托盘和右键菜单是汐律应用的核心系统集成功能，提供后台运行时的应用控制能力。

#### 3.1.1 系统托盘管理模块

##### 托盘状态管理
```typescript
// stores/trayStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface TrayState {
  isVisible: boolean;
  tooltip: string;
  icon: string;
  menuItems: TrayMenuItem[];
  timerStatus: 'running' | 'paused' | 'stopped';
  windowState: {
    mainVisible: boolean;
    floatVisible: boolean;
  };
  notifications: TrayNotification[];
  
  // Actions
  setVisibility: (visible: boolean) => void;
  setTooltip: (tooltip: string) => void;
  setIcon: (icon: string) => void;
  updateMenuItems: (items: TrayMenuItem[]) => void;
  setTimerStatus: (status: 'running' | 'paused' | 'stopped') => void;
  updateWindowState: (state: Partial<TrayState['windowState']>) => void;
  addNotification: (notification: TrayNotification) => void;
  clearNotifications: () => void;
}

interface TrayMenuItem {
  id: string;
  text: string;
  enabled: boolean;
  checked?: boolean;
  separator?: boolean;
  icon?: string;
  action?: () => void;
}

interface TrayNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  timestamp: Date;
  duration?: number;
}

export const useTrayStore = create<TrayState>()(
  devtools(
    persist(
      (set, get) => ({
        isVisible: false,
        tooltip: '汐律 - 智能时间管理工具',
        icon: 'default',
        menuItems: [],
        timerStatus: 'stopped',
        windowState: {
          mainVisible: true,
          floatVisible: false,
        },
        notifications: [],

        setVisibility: (visible) => set({ isVisible: visible }),
        setTooltip: (tooltip) => set({ tooltip }),
        setIcon: (icon) => set({ icon }),
        updateMenuItems: (menuItems) => set({ menuItems }),
        setTimerStatus: (timerStatus) => set({ timerStatus }),
        updateWindowState: (windowState) => 
          set((state) => ({ 
            windowState: { ...state.windowState, ...windowState } 
          })),
        addNotification: (notification) => 
          set((state) => ({ 
            notifications: [...state.notifications, notification] 
          })),
        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'tray-storage',
        partialize: (state) => ({ 
          isVisible: state.isVisible,
          icon: state.icon,
          tooltip: state.tooltip,
        }),
      }
    )
  )
);
```

##### 托盘服务类
```typescript
// services/trayService.ts
import { invoke } from '@tauri-apps/api/tauri';
import { useTrayStore } from '@/stores/trayStore';

export class TrayService {
  private static instance: TrayService;

  static getInstance(): TrayService {
    if (!TrayService.instance) {
      TrayService.instance = new TrayService();
    }
    return TrayService.instance;
  }

  // 初始化系统托盘
  async init(): Promise<void> {
    try {
      await invoke('show_tray');
      await this.updateTooltip();
      await this.setupDefaultMenu();
      await this.setupEventListeners();
    } catch (error) {
      console.error('初始化系统托盘失败:', error);
    }
  }

  // 更新托盘提示文本
  async updateTooltip(): Promise<void> {
    const { tooltip, timerStatus } = useTrayStore.getState();
    const statusText = timerStatus === 'running' ? '运行中' : 
                       timerStatus === 'paused' ? '已暂停' : '已停止';
    const fullTooltip = `${tooltip} - ${statusText}`;
    
    try {
      await invoke('set_tray_tooltip', { tooltip: fullTooltip });
    } catch (error) {
      console.error('更新托盘提示失败:', error);
    }
  }

  // 设置默认菜单
  async setupDefaultMenu(): Promise<void> {
    const menuItems: TrayMenuItem[] = [
      { id: 'show', text: '显示主窗口', enabled: true },
      { id: 'hide', text: '隐藏主窗口', enabled: true },
      { id: 'separator', text: '-', enabled: true },
      { id: 'float', text: '显示悬浮窗', enabled: true },
      { id: 'separator', text: '-', enabled: true },
      { id: 'quit', text: '退出应用', enabled: true },
    ];

    try {
      await invoke('set_tray_context_menu', { items: menuItems });
      useTrayStore.getState().updateMenuItems(menuItems);
    } catch (error) {
      console.error('设置托盘菜单失败:', error);
    }
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    // 监听计时器状态变化
    useTrayStore.subscribe(
      (state) => state.timerStatus,
      (timerStatus) => {
        this.updateTooltip();
        this.updateMenuForTimerStatus(timerStatus);
      }
    );

    // 监听窗口状态变化
    useTrayStore.subscribe(
      (state) => state.windowState,
      (windowState) => {
        this.updateMenuForWindowState(windowState);
      }
    );
  }

  // 根据计时器状态更新菜单
  private async updateMenuForTimerStatus(status: string): Promise<void> {
    const menuItems = useTrayStore.getState().menuItems.map(item => {
      if (item.id === 'timer') {
        return {
          ...item,
          text: status === 'running' ? '暂停计时' : '开始计时',
          enabled: true,
        };
      }
      return item;
    });

    try {
      await invoke('update_tray_menu', { items: menuItems });
    } catch (error) {
      console.error('更新托盘菜单失败:', error);
    }
  }

  // 根据窗口状态更新菜单
  private async updateMenuForWindowState(windowState: TrayState['windowState']): Promise<void> {
    const menuItems = useTrayStore.getState().menuItems.map(item => {
      if (item.id === 'show') {
        return { ...item, enabled: !windowState.mainVisible };
      }
      if (item.id === 'hide') {
        return { ...item, enabled: windowState.mainVisible };
      }
      if (item.id === 'float') {
        return { 
          ...item, 
          text: windowState.floatVisible ? '隐藏悬浮窗' : '显示悬浮窗',
          enabled: true,
        };
      }
      return item;
    });

    try {
      await invoke('update_tray_menu', { items: menuItems });
    } catch (error) {
      console.error('更新托盘菜单失败:', error);
    }
  }

  // 显示托盘通知
  async showNotification(
    title: string, 
    body: string, 
    icon: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): Promise<void> {
    try {
      await invoke('show_tray_notification', {
        title,
        body,
        icon,
        duration: 5000,
      });

      // 添加到通知历史
      const notification: TrayNotification = {
        id: Date.now().toString(),
        title,
        body,
        icon,
        timestamp: new Date(),
        duration: 5000,
      };

      useTrayStore.getState().addNotification(notification);
    } catch (error) {
      console.error('显示托盘通知失败:', error);
    }
  }

  // 处理托盘菜单点击事件
  async handleMenuClick(menuId: string): Promise<void> {
    switch (menuId) {
      case 'show':
        await this.showMainWindow();
        break;
      case 'hide':
        await this.hideMainWindow();
        break;
      case 'float':
        await this.toggleFloatWindow();
        break;
      case 'quit':
        await this.quitApp();
        break;
      case 'timer':
        await this.toggleTimer();
        break;
      default:
        console.warn('未知的托盘菜单项:', menuId);
    }
  }

  // 显示主窗口
  private async showMainWindow(): Promise<void> {
    try {
      await invoke('show_main_window');
      useTrayStore.getState().updateWindowState({ mainVisible: true });
    } catch (error) {
      console.error('显示主窗口失败:', error);
    }
  }

  // 隐藏主窗口
  private async hideMainWindow(): Promise<void> {
    try {
      await invoke('hide_main_window');
      useTrayStore.getState().updateWindowState({ mainVisible: false });
    } catch (error) {
      console.error('隐藏主窗口失败:', error);
    }
  }

  // 切换悬浮窗
  private async toggleFloatWindow(): Promise<void> {
    try {
      await invoke('toggle_float_window');
      const currentState = useTrayStore.getState().windowState;
      useTrayStore.getState().updateWindowState({ 
        floatVisible: !currentState.floatVisible 
      });
    } catch (error) {
      console.error('切换悬浮窗失败:', error);
    }
  }

  // 退出应用
  private async quitApp(): Promise<void> {
    try {
      await invoke('quit_app');
    } catch (error) {
      console.error('退出应用失败:', error);
    }
  }

  // 切换计时器
  private async toggleTimer(): Promise<void> {
    // 这里需要与计时器store集成
    const timerStatus = useTrayStore.getState().timerStatus;
    // 实现计时器切换逻辑
  }
}
```

#### 3.1.2 右键菜单组件

##### 右键菜单组件实现
```typescript
// components/features/tray/ContextMenu.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/menu';
import { useTrayStore } from '@/stores/trayStore';
import { TrayService } from '@/services/trayService';
import { cn } from '@/lib/utils';

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ visible, x, y, onClose }: ContextMenuProps) {
  const { menuItems, timerStatus, windowState } = useTrayStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  // 处理菜单项点击
  const handleItemClick = async (itemId: string) => {
    try {
      await TrayService.getInstance().handleMenuClick(itemId);
      onClose();
    } catch (error) {
      console.error('处理菜单点击失败:', error);
    }
  };

  // 获取菜单项文本
  const getMenuItemText = (item: TrayMenuItem): string => {
    switch (item.id) {
      case 'show':
        return windowState.mainVisible ? '主窗口已显示' : '显示主窗口';
      case 'hide':
        return windowState.mainVisible ? '隐藏主窗口' : '主窗口已隐藏';
      case 'float':
        return windowState.floatVisible ? '隐藏悬浮窗' : '显示悬浮窗';
      case 'timer':
        return timerStatus === 'running' ? '暂停计时' : '开始计时';
      default:
        return item.text;
    }
  };

  // 获取菜单项启用状态
  const getMenuItemEnabled = (item: TrayMenuItem): boolean => {
    switch (item.id) {
      case 'show':
        return !windowState.mainVisible;
      case 'hide':
        return windowState.mainVisible;
      default:
        return item.enabled;
    }
  };

  // 渲染菜单项
  const renderMenuItem = (item: TrayMenuItem) => {
    if (item.separator) {
      return <MenuSeparator key="separator" />;
    }

    return (
      <MenuItem
        key={item.id}
        onClick={() => handleItemClick(item.id)}
        disabled={!getMenuItemEnabled(item)}
        className={cn(
          'flex items-center gap-2',
          !getMenuItemEnabled(item) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {item.icon && (
          <span className="w-4 h-4">{item.icon}</span>
        )}
        <span>{getMenuItemText(item)}</span>
        {item.checked && (
          <span className="ml-auto">✓</span>
        )}
      </MenuItem>
    );
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  // 调整菜单位置以确保在屏幕内
  useEffect(() => {
    if (visible && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      // 确保菜单不超出屏幕右边界
      if (x + menuRect.width > screenWidth) {
        adjustedX = screenWidth - menuRect.width - 10;
      }

      // 确保菜单不超出屏幕底部
      if (y + menuRect.height > screenHeight) {
        adjustedY = screenHeight - menuRect.height - 10;
      }

      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [visible, x, y]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <Menu>
        {menuItems.map(renderMenuItem)}
      </Menu>
    </div>
  );
}
```

##### 菜单组件样式
```typescript
// components/ui/menu.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface MenuProps {
  children: React.ReactNode;
  className?: string;
}

export function Menu({ children, className }: MenuProps) {
  return (
    <div className={cn('py-1', className)}>
      {children}
    </div>
  );
}

interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function MenuItem({ children, onClick, disabled, className }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-2 text-left text-sm hover:bg-gray-100 disabled:hover:bg-transparent disabled:text-gray-400',
        className
      )}
    >
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="my-1 border-t border-gray-200" />;
}
```

#### 3.1.3 托盘通知组件

##### 通知组件实现
```typescript
// components/features/tray/TrayNotification.tsx
import React, { useEffect, useState } from 'react';
import { useTrayStore } from '@/stores/trayStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrayNotificationComponentProps {
  notification: TrayNotification;
  onClose: (id: string) => void;
}

export function TrayNotificationComponent({ 
  notification, 
  onClose 
}: TrayNotificationComponentProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // 获取图标组件
  const getIconComponent = () => {
    switch (notification.icon) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // 自动关闭通知
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(notification.id);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <Card
      className={cn(
        'fixed top-4 right-4 z-50 w-80 shadow-lg border-l-4 transition-all duration-300',
        isClosing ? 'opacity-0 transform translate-x-full' : 'opacity-100',
        notification.icon === 'success' && 'border-l-green-500',
        notification.icon === 'warning' && 'border-l-yellow-500',
        notification.icon === 'error' && 'border-l-red-500',
        !notification.icon || notification.icon === 'info' && 'border-l-blue-500'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIconComponent()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600">
              {notification.body}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {notification.timestamp.toLocaleTimeString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="flex-shrink-0 p-1 h-auto hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 通知容器组件
export function TrayNotificationContainer() {
  const { notifications, clearNotifications } = useTrayStore();

  const handleClose = (id: string) => {
    // 从store中移除通知
    const updatedNotifications = notifications.filter(n => n.id !== id);
    useTrayStore.getState().clearNotifications();
    updatedNotifications.forEach(n => 
      useTrayStore.getState().addNotification(n)
    );
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <TrayNotificationComponent
          key={notification.id}
          notification={notification}
          onClose={handleClose}
        />
      ))}
    </div>
  );
}
```

#### 3.1.4 托盘管理主组件

##### 托盘管理组件
```typescript
// components/features/tray/TrayManager.tsx
import React, { useEffect } from 'react';
import { useTrayStore } from '@/stores/trayStore';
import { useTimerStore } from '@/stores/timerStore';
import { TrayService } from '@/services/trayService';
import { ContextMenu } from './ContextMenu';
import { TrayNotificationContainer } from './TrayNotification';

export function TrayManager() {
  const { 
    isVisible, 
    timerStatus, 
    windowState, 
    setTimerStatus,
    updateWindowState 
  } = useTrayStore();
  
  const { currentSession, isRunning } = useTimerStore();
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  // 初始化系统托盘
  useEffect(() => {
    const trayService = TrayService.getInstance();
    trayService.init();

    return () => {
      // 清理资源
    };
  }, []);

  // 同步计时器状态
  useEffect(() => {
    if (isRunning && currentSession) {
      setTimerStatus('running');
    } else if (currentSession && !currentSession.is_active) {
      setTimerStatus('paused');
    } else {
      setTimerStatus('stopped');
    }
  }, [isRunning, currentSession, setTimerStatus]);

  // 监听窗口状态变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      updateWindowState({
        mainVisible: !document.hidden,
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateWindowState]);

  // 处理右键菜单事件
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
    });
  };

  // 处理托盘图标点击事件
  const handleTrayClick = () => {
    // 左键点击切换主窗口
    const currentState = useTrayStore.getState().windowState;
    if (currentState.mainVisible) {
      TrayService.getInstance().hideMainWindow();
    } else {
      TrayService.getInstance().showMainWindow();
    }
  };

  // 处理托盘图标双击事件
  const handleTrayDoubleClick = () => {
    // 双击切换悬浮窗
    TrayService.getInstance().toggleFloatWindow();
  };

  return (
    <div 
      className="tray-manager"
      onContextMenu={handleContextMenu}
    >
      {/* 右键菜单 */}
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu({ visible: false, x: 0, y: 0 })}
      />

      {/* 通知容器 */}
      <TrayNotificationContainer />

      {/* 托盘状态指示器（开发模式下显示） */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded text-xs">
          <div>托盘状态: {isVisible ? '可见' : '隐藏'}</div>
          <div>计时器: {timerStatus}</div>
          <div>主窗口: {windowState.mainVisible ? '可见' : '隐藏'}</div>
          <div>悬浮窗: {windowState.floatVisible ? '可见' : '隐藏'}</div>
        </div>
      )}
    </div>
  );
}
```

### 3.2 潮汐节律系统

#### 3.2.1 模式设计
- **探索模式** (蓝色系): hsl(210, 40%, 50%)
- **利用模式** (橙色系): hsl(24, 100%, 50%)
- **中性模式** (灰色系): hsl(210, 40%, 96%)

#### 3.2.2 模式切换组件
```typescript
// components/features/tide/TideModeSwitch.tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TideModeSwitchProps {
  currentMode: 'explore' | 'utilize';
  onModeChange: (mode: 'explore' | 'utilize') => void;
  disabled?: boolean;
  className?: string;
}

export function TideModeSwitch({ 
  currentMode, 
  onModeChange, 
  disabled,
  className 
}: TideModeSwitchProps) {
  return (
    <div className={cn("flex rounded-lg border p-1", className)}>
      <Button
        variant={currentMode === 'explore' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('explore')}
        disabled={disabled}
        className={cn(
          "flex-1",
          currentMode === 'explore' && "bg-explore text-explore-foreground"
        )}
      >
        探索模式
      </Button>
      <Button
        variant={currentMode === 'utilize' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('utilize')}
        disabled={disabled}
        className={cn(
          "flex-1",
          currentMode === 'utilize' && "bg-utilize text-utilize-foreground"
        )}
      >
        利用模式
      </Button>
    </div>
  );
}
```

### 3.3 智能计时系统

#### 3.3.1 计时器组件
```typescript
// components/features/timer/TimerDisplay.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Play, Pause, Square, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimerDisplayProps {
  timeRemaining: number; // 剩余时间（秒）
  totalTime: number;     // 总时间（秒）
  mode: 'explore' | 'utilize';
  isRunning: boolean;
  isPaused: boolean;
  workName?: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function TimerDisplay({
  timeRemaining,
  totalTime,
  mode,
  isRunning,
  isPaused,
  workName,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset
}: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalTime - timeRemaining) / totalTime) * 100;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        {/* 进度环 */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <Progress 
            value={progress} 
            className="w-full h-full rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={cn(
                "text-4xl font-bold",
                mode === 'explore' ? "text-explore" : "text-utilize"
              )}>
                {formatTime(timeRemaining)}
              </div>
              {isPaused && (
                <div className="text-sm text-muted-foreground mt-1">
                  已暂停
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 作品信息 */}
        {workName && (
          <div className="text-center mb-6">
            <div className="text-sm text-muted-foreground">当前作品</div>
            <div className="font-medium">{workName}</div>
          </div>
        )}

        {/* 控制按钮 */}
        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button
              onClick={onStart}
              size="lg"
              className={cn(
                mode === 'explore' 
                  ? "bg-explore hover:bg-explore/90" 
                  : "bg-utilize hover:bg-utilize/90"
              )}
            >
              <Play className="w-4 h-4 mr-2" />
              开始
            </Button>
          ) : isPaused ? (
            <Button
              onClick={onResume}
              size="lg"
              className={cn(
                mode === 'explore' 
                  ? "bg-explore hover:bg-explore/90" 
                  : "bg-utilize hover:bg-utilize/90"
              )}
            >
              <Play className="w-4 h-4 mr-2" />
              继续
            </Button>
          ) : (
            <Button
              onClick={onPause}
              variant="outline"
              size="lg"
            >
              <Pause className="w-4 h-4 mr-2" />
              暂停
            </Button>
          )}
          
          <Button
            onClick={onStop}
            variant="outline"
            size="lg"
            disabled={!isRunning && !isPaused}
          >
            <Square className="w-4 h-4 mr-2" />
            停止
          </Button>
          
          <Button
            onClick={onReset}
            variant="ghost"
            size="lg"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 3.3.2 悬浮窗组件
```typescript
interface FloatWindowProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onClose: () => void;
}
```

### 3.4 作品管理系统

#### 3.4.1 作品卡片组件
```typescript
// components/features/works/WorkCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Edit, Archive, Trash2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkCardProps {
  work: Work;
  progress?: number;
  timeSpent?: number;
  onEdit?: (work: Work) => void;
  onDelete?: (workId: number) => void;
  onArchive?: (workId: number) => void;
  onSelect?: (work: Work) => void;
  isSelected?: boolean;
}

export function WorkCard({
  work,
  progress = 0,
  timeSpent = 0,
  onEdit,
  onDelete,
  onArchive,
  onSelect,
  isSelected = false
}: WorkCardProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={() => onSelect?.(work)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: work.color || 'hsl(var(--primary))' }}
            />
            <CardTitle className="text-lg">{work.name}</CardTitle>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(work);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(work.id!);
              }}
            >
              <Archive className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(work.id!);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {work.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {work.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>完成进度</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* 时间统计 */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>已投入: {formatTime(timeSpent)}</span>
          </div>
          <Badge variant="secondary">
            目标: {work.target_hours}h
          </Badge>
        </div>
        
        {/* 创建时间 */}
        <div className="text-xs text-muted-foreground">
          创建于 {new Date(work.created_at!).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 3.4.2 作品表单组件
```typescript
interface WorkFormProps {
  work?: Work;
  onSubmit: (work: Omit<Work, 'id'>) => void;
  onCancel: () => void;
}
```

### 3.5 数据分析系统

#### 3.5.1 图表组件
- **时间分布图**: 饼图/柱状图
- **趋势分析图**: 折线图
- **模式分布图**: 环形图
- **进度条图**: 水平进度条

#### 3.5.2 数据卡片组件
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon?: React.ReactNode;
}
```

## 4. 系统托盘集成和配置

### 4.1 系统托盘初始化和配置

#### 4.1.1 应用入口集成
```typescript
// src/App.tsx
import React, { useEffect } from 'react';
import { TrayManager } from '@/components/features/tray/TrayManager';
import { TrayService } from '@/services/trayService';

function App() {
  useEffect(() => {
    // 应用启动时初始化系统托盘
    const initializeTray = async () => {
      try {
        await TrayService.getInstance().init();
        console.log('系统托盘初始化成功');
      } catch (error) {
        console.error('系统托盘初始化失败:', error);
      }
    };

    initializeTray();
  }, []);

  return (
    <div className="app">
      {/* 应用主要内容 */}
      <div className="main-content">
        {/* 其他组件 */}
      </div>
      
      {/* 系统托盘管理器 */}
      <TrayManager />
    </div>
  );
}

export default App;
```

#### 4.1.2 Tauri 配置
```rust
// src-tauri/src/main.rs
use tauri::{Manager, SystemTray, SystemTrayMenu, CustomMenuItem};

// 系统托盘菜单项
const SHOW_ITEM: &str = "show";
const HIDE_ITEM: &str = "hide";
const FLOAT_ITEM: &str = "float";
const QUIT_ITEM: &str = "quit";

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 创建系统托盘
            let show_item = CustomMenuItem::new(SHOW_ITEM.to_string(), "显示主窗口");
            let hide_item = CustomMenuItem::new(HIDE_ITEM.to_string(), "隐藏主窗口");
            let float_item = CustomMenuItem::new(FLOAT_ITEM.to_string(), "显示悬浮窗");
            let quit_item = CustomMenuItem::new(QUIT_ITEM.to_string(), "退出应用");
            
            let tray_menu = SystemTrayMenu::new()
                .add_item(show_item)
                .add_item(hide_item)
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(float_item)
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(quit_item);

            let tray = SystemTray::new().with_menu(tray_menu);
            
            Ok(())
        })
        .system_tray(tray)
        .on_system_tray_event(|app, event| {
            match event {
                SystemTrayEvent::LeftClick => {
                    // 左键点击切换主窗口
                    if let Some(window) = app.get_window("main") {
                        if window.is_visible().unwrap_or(false) {
                            window.hide().unwrap();
                        } else {
                            window.show().unwrap();
                        }
                    }
                }
                SystemTrayEvent::RightClick => {
                    // 右键点击显示菜单（自动处理）
                }
                SystemTrayEvent::DoubleClick => {
                    // 双击切换悬浮窗
                    if let Some(window) = app.get_window("float") {
                        if window.is_visible().unwrap_or(false) {
                            window.hide().unwrap();
                        } else {
                            window.show().unwrap();
                        }
                    }
                }
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    match id.as_str() {
                        SHOW_ITEM => {
                            if let Some(window) = app.get_window("main") {
                                window.show().unwrap();
                            }
                        }
                        HIDE_ITEM => {
                            if let Some(window) = app.get_window("main") {
                                window.hide().unwrap();
                            }
                        }
                        FLOAT_ITEM => {
                            if let Some(window) = app.get_window("float") {
                                if window.is_visible().unwrap_or(false) {
                                    window.hide().unwrap();
                                } else {
                                    window.show().unwrap();
                                }
                            }
                        }
                        QUIT_ITEM => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### 4.1.3 托盘图标资源
```json
// src-tauri/tauri.conf.json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist",
    "withGlobalTauri": false
  },
  "package": {
    "productName": "汐律",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": true,
      "shell": {
        "all": true,
        "open": true
      },
      "window": {
        "all": true
      },
      "notification": {
        "all": true
      },
      "systemTray": {
        "all": true
      },
      "globalShortcut": {
        "all": true
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.xily.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "resources": ["icons/*"],
      "category": "Productivity"
    },
    "security": {
      "csp": null
    },
    "windows": [
      {
        "fullscreen": false,
        "resizable": true,
        "title": "汐律 - 智能时间管理工具",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "decorations": true,
        "transparent": false,
        "center": true,
        "label": "main"
      },
      {
        "label": "float",
        "width": 200,
        "height": 200,
        "resizable": false,
        "decorations": false,
        "alwaysOnTop": true,
        "skipTaskbar": true,
        "visible": false,
        "transparent": true,
        "center": true
      }
    ],
    "systemTray": {
      "iconPath": "icons/tray-icon.png",
      "iconAsTemplate": true,
      "menuOnLeftClick": false,
      "tooltip": "汐律 - 智能时间管理工具"
    }
  }
}
```

### 4.2 托盘事件处理和状态同步

#### 4.2.1 事件监听器设置
```typescript
// services/trayEventListeners.ts
import { listen } from '@tauri-apps/api/event';
import { useTrayStore } from '@/stores/trayStore';
import { useTimerStore } from '@/stores/timerStore';

export class TrayEventListeners {
  static setup(): void {
    this.setupWindowListeners();
    this.setupTimerListeners();
    this.setupTrayListeners();
  }

  private static setupWindowListeners(): void {
    // 监听窗口显示/隐藏事件
    listen('window-shown', () => {
      useTrayStore.getState().updateWindowState({ mainVisible: true });
    });

    listen('window-hidden', () => {
      useTrayStore.getState().updateWindowState({ mainVisible: false });
    });

    listen('float-window-shown', () => {
      useTrayStore.getState().updateWindowState({ floatVisible: true });
    });

    listen('float-window-hidden', () => {
      useTrayStore.getState().updateWindowState({ floatVisible: false });
    });
  }

  private static setupTimerListeners(): void {
    // 监听计时器状态变化
    listen('timer-started', () => {
      useTrayStore.getState().setTimerStatus('running');
    });

    listen('timer-paused', () => {
      useTrayStore.getState().setTimerStatus('paused');
    });

    listen('timer-stopped', () => {
      useTrayStore.getState().setTimerStatus('stopped');
    });

    listen('timer-completed', (event) => {
      const { duration, mode } = event.payload as any;
      TrayService.getInstance().showNotification(
        '计时完成',
        `您的一个${mode === 'explore' ? '探索' : '利用'}时段已完成！`,
        'success'
      );
    });
  }

  private static setupTrayListeners(): void {
    // 监听托盘菜单点击事件
    listen('tray-menu-click', (event) => {
      const { menuItemId } = event.payload as any;
      TrayService.getInstance().handleMenuClick(menuItemId);
    });

    // 监听托盘图标点击事件
    listen('tray-icon-click', (event) => {
      const { clickType } = event.payload as any;
      
      switch (clickType) {
        case 'single':
          // 切换主窗口
          const currentState = useTrayStore.getState().windowState;
          if (currentState.mainVisible) {
            TrayService.getInstance().hideMainWindow();
          } else {
            TrayService.getInstance().showMainWindow();
          }
          break;
        case 'double':
          // 切换悬浮窗
          TrayService.getInstance().toggleFloatWindow();
          break;
      }
    });
  }
}
```

#### 4.2.2 状态同步服务
```typescript
// services/stateSyncService.ts
import { useTrayStore } from '@/stores/trayStore';
import { useTimerStore } from '@/stores/timerStore';
import { useWorksStore } from '@/stores/worksStore';

export class StateSyncService {
  private static instance: StateSyncService;

  static getInstance(): StateSyncService {
    if (!StateSyncService.instance) {
      StateSyncService.instance = new StateSyncService();
    }
    return StateSyncService.instance;
  }

  // 同步所有状态到托盘
  async syncAllStates(): Promise<void> {
    await this.syncTimerState();
    await this.syncWindowState();
    await this.syncTrayMenu();
  }

  // 同步计时器状态
  private async syncTimerState(): Promise<void> {
    const { currentSession, isRunning } = useTimerStore.getState();
    const { setTimerStatus } = useTrayStore.getState();

    let status: 'running' | 'paused' | 'stopped' = 'stopped';
    
    if (currentSession) {
      status = currentSession.is_active ? 'running' : 'paused';
    }

    setTimerStatus(status);
  }

  // 同步窗口状态
  private async syncWindowState(): Promise<void> {
    // 获取实际窗口状态并同步到store
    const mainVisible = await this.getMainWindowVisibility();
    const floatVisible = await this.getFloatWindowVisibility();

    useTrayStore.getState().updateWindowState({
      mainVisible,
      floatVisible,
    });
  }

  // 同步托盘菜单
  private async syncTrayMenu(): Promise<void> {
    const { windowState, timerStatus } = useTrayStore.getState();
    
    // 根据当前状态更新菜单项
    const menuItems = [
      { id: 'show', text: '显示主窗口', enabled: !windowState.mainVisible },
      { id: 'hide', text: '隐藏主窗口', enabled: windowState.mainVisible },
      { id: 'separator', text: '-', enabled: true },
      { 
        id: 'float', 
        text: windowState.floatVisible ? '隐藏悬浮窗' : '显示悬浮窗', 
        enabled: true 
      },
      { id: 'separator', text: '-', enabled: true },
      { 
        id: 'timer', 
        text: timerStatus === 'running' ? '暂停计时' : '开始计时', 
        enabled: true 
      },
      { id: 'separator', text: '-', enabled: true },
      { id: 'quit', text: '退出应用', enabled: true },
    ];

    useTrayStore.getState().updateMenuItems(menuItems);
  }

  // 获取主窗口可见性
  private async getMainWindowVisibility(): Promise<boolean> {
    try {
      // 调用Tauri API获取窗口状态
      return await invoke<boolean>('is_main_window_visible');
    } catch {
      return true; // 默认返回可见
    }
  }

  // 获取悬浮窗可见性
  private async getFloatWindowVisibility(): Promise<boolean> {
    try {
      return await invoke<boolean>('is_float_window_visible');
    } catch {
      return false; // 默认返回不可见
    }
  }
}
```

### 4.3 托盘配置和自定义

#### 4.3.1 托盘设置界面
```typescript
// components/features/settings/TraySettings.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrayStore } from '@/stores/trayStore';
import { TrayService } from '@/services/trayService';

export function TraySettings() {
  const { isVisible, tooltip, setVisibility, setTooltip } = useTrayStore();

  const handleToggleTray = async (enabled: boolean) => {
    try {
      if (enabled) {
        await TrayService.getInstance().init();
      } else {
        await invoke('hide_tray');
      }
      setVisibility(enabled);
    } catch (error) {
      console.error('切换托盘状态失败:', error);
    }
  };

  const handleTooltipChange = async (value: string) => {
    try {
      await invoke('set_tray_tooltip', { tooltip: value });
      setTooltip(value);
    } catch (error) {
      console.error('更新托盘提示失败:', error);
    }
  };

  const handleTestNotification = async () => {
    await TrayService.getInstance().showNotification(
      '测试通知',
      '这是一个测试通知消息',
      'info'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>系统托盘设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 托盘开关 */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">启用系统托盘</h4>
            <p className="text-sm text-muted-foreground">
              在系统托盘中显示应用图标
            </p>
          </div>
          <Switch
            checked={isVisible}
            onCheckedChange={handleToggleTray}
          />
        </div>

        {/* 托盘提示文本 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">托盘提示文本</label>
          <Input
            value={tooltip}
            onChange={(e) => handleTooltipChange(e.target.value)}
            placeholder="输入托盘提示文本"
          />
        </div>

        {/* 通知测试 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">通知测试</label>
          <Button
            variant="outline"
            onClick={handleTestNotification}
            className="w-full"
          >
            发送测试通知
          </Button>
        </div>

        {/* 托盘行为设置 */}
        <div className="space-y-4">
          <h4 className="font-medium">托盘行为</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• 左键单击：切换主窗口显示/隐藏</p>
            <p>• 双击：切换悬浮窗显示/隐藏</p>
            <p>• 右键：显示上下文菜单</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 5. API服务层

### 5.1 API服务架构
```typescript
// services/api.ts
class ApiService {
  private static instance: ApiService;
  
  // 作品管理API
  async createWork(work: CreateWorkParams): Promise<number> {
    return await invoke<number>('create_work', work);
  }
  
  // 计时器API
  async startTimer(params: StartTimerParams): Promise<TimerSession> {
    return await invoke<TimerSession>('start_timer', params);
  }
  
  // 数据分析API
  async getWorkTimeDistribution(params: GetWorkTimeDistributionParams): Promise<WorkTimeStats[]> {
    return await invoke<WorkTimeStats[]>('get_work_time_distribution', params);
  }
}
```

### 5.2 错误处理
```typescript
// services/error.ts
class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 错误处理Hook
export function useApiErrorHandler() {
  const { showError } = useToast();
  
  return useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      showError(error.message);
    } else {
      showError('操作失败，请重试');
    }
  }, [showError]);
}
```

## 5. UI设计系统

### 5.1 Tailwind CSS 配置
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          explore: "hsl(var(--explore))",
          utilize: "hsl(var(--utilize))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### 5.2 Shadcn UI 组件配置
```typescript
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### 5.3 全局样式变量
```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 210 40% 50%;
    --primary-foreground: 210 40% 98%;
    --explore: 210 40% 50%;    /* 蓝色系 - 探索模式 */
    --utilize: 24 100% 50%;    /* 橙色系 - 利用模式 */
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 210 40% 50%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## 6. 路由设计

### 6.1 路由配置
```typescript
// router/routes.tsx
const routes = [
  {
    path: '/',
    element: <Dashboard />,
    title: '仪表板'
  },
  {
    path: '/works',
    element: <Works />,
    title: '作品管理'
  },
  {
    path: '/timer',
    element: <Timer />,
    title: '计时器'
  },
  {
    path: '/analytics',
    element: <Analytics />,
    title: '数据分析'
  },
  {
    path: '/settings',
    element: <Settings />,
    title: '设置'
  }
];
```

### 6.2 路由守卫
```typescript
// router/guards.tsx
export function AppRoutes() {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute>
              <route.element />
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  );
}
```

## 7. 性能优化

### 7.1 代码分割
```typescript
// 使用React.lazy进行懒加载
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Works = lazy(() => import('./pages/Works'));
const Timer = lazy(() => import('./pages/Timer'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
```

### 7.2 缓存策略
```typescript
// 使用React Query进行数据缓存
const useWorks = () => {
  return useQuery({
    queryKey: ['works'],
    queryFn: () => api.getWorks(),
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
  });
};
```

### 7.3 虚拟滚动
```typescript
// 对于大量数据的列表使用虚拟滚动
const VirtualizedWorkList = ({ works }: { works: Work[] }) => {
  return (
    <FixedSizeList
      height={400}
      itemCount={works.length}
      itemSize={80}
    >
      {({ index, style }) => (
        <div style={style}>
          <WorkCard work={works[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

## 8. 测试策略

### 8.1 单元测试
```typescript
// components/Timer.test.tsx
describe('Timer Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Timer duration={25} />);
    expect(getByText('25:00')).toBeInTheDocument();
  });
  
  it('starts timer when start button is clicked', () => {
    const { getByText } = render(<Timer duration={25} />);
    fireEvent.click(getByText('开始'));
    expect(getByText('暂停')).toBeInTheDocument();
  });
});
```

### 8.2 集成测试
```typescript
// pages/Dashboard.test.tsx
describe('Dashboard Page', () => {
  it('displays works list', async () => {
    render(<Dashboard />);
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('我的作品')).toBeInTheDocument();
    });
  });
});
```

### 8.3 E2E测试
```typescript
// e2e/timer.spec.ts
describe('Timer E2E', () => {
  it('should complete timer session', () => {
    cy.visit('/timer');
    cy.get('[data-testid="start-timer"]').click();
    cy.wait(25 * 60 * 1000); // 等待25分钟
    cy.get('[data-testid="timer-complete"]').should('be.visible');
  });
});
```

## 9. 开发流程

### 9.1 开发环境设置
```bash
# 安装依赖
npm install

# 初始化Shadcn UI
npx shadcn-ui@latest init

# 添加需要的组件
npx shadcn-ui@latest add button card input label form dialog sheet

# 启动开发服务器
npm run dev

# 启动Tauri开发环境
npm run tauri dev
```

### 9.2 代码规范
```typescript
// .eslintrc.js
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  }
};
```

### 9.3 Git提交规范
```bash
# 提交信息格式
<type>(<scope>): <description>

# 示例
feat(timer): 添加计时器暂停功能
fix(works): 修复作品删除bug
docs(readme): 更新项目文档
style(css): 优化按钮样式
```

## 10. 部署和构建

### 10.1 构建配置
```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/stores": path.resolve(__dirname, "./src/stores"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          radix: ['@radix-ui/react-slot', '@radix-ui/react-dialog'],
          lucide: ['lucide-react'],
          recharts: ['recharts'],
          zustand: ['zustand'],
          hookform: ['react-hook-form', '@hookform/resolvers'],
          zod: ['zod']
        }
      }
    }
  }
});
```

### 10.2 更新的package.json依赖
```json
{
  "name": "xily",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "shadcn": "shadcn-ui@latest"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-opener": "^2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.292.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.47.0",
    "recharts": "^2.8.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2",
    "@types/node": "^20.8.6",
    "@types/react": "^18.2.28",
    "@types/react-dom": "^18.2.13",
    "@typescript-eslint/eslint-plugin": "^6.7.5",
    "@typescript-eslint/parser": "^6.7.5",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.51.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.31",
    "prettier": "^3.0.3",
    "prettier-plugin-tailwindcss": "^0.5.6",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^4.5.0",
    "vitest": "^0.34.6"
  }
}
```

### 10.2 构建命令
```bash
# 构建前端
npm run build

# 构建Tauri应用
npm run tauri build

# 构建所有平台
npm run tauri build -- --target universal
```

## 11. 开发计划

### 11.1 第一阶段 (MVP - 2周)
- [ ] 基础项目架构搭建
- [ ] 作品管理功能
- [ ] 基础计时器功能
- [ ] 简单的悬浮窗

### 11.2 第二阶段 (核心功能 - 3周)
- [ ] 潮汐模式系统
- [ ] 完整的数据统计
- [ ] 主界面和导航
- [ ] 设置页面

### 11.3 第三阶段 (高级功能 - 2周)
- [ ] 数据分析图表
- [ ] 高级设置选项
- [ ] 性能优化
- [ ] 测试覆盖

## 12. 注意事项

### 12.1 Tauri特定考虑
- 窗口管理API的使用
- 系统托盘集成
- 文件系统访问
- 本地存储策略

### 12.2 性能考虑
- 避免频繁的API调用
- 合理使用缓存
- 优化渲染性能
- 减少包体积

### 12.3 用户体验
- 响应式设计
- 无障碍访问
- 键盘导航支持
- 深色/浅色主题

## 13. 参考资料

### 13.1 技术文档
- [React文档](https://react.dev/)
- [Tauri文档](https://tauri.app/)
- [Material-UI文档](https://mui.com/)
- [Recharts文档](https://recharts.org/)

### 13.2 设计资源
- [Material Design](https://material.io/design)
- [Figma设计稿](链接)
- [图标库](链接)

### 13.3 工具和插件
- [VS Code插件推荐](链接)
- [Chrome调试工具](链接)
- [性能分析工具](链接)

---

*本文档最后更新时间：2025年9月10日*