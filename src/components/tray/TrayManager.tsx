import React, { useEffect, useState, useCallback } from 'react';
import { useTray } from '../../hooks/useTray';
import { TrayContextMenu } from './ContextMenu';
import { TrayMenuItem } from '../../types/tray';
import { useTimerStore } from '../../stores/timerStore';
import { useWorksStore } from '../../stores/worksStore';

interface TrayManagerProps {
  children?: React.ReactNode;
}

export function TrayManager({ children }: TrayManagerProps) {
  const {
    isVisible,
    timerStatus,
    mainWindowVisible,
    floatWindowVisible,
    showTrayNotification,
    handleTrayEvent,
    handleIconEvent,
    syncWindowState
  } = useTray();

  const timerStore = useTimerStore();
  const worksStore = useWorksStore();

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // 默认菜单项
  const [menuItems, setMenuItems] = useState<TrayMenuItem[]>([
    { id: 'show', text: '显示主窗口', enabled: true },
    { id: 'hide', text: '隐藏主窗口', enabled: true },
    { id: 'separator', text: '-', enabled: true, separator: true },
    { id: 'float', text: '显示悬浮窗', enabled: true },
    { id: 'separator2', text: '-', enabled: true, separator: true },
    { id: 'quit', text: '退出应用', enabled: true }
  ]);

  // 动态更新菜单项状态
  useEffect(() => {
    setMenuItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        switch (item.id) {
          case 'show':
            return { ...item, text: mainWindowVisible ? '隐藏主窗口' : '显示主窗口' };
          case 'hide':
            return { ...item, enabled: mainWindowVisible };
          case 'float':
            if (timerStatus === 'running') {
              return { ...item, text: '暂停计时' };
            } else if (timerStatus === 'paused') {
              return { ...item, text: '继续计时' };
            }
            return { ...item, text: floatWindowVisible ? '隐藏悬浮窗' : '显示悬浮窗' };
          default:
            return item;
        }
      });

      const isSame =
        updatedItems.length === prevItems.length &&
        updatedItems.every((u, idx) => {
          const p = prevItems[idx];
          return (
            u.id === p.id &&
            u.text === p.text &&
            u.enabled === p.enabled &&
            !!u.separator === !!p.separator &&
            !!u.checked === !!p.checked
          );
        });

      return isSame ? prevItems : updatedItems;
    });
  }, [mainWindowVisible, floatWindowVisible, timerStatus]);

  // 监听计时器事件
  useEffect(() => {
    const unsubscribe = useTimerStore.subscribe((state) => {
      // 计时器完成时显示通知
      if (state.currentSession && !state.isRunning && state.remainingTime === 0) {
        const currentWork = worksStore.works.find(w => w.id === state.currentSession?.workId);
        showTrayNotification(
          '计时完成',
          currentWork ? `作品《${currentWork.name}》的计时已完成！` : '计时已完成！'
        );
      }
    });

    return () => unsubscribe();
  }, [worksStore, showTrayNotification]);

  // 处理右键菜单
  const handleRightClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuVisible(true);
  }, []);

  // 处理菜单项点击
  const handleMenuItemClick = useCallback(async (itemId: string) => {
    try {
      switch (itemId) {
        case 'show':
        case 'hide':
          await handleTrayEvent(mainWindowVisible ? 'hide' : 'show');
          break;
        case 'float':
          if (timerStatus === 'running') {
            await handleTrayEvent('pause_timer');
          } else if (timerStatus === 'paused') {
            await handleTrayEvent('start_timer');
          } else {
            await handleTrayEvent('float');
          }
          break;
        case 'quit':
          await handleTrayEvent('quit');
          break;
      }
    } catch (error) {
      console.error('处理菜单项点击失败:', error);
    }
  }, [handleTrayEvent, mainWindowVisible, timerStatus]);

  // 关闭右键菜单
  const closeContextMenu = useCallback(() => {
    setContextMenuVisible(false);
  }, []);

  // 同步窗口状态
  useEffect(() => {
    const syncState = async () => {
      await syncWindowState();
    };

    syncState();

    // 每30秒同步一次窗口状态
    const interval = setInterval(syncState, 30000);

    return () => clearInterval(interval);
  }, [syncWindowState]);

  // 监听窗口可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      syncWindowState();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, [syncWindowState]);

  return (
    <div 
      className="relative"
      onContextMenu={handleRightClick}
    >
      {/* 右键菜单 */}
      <TrayContextMenu
        isVisible={contextMenuVisible}
        items={menuItems}
        position={contextMenuPosition}
        onItemClick={handleMenuItemClick}
        onClose={closeContextMenu}
      />
      
      {/* 子组件 */}
      {children}
    </div>
  );
}