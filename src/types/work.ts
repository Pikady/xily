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
  total_time: number; // 总时间（分钟）
  explore_time: number; // 探索模式时间
  utilize_time: number; // 利用模式时间
  session_count: number; // 会话次数
  completion_rate: number; // 完成率
  last_activity: string; // 最后活动时间
}