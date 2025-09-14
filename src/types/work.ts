import { IdEntity, TimestampEntity, SoftDeleteEntity } from './api';

export interface Work extends IdEntity, TimestampEntity, SoftDeleteEntity {
  name: string;
  description?: string;
  color?: string;
  target_hours: number;
  is_archived: boolean;
}

export interface CreateWorkParams {
  name: string;
  description?: string;
  color?: string;
  target_hours: number;
}


export interface UpdateWorkParams extends Partial<CreateWorkParams> {
  id: number;
}

export interface WorkStats {
  work_id: number;
  target_hours: number;
  total_minutes: number; // 总时间（分钟）
  session_count: number; // 会话次数
  avg_duration: number; // 平均时长
  progress_percentage: number; // 完成率
  explore_time: number; // 探索模式时间（分钟）
  utilize_time: number; // 利用模式时间（分钟）
}