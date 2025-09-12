import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { TrayState, TrayMenuItem, TrayNotification, TrayMenuEvent, TrayIconEvent } from '../types/tray';
import { invoke } from '@tauri-apps/api/core';

// 前端侧托盘菜单调用的简单节流与判重
let __lastTrayMenuStatus = '' as 'running' | 'paused' | 'stopped' | '';
let __lastTrayMenuSentAt = 0;
let __setTimerStatusDebounce: ReturnType<typeof setTimeout> | null = null;

export interface TrayActions {
  // 托盘状态管理
  setTrayVisible: (visible: boolean) => Promise<void>;
  setTrayTooltip: (tooltip: string) => Promise<void>;
  setTrayIcon: (iconPath: string) => Promise<void>;
  
  // 菜单管理
  updateTrayMenu: (items: TrayMenuItem[], timerStatus?: 'running' | 'paused' | 'stopped') => Promise<void>;
  setTrayContextMenu: (items: TrayMenuItem[]) => Promise<void>;
  
  // 通知管理
  showTrayNotification: (title: string, body: string, icon?: 'info' | 'warning' | 'error' | 'success') => Promise<void>;
  addNotification: (notification: TrayNotification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // 窗口状态同步
  setMainWindowVisible: (visible: boolean) => Promise<void>;
  setFloatWindowVisible: (visible: boolean) => Promise<void>;
  syncWindowState: () => Promise<void>;
  
  // 事件处理
  handleTrayEvent: (event: TrayMenuEvent) => Promise<void>;
  handleIconEvent: (event: TrayIconEvent) => Promise<void>;
  
  // 状态更新
  setTimerStatus: (status: 'running' | 'paused' | 'stopped') => void;
  updateWindowState: (mainVisible?: boolean, floatVisible?: boolean) => void;
  
  // 初始化和清理
  initializeTray: () => Promise<void>;
  cleanupTray: () => Promise<void>;
}

const initialState: TrayState = {
  isVisible: false,
  tooltip: '汐律 - 智能时间管理工具',
  icon: 'icons/tray-icon.png',
  menuItems: [
    { id: 'show', text: '显示主窗口', enabled: true },
    { id: 'hide', text: '隐藏主窗口', enabled: true },
    { id: 'separator', text: '-', enabled: true, separator: true },
    { id: 'float', text: '显示悬浮窗', enabled: true },
    { id: 'separator2', text: '-', enabled: true, separator: true },
    { id: 'quit', text: '退出应用', enabled: true }
  ],
  timerStatus: 'stopped',
  windowState: {
    mainVisible: true,
    floatVisible: false
  },
  notifications: []
};

export const useTrayStore = create<TrayState & TrayActions>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,

        // 托盘状态管理
        setTrayVisible: async (visible: boolean) => {
          try {
            if (visible) {
              await invoke('show_tray');
            } else {
              await invoke('hide_tray');
            }
            set(state => {
              state.isVisible = visible;
            });
          } catch (error) {
            console.error('设置托盘可见性失败:', error);
          }
        },

        setTrayTooltip: async (tooltip: string) => {
          try {
            const current = get().tooltip;
            if (current === tooltip) return;
            await invoke('set_tray_tooltip', { tooltip });
            set(state => {
              state.tooltip = tooltip;
            });
          } catch (error) {
            console.error('设置托盘提示失败:', error);
          }
        },

        setTrayIcon: async (iconPath: string) => {
          try {
            await invoke('set_tray_icon', { icon_path: iconPath });
            set(state => {
              state.icon = iconPath;
            });
          } catch (error) {
            console.error('设置托盘图标失败:', error);
          }
        },

        // 菜单管理
        updateTrayMenu: async (items: TrayMenuItem[], timerStatus?: 'running' | 'paused' | 'stopped') => {
          try {
            const state = get();
            const status = timerStatus || state.timerStatus;

            // 1s 内相同状态不重复下发
            const now = Date.now();
            if (__lastTrayMenuStatus === status && now - __lastTrayMenuSentAt < 1000) {
              return;
            }
            
            // 动态更新菜单项文本
            const updatedItems = items.map(item => {
              if (item.id === 'float' && status === 'running') {
                return { ...item, text: '暂停计时' };
              }
              if (item.id === 'float' && status === 'paused') {
                return { ...item, text: '继续计时' };
              }
              return item;
            });

            await invoke('update_tray_menu', {
              showItem: true,
              hideItem: true,
              floatItem: true,
              quitItem: true,
              timerStatus: status
            });

            __lastTrayMenuStatus = status;
            __lastTrayMenuSentAt = now;

            set(state => {
              state.menuItems = updatedItems;
            });
          } catch (error) {
            console.error('更新托盘菜单失败:', error);
          }
        },

        setTrayContextMenu: async (items: TrayMenuItem[]) => {
          try {
            await invoke('set_tray_context_menu', { items });
            set(state => {
              state.menuItems = items;
            });
          } catch (error) {
            console.error('设置托盘右键菜单失败:', error);
          }
        },

