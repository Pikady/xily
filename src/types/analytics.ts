import { IdEntity, TimestampEntity } from './api';
import { TimerMode } from './timer';

export interface TimeRecord extends IdEntity, TimestampEntity {
  work_id: number;
  work_name?: string;
  mode: TimerMode;
  duration: number; // 时长（分钟）
  start_time: string;
  end_time: string;
  is_completed: boolean;
}

export interface AnalyticsFilters {
  date_range: {
    start: string;
    end: string;
  };
  work_ids?: number[];
  modes?: TimerMode[];
  completed?: boolean;
}

export interface TimeDistribution {
  work_id: number;
  work_name: string;
  work_color?: string;
  explore_time: number;
  utilize_time: number;
  total_time: number;
  percentage: number;
}

export interface DailyStats {
  date: string;
  total_time: number;
  explore_time: number;
  utilize_time: number;
  session_count: number;
  completed_sessions: number;
}

export interface WeeklyStats {
  week: string;
  total_time: number;
  explore_time: number;
  utilize_time: number;
  session_count: number;
  average_daily_time: number;
}

export interface MonthlyStats {
  month: string;
  total_time: number;
  explore_time: number;
  utilize_time: number;
  session_count: number;
  average_daily_time: number;
  completion_rate: number;
}

export interface TrendData {
  date: string;
  value: number;
  explore_value?: number;
  utilize_value?: number;
}

export interface ExportData {
  time_records: TimeRecord[];
  summary: {
    total_time: number;
    explore_time: number;
    utilize_time: number;
    session_count: number;
    completion_rate: number;
    date_range: {
      start: string;
      end: string;
    };
  };
}

export type ExportFormat = 'json' | 'csv' | 'pdf';
