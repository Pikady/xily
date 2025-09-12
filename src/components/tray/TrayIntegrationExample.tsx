import React, { useEffect } from 'react';
import { TrayManager, NotificationCenter } from '.';
import { useTrayStore } from '@/stores/trayStore';
import { useTimerStore } from '@/stores/timerStore';
import { useWorksStore } from '@/stores/worksStore';

/**
 * 应用程序托盘集成示例
 * 
 * 这个组件展示了如何将系统托盘功能集成到主应用程序中
 * 它应该被放置在应用程序的根组件中
 */
export function TrayIntegrationExample({ children }: { children?: React.ReactNode }) {
  const trayStore = useTrayStore();
  const timerStore = useTimerStore();
  const worksStore = useWorksStore();

  // 监听计时器状态变化，更新托盘状态
  useEffect(() => {
    const unsubscribe = useTimerStore.subscribe((state) => {
      // 更新托盘状态
      if (state.isRunning) {
        trayStore.setTimerStatus('running');
        
        // 更新托盘提示文本
        const currentWork = worksStore.works.find(w => w.id === state.currentSession?.workId);
        const tooltip = currentWork 
          ? `汐律 - 正在专注《${currentWork.name}》` 
          : '汐律 - 计时进行中';
        trayStore.setTrayTooltip(tooltip);
      } else if (state.state === 'paused') {
        trayStore.setTimerStatus('paused');
        trayStore.setTrayTooltip('汐律 - 计时已暂停');
      } else {
        trayStore.setTimerStatus('stopped');
        trayStore.setTrayTooltip('汐律 - 智能时间管理工具');
      }
    });

    return () => unsubscribe();
  }, [worksStore, trayStore]);

  // 监听作品变化，更新托盘菜单
  useEffect(() => {
    const unsubscribe = useWorksStore.subscribe((state) => {
      // 可以根据作品列表动态更新托盘菜单
      // 例如：添加快速切换作品的菜单项
    });

    return () => unsubscribe();
  }, [trayStore]);

  // 监听全局错误，显示托盘通知
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trayStore.showTrayNotification(
        '发生错误',
        event.message || '应用程序遇到错误',
        'error'
      );
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [trayStore]);

  return (
    <TrayManager>
      {/* 主应用程序内容 */}
      <div className="min-h-screen bg-background">
        {children}
        
        {/* 通知中心 - 显示托盘通知 */}
        <NotificationCenter
          notifications={trayStore.notifications}
          onClose={(id) => trayStore.removeNotification(id)}
          onClearAll={() => trayStore.clearNotifications()}
        />
      </div>
    </TrayManager>
  );
}

/**
 * 在主应用中使用的示例
 */
export function MainAppWithTray() {
  return (
    <TrayIntegrationExample>
      {/* 你的其他应用组件 */}
      <div>
        <h1>汐律 - 智能时间管理工具</h1>
        <p>应用程序主内容</p>
      </div>
    </TrayIntegrationExample>
  );
}

/**
 * 托盘功能使用示例
 * 
 * 这些示例展示了如何在应用的不同部分使用托盘功能
 */
export function TrayUsageExamples() {
  const trayStore = useTrayStore();
  const { showTrayNotification } = useTrayStore();

  // 示例1：在计时器完成时显示通知
  const handleTimerComplete = () => {
    showTrayNotification(
      '计时完成',
      '恭喜！您已完成一个番茄钟时段',
      'success'
    );
  };

  // 示例2：在作品创建时显示通知
  const handleWorkCreated = (workName: string) => {
    showTrayNotification(
      '作品已创建',
      `作品《${workName}》已成功创建`,
      'info'
    );
  };

  // 示例3：在发生错误时显示通知
  const handleError = (errorMessage: string) => {
    showTrayNotification(
      '操作失败',
      errorMessage,
      'error'
    );
  };

  // 示例4：切换窗口状态
  const toggleMainWindow = async () => {
    const isVisible = trayStore.windowState.mainVisible;
    await trayStore.setMainWindowVisible(!isVisible);
  };

  // 示例5：显示悬浮窗
  const showFloatWindow = async () => {
    await trayStore.setFloatWindowVisible(true);
  };

  return (
    <div className="space-y-4">
      <h2>托盘功能示例</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleTimerComplete}
          className="p-2 bg-blue-500 text-white rounded"
        >
          模拟计时完成通知
        </button>
        
        <button
          onClick={() => handleWorkCreated('新作品')}
          className="p-2 bg-green-500 text-white rounded"
        >
          模拟作品创建通知
        </button>
        
        <button
          onClick={() => handleError('网络连接失败')}
          className="p-2 bg-red-500 text-white rounded"
        >
          模拟错误通知
        </button>
        
        <button
          onClick={toggleMainWindow}
          className="p-2 bg-purple-500 text-white rounded"
        >
          切换主窗口
        </button>
        
        <button
          onClick={showFloatWindow}
          className="p-2 bg-orange-500 text-white rounded"
        >
          显示悬浮窗
        </button>
      </div>
    </div>
  );
}