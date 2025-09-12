import { invoke } from '@tauri-apps/api/core';
import { TrayMenuItem, TrayNotification, TrayState, TrayPosition } from '../types/tray';

export class TrayService {
  private static instance: TrayService;
  private isInitialized = false;

  static getInstance(): TrayService {
    if (!TrayService.instance) {
      TrayService.instance = new TrayService();
    }
    return TrayService.instance;
  }

  /**
   * 初始化系统托盘
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 后端在应用启动时已创建托盘，这里仅做一次性配置即可
      await this.setTrayTooltip('汐律 - 智能时间管理工具');
      this.isInitialized = true;
    } catch (error) {
      console.error('初始化系统托盘失败:', error);
      throw error;
    }
  }

  /**
   * 显示系统托盘
   */
  async showTray(): Promise<void> {
    try {
      await invoke('show_tray');
    } catch (error) {
      console.error('显示系统托盘失败:', error);
      throw error;
    }
  }

  /**
   * 隐藏系统托盘
   */
  async hideTray(): Promise<void> {
    try {
      await invoke('hide_tray');
    } catch (error) {
      console.error('隐藏系统托盘失败:', error);
      throw error;
    }
  }

  /**
   * 设置托盘图标
   */
  async setTrayIcon(iconPath: string): Promise<void> {
    try {
      await invoke('set_tray_icon', { icon_path: iconPath });
    } catch (error) {
      console.error('设置托盘图标失败:', error);
      throw error;
    }
  }

  /**
   * 设置托盘提示文本
   */
  async setTrayTooltip(tooltip: string): Promise<void> {
    try {
      await invoke('set_tray_tooltip', { tooltip });
    } catch (error) {
      console.error('设置托盘提示失败:', error);
      throw error;
    }
  }

  /**
   * 更新托盘菜单
   */
  async updateTrayMenu(params: {
    show_item?: boolean;
    hide_item?: boolean;
    float_item?: boolean;
    quit_item?: boolean;
    timer_status?: string;
  }): Promise<void> {
    try {
      await invoke('update_tray_menu', params);
    } catch (error) {
      console.error('更新托盘菜单失败:', error);
      throw error;
    }
  }

  /**
   * 设置托盘右键菜单
   */
  async setTrayContextMenu(items: TrayMenuItem[]): Promise<void> {
    try {
      await invoke('set_tray_context_menu', { items });
    } catch (error) {
      console.error('设置托盘右键菜单失败:', error);
      throw error;
    }
  }

  /**
   * 显示托盘通知
   */
  async showTrayNotification(params: {
    title: string;
    body: string;
    icon?: 'info' | 'warning' | 'error' | 'success';
    duration?: number;
  }): Promise<void> {
    try {
      await invoke('show_tray_notification', {
        title: params.title,
        body: params.body,
        icon: params.icon || 'info',
        duration: params.duration || 5000
      });
    } catch (error) {
      console.error('显示托盘通知失败:', error);
      throw error;
    }
  }

  /**
   * 获取托盘可见性
   */
  async getTrayVisible(): Promise<boolean> {
    try {
      return await invoke<boolean>('is_tray_visible');
    } catch (error) {
      console.error('获取托盘可见性失败:', error);
      return false;
    }
  }

  /**
   * 获取托盘状态
   */
  async getTrayState(): Promise<{
    is_visible: boolean;
    main_window_visible: boolean;
    float_window_visible: boolean;
    timer_status: string;
  }> {
    try {
      return await invoke('get_tray_state');
    } catch (error) {
      console.error('获取托盘状态失败:', error);
      throw error;
    }
  }

  /**
   * 窗口管理方法
   */
  async showMainWindow(): Promise<void> {
    try {
      await invoke('show_main_window');
    } catch (error) {
      console.error('显示主窗口失败:', error);
      throw error;
    }
  }

  async hideMainWindow(): Promise<void> {
    try {
      await invoke('hide_main_window');
    } catch (error) {
      console.error('隐藏主窗口失败:', error);
      throw error;
    }
  }

  async toggleFloatWindow(): Promise<void> {
    try {
      await invoke('toggle_float_window');
    } catch (error) {
      console.error('切换悬浮窗失败:', error);
      throw error;
    }
  }

  async showFloatWindow(): Promise<void> {
    try {
      await invoke('show_float_window');
    } catch (error) {
      console.error('显示悬浮窗失败:', error);
      throw error;
    }
  }

  async hideFloatWindow(): Promise<void> {
    try {
      await invoke('hide_float_window');
    } catch (error) {
      console.error('隐藏悬浮窗失败:', error);
      throw error;
    }
  }

  async minimizeMainWindow(): Promise<void> {
    try {
      await invoke('minimize_main_window');
    } catch (error) {
      console.error('最小化主窗口失败:', error);
      throw error;
    }
  }

  async maximizeMainWindow(): Promise<void> {
    try {
      await invoke('maximize_main_window');
    } catch (error) {
      console.error('最大化主窗口失败:', error);
      throw error;
    }
  }

  /**
   * 获取窗口状态
   */
  async getMainWindowVisible(): Promise<boolean> {
    try {
      return await invoke<boolean>('is_main_window_visible');
    } catch (error) {
      console.error('获取主窗口可见性失败:', error);
      return false;
    }
  }

  async getFloatWindowVisible(): Promise<boolean> {
    try {
      return await invoke<boolean>('is_float_window_visible');
    } catch (error) {
      console.error('获取悬浮窗可见性失败:', error);
      return false;
    }
  }

  /**
   * 悬浮窗位置管理
   */
  async setFloatWindowPosition(position: TrayPosition): Promise<void> {
    try {
      await invoke('set_float_window_position', { 
        x: position.x, 
        y: position.y 
      });
    } catch (error) {
      console.error('设置悬浮窗位置失败:', error);
      throw error;
    }
  }

  async getFloatWindowPosition(): Promise<TrayPosition | null> {
    try {
      return await invoke<TrayPosition | null>('get_float_window_position');
    } catch (error) {
      console.error('获取悬浮窗位置失败:', error);
      return null;
    }
  }

  /**
   * 应用控制
   */
  async quitApp(): Promise<void> {
    try {
      await invoke('quit_app');
    } catch (error) {
      console.error('退出应用失败:', error);
      throw error;
    }
  }

  async getAppVersion(): Promise<string> {
    try {
      return await invoke<string>('get_app_version');
    } catch (error) {
      console.error('获取应用版本失败:', error);
      return '1.0.0';
    }
  }

  async getAppName(): Promise<string> {
    try {
      return await invoke<string>('get_app_name');
    } catch (error) {
      console.error('获取应用名称失败:', error);
      return '汐律';
    }
  }

  /**
   * 显示系统通知
   */
  async showNotification(title: string, body: string): Promise<void> {
    try {
      await invoke('show_notification', { title, body });
    } catch (error) {
      console.error('显示系统通知失败:', error);
      throw error;
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // 不再在卸载时隐藏托盘，避免反复创建/销毁
      this.isInitialized = false;
    } catch (error) {
      console.error('清理系统托盘失败:', error);
    }
  }
}

// 导出单例实例
export const trayService = TrayService.getInstance();