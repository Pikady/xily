// 前端专用类型定义
import { ThemeMode } from './app';

// UI 状态管理
export type UIState = 'idle' | 'loading' | 'error' | 'success';
export type ViewMode = 'grid' | 'list' | 'card';

// 前端表单数据
export interface WorkFormData {
  name: string;
  description?: string;
  color?: string;
  target_hours: number;
}

// 前端分析数据展示
export interface AnalyticsData {
  timeDistribution: Array<{
    workId: number;
    workName: string;
    workColor?: string;
    exploreTime: number;
    utilizeTime: number;
    totalTime: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    totalTime: number;
    exploreTime: number;
    utilizeTime: number;
    sessionCount: number;
    completedSessions: number;
  }>;
  summary: {
    totalTime: number;
    exploreTime: number;
    utilizeTime: number;
    sessionCount: number;
    completionRate: number;
  };
}

// 用户偏好设置
export interface UserPreferences {
  theme: ThemeMode;
  language: string;
  autoStart: boolean;
  notifications: boolean;
  sounds: boolean;
}

