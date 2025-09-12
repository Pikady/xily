// 系统托盘相关类型定义

export interface TrayMenuItem {
  id: string;
  text: string;
  enabled: boolean;
  checked?: boolean;
  separator?: boolean;
  icon?: string;
}

export interface TrayNotification {
  id: string;
  title: string;
  body: string;
  icon: 'info' | 'warning' | 'error' | 'success';
  duration: number;
  timestamp: Date;
}

export interface TrayState {
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
}

export interface TrayContext {
  x: number;
  y: number;
  visible: boolean;
  items: TrayMenuItem[];
}

export type TrayMenuEvent = 
  | 'show'
  | 'hide'
  | 'float'
  | 'quit'
  | 'start_timer'
  | 'pause_timer'
  | 'stop_timer';

export type TrayIconEvent = 
  | 'left_click'
  | 'double_click'
  | 'right_click';

export interface TrayPosition {
  x: number;
  y: number;
}

export interface TrayConfig {
  icon: string;
  tooltip: string;
  menuItems: TrayMenuItem[];
  showOnStartup: boolean;
  minimizeToTray: boolean;
}