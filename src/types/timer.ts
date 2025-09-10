import { IdEntity, TimestampEntity } from './api';

export type TimerMode = 'explore' | 'utilize';

export interface TimerSession extends IdEntity, TimestampEntity {
  work_id: number;
  work_name?: string;
  mode: TimerMode;
  duration: number; // 预设时长（分钟）
  actual_duration: number; // 实际时长（分钟）
  remaining_time: number; // 剩余时间（秒）
  is_active: boolean;
  is_paused: boolean;
  is_completed: boolean;
  start_time?: string;
  end_time?: string;
  paused_time?: string;
  resumed_time?: string;
}

export interface TimerConfig {
  focus_duration: number; // 专注时长（分钟）
  short_break: number; // 短休息时长（分钟）
  long_break: number; // 长休息时长（分钟）
  auto_start_breaks: boolean; // 自动开始休息
  auto_start_pomodoros: boolean; // 自动开始番茄钟
  sound_enabled: boolean; // 音效开关
  notification_enabled: boolean; // 通知开关
}

export interface CreateTimerParams {
  work_id: number;
  mode: TimerMode;
  duration: number;
}

export interface TimerStats {
  total_sessions: number;
  total_time: number;
  average_session_time: number;
  completion_rate: number;
  mode_distribution: {
    explore: number;
    utilize: number;
  };
  daily_average: number;
  weekly_trend: number;
}