        // 通知管理
        showTrayNotification: async (title: string, body: string, icon = 'info') => {
          try {
            await invoke('show_tray_notification', {
              title,
              body,
              icon,
              duration: 5000
            });

            const notification: TrayNotification = {
              id: Date.now().toString(),
              title,
              body,
              icon,
              duration: 5000,
              timestamp: new Date()
            };

            set(state => {
              state.notifications.push(notification);
            });

            // 5秒后自动移除通知
            setTimeout(() => {
              get().removeNotification(notification.id);
            }, 5000);
          } catch (error) {
            console.error('显示托盘通知失败:', error);
          }
        },

        addNotification: (notification: TrayNotification) => {
          set(state => {
            state.notifications.push(notification);
          });
        },

        removeNotification: (id: string) => {
          set(state => {
            state.notifications = state.notifications.filter(n => n.id !== id);
          });
        },

        clearNotifications: () => {
          set(state => {
            state.notifications = [];
          });
        },

        // 窗口状态同步
        setMainWindowVisible: async (visible: boolean) => {
          try {
            if (visible) {
              await invoke('show_main_window');
            } else {
              await invoke('hide_main_window');
            }
            set(state => {
              state.windowState.mainVisible = visible;
            });
          } catch (error) {
            console.error('设置主窗口可见性失败:', error);
          }
        },

        setFloatWindowVisible: async (visible: boolean) => {
          try {
            if (visible) {
              await invoke('show_float_window');
            } else {
              await invoke('hide_float_window');
            }
            set(state => {
              state.windowState.floatVisible = visible;
            });
          } catch (error) {
            console.error('设置悬浮窗可见性失败:', error);
          }
        },

        syncWindowState: async () => {
          try {
            const [mainVisible, floatVisible] = await Promise.all([
              invoke<boolean>('is_main_window_visible'),
              invoke<boolean>('is_float_window_visible')
            ]);

            set(state => {
              state.windowState.mainVisible = mainVisible;
              state.windowState.floatVisible = floatVisible;
            });
          } catch (error) {
            console.error('同步窗口状态失败:', error);
          }
        },

        // 事件处理
        handleTrayEvent: async (event: TrayMenuEvent) => {
          try {
            switch (event) {
              case 'show':
                await get().setMainWindowVisible(true);
                break;
              case 'hide':
                await get().setMainWindowVisible(false);
                break;
              case 'float':
                await invoke('toggle_float_window');
                await get().syncWindowState();
                break;
              case 'quit':
                await invoke('quit_app');
                break;
              case 'start_timer':
                // 这里需要与计时器store集成
                break;
              case 'pause_timer':
                // 这里需要与计时器store集成
                break;
              case 'stop_timer':
                // 这里需要与计时器store集成
                break;
            }
          } catch (error) {
            console.error('处理托盘事件失败:', error);
          }
        },

        handleIconEvent: async (event: TrayIconEvent) => {
          try {
            switch (event) {
              case 'left_click':
                // 左键单击：切换主窗口显示/隐藏
                const mainVisible = get().windowState.mainVisible;
                await get().setMainWindowVisible(!mainVisible);
                break;
              case 'double_click':
                // 双击：切换悬浮窗显示/隐藏
                await invoke('toggle_float_window');
                await get().syncWindowState();
                break;
              case 'right_click':
                // 右键：显示上下文菜单
                // 这个事件通常由系统自动处理
                break;
            }
          } catch (error) {
            console.error('处理托盘图标事件失败:', error);
          }
        },

        // 状态更新
        setTimerStatus: (status: 'running' | 'paused' | 'stopped') => {
          const current = get().timerStatus;
          if (current !== status) {
            set(state => {
              state.timerStatus = status;
            });
            // 轻度防抖，聚合短时间内的多次状态变更
            if (__setTimerStatusDebounce) {
              clearTimeout(__setTimerStatusDebounce);
            }
            __setTimerStatusDebounce = setTimeout(() => {
              get().updateTrayMenu(get().menuItems, get().timerStatus);
            }, 300);
          }
        },

        updateWindowState: (mainVisible?: boolean, floatVisible?: boolean) => {
          set(state => {
            if (mainVisible !== undefined) {
              state.windowState.mainVisible = mainVisible;
            }
            if (floatVisible !== undefined) {
              state.windowState.floatVisible = floatVisible;
            }
          });
        },

        // 初始化和清理
        initializeTray: async () => {
          try {
            // 托盘由后端在启动时创建，这里仅同步状态与更新菜单/提示
            await get().setTrayTooltip('汐律 - 智能时间管理工具');
            await get().updateTrayMenu(get().menuItems);
            await get().syncWindowState();
          } catch (error) {
            console.error('初始化系统托盘失败:', error);
          }
        },

        cleanupTray: async () => {
          try {
            // 不主动隐藏托盘，避免反复创建/销毁
            get().clearNotifications();
          } catch (error) {
            console.error('清理系统托盘失败:', error);
          }
        }
      })),
      {
        name: 'tray-storage',
        partialize: (state) => ({
          isVisible: state.isVisible,
          tooltip: state.tooltip,
          icon: state.icon,
          windowState: state.windowState
        })
      }
    )
  )
);