import { IdEntity, TimestampEntity } from './api';

export type TimerMode = 'explore' | 'utilize';

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerSession extends IdEntity, TimestampEntity {
  workId: number;
  workName?: string;
  mode: TimerMode;
  duration: number; // 预设时长（分钟）
  actualDuration: number; // 实际时长（分钟）
  remainingTime: number; // 剩余时间（秒）
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  startTime?: string;
  endTime?: string;
  pausedTime?: string;
  resumedTime?: string;
}

export interface TimerConfig {
  focusDuration: number; // 专注时长（分钟）
  shortBreak: number; // 短休息时长（分钟）
  longBreak: number; // 长休息时长（分钟）
  autoStartBreaks: boolean; // 自动开始休息
  autoStartPomodoros: boolean; // 自动开始番茄钟
  soundEnabled: boolean; // 音效开关
  notificationEnabled: boolean; // 通知开关
}

export interface CreateTimerParams {
  workId: number;
  mode: TimerMode;
  duration: number;
}

export interface TimerStats {
  totalSessions: number;
  totalTime: number;
  averageSessionTime: number;
  completionRate: number;
  modeDistribution: {
    explore: number;
    utilize: number;
  };
  dailyAverage: number;
  weeklyTrend: number;
}