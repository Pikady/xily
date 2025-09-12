import { useCallback, useEffect } from 'react';
import { useTrayStore } from '../stores/trayStore';
import { trayService } from '../services/trayService';
import { useTimerStore } from '../stores/timerStore';
import { useUIStore } from '../stores/uiStore';

export interface UseTrayReturn {
  // 托盘状态
  isVisible: boolean;
  tooltip: string;
  timerStatus: 'running' | 'paused' | 'stopped';
  mainWindowVisible: boolean;
  floatWindowVisible: boolean;
  
  // 托盘操作
  showTray: () => Promise<void>;
  hideTray: () => Promise<void>;
  setTrayTooltip: (tooltip: string) => Promise<void>;
  updateTrayMenu: (items: any[], timerStatus?: 'running' | 'paused' | 'stopped') => Promise<void>;
  
  // 窗口操作
  showMainWindow: () => Promise<void>;
  hideMainWindow: () => Promise<void>;
  toggleFloatWindow: () => Promise<void>;
  showFloatWindow: () => Promise<void>;
  hideFloatWindow: () => Promise<void>;
  
  // 通知操作
  showTrayNotification: (title: string, body: string, icon?: 'info' | 'warning' | 'error' | 'success') => Promise<void>;
  
  // 事件处理
  handleTrayEvent: (event: any) => Promise<void>;
  handleIconEvent: (event: any) => Promise<void>;
  
  // 状态同步
  syncWindowState: () => Promise<void>;
  refreshTrayState: () => Promise<void>;
}

export function useTray(): UseTrayReturn {
  const trayStore = useTrayStore();
  const timerStore = useTimerStore();
  const uiStore = useUIStore();

  // 监听计时器状态变化，自动更新托盘（本地判重，避免高频触发）
  useEffect(() => {
    let lastIsRunning: boolean | undefined;
    let lastState: any;

    const unsubscribe = useTimerStore.subscribe((s) => {
      if (s.isRunning !== lastIsRunning || s.state !== lastState) {
        lastIsRunning = s.isRunning;
        lastState = s.state;

        if (s.isRunning) {
          trayStore.setTimerStatus('running');
        } else if (s.state === 'paused') {
          trayStore.setTimerStatus('paused');
        } else {
          trayStore.setTimerStatus('stopped');
        }
      }
    });

    return () => unsubscribe();
  }, [trayStore]);

  // 监听主题变化，更新托盘图标
  useEffect(() => {
    const unsubscribe = useUIStore.subscribe((state) => {
      if (state.theme === 'dark') {
        trayStore.setTrayIcon('icons/tray-icon-dark.png');
      } else {
        trayStore.setTrayIcon('icons/tray-icon-light.png');
      }
    });

    return () => unsubscribe();
  }, [trayStore]);

  // 初始化托盘
  useEffect(() => {
    const initializeTray = async () => {
      try {
        await trayService.initialize();
        await trayStore.initializeTray();
      } catch (error) {
        console.error('初始化系统托盘失败:', error);
      }
    };

    initializeTray();

    // 清理函数
    return () => {
      trayService.cleanup();
    };
  }, [trayStore]);

  // 托盘操作
  const showTray = useCallback(async () => {
    await trayStore.setTrayVisible(true);
  }, [trayStore]);

  const hideTray = useCallback(async () => {
    await trayStore.setTrayVisible(false);
  }, [trayStore]);

  const setTrayTooltip = useCallback(async (tooltip: string) => {
    await trayStore.setTrayTooltip(tooltip);
  }, [trayStore]);

  const updateTrayMenu = useCallback(async (
    items: any[], 
    timerStatus?: 'running' | 'paused' | 'stopped'
  ) => {
    await trayStore.updateTrayMenu(items, timerStatus);
  }, [trayStore]);

  // 窗口操作
  const showMainWindow = useCallback(async () => {
    await trayStore.setMainWindowVisible(true);
  }, [trayStore]);

  const hideMainWindow = useCallback(async () => {
    await trayStore.setMainWindowVisible(false);
  }, [trayStore]);

  const toggleFloatWindow = useCallback(async () => {
    await trayService.toggleFloatWindow();
    await trayStore.syncWindowState();
  }, [trayStore]);

  const showFloatWindow = useCallback(async () => {
    await trayStore.setFloatWindowVisible(true);
  }, [trayStore]);

  const hideFloatWindow = useCallback(async () => {
    await trayStore.setFloatWindowVisible(false);
  }, [trayStore]);

  // 通知操作
  const showTrayNotification = useCallback(async (
    title: string, 
    body: string, 
    icon: 'info' | 'warning' | 'error' | 'success' = 'info'
  ) => {
    await trayStore.showTrayNotification(title, body, icon);
  }, [trayStore]);

  // 事件处理
  const handleTrayEvent = useCallback(async (event: any) => {
    await trayStore.handleTrayEvent(event);
  }, [trayStore]);

  const handleIconEvent = useCallback(async (event: any) => {
    await trayStore.handleIconEvent(event);
  }, [trayStore]);

  // 状态同步
  const syncWindowState = useCallback(async () => {
    await trayStore.syncWindowState();
  }, [trayStore]);

  const refreshTrayState = useCallback(async () => {
    try {
      const [isVisible, mainWindowVisible, floatWindowVisible] = await Promise.all([
        trayService.getTrayVisible(),
        trayService.getMainWindowVisible(),
        trayService.getFloatWindowVisible()
      ]);

      trayStore.updateWindowState(mainWindowVisible, floatWindowVisible);
    } catch (error) {
      console.error('刷新托盘状态失败:', error);
    }
  }, [trayStore]);

  return {
    // 托盘状态
    isVisible: trayStore.isVisible,
    tooltip: trayStore.tooltip,
    timerStatus: trayStore.timerStatus,
    mainWindowVisible: trayStore.windowState.mainVisible,
    floatWindowVisible: trayStore.windowState.floatVisible,
    
    // 托盘操作
    showTray,
    hideTray,
    setTrayTooltip,
    updateTrayMenu,
    
    // 窗口操作
    showMainWindow,
    hideMainWindow,
    toggleFloatWindow,
    showFloatWindow,
    hideFloatWindow,
    
    // 通知操作
    showTrayNotification,
    
    // 事件处理
    handleTrayEvent,
    handleIconEvent,
    
    // 状态同步
    syncWindowState,
    refreshTrayState
  };
}