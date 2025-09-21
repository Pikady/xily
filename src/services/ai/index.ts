// AI服务模块导出
export * from './config';
export * from './deepseekClient';
export * from './promptBuilder';
export * from './conversationManager';

// 便捷导出
export { deepSeekClient } from './deepseekClient';
export { conversationManager } from './conversationManager';
export { PromptBuilder } from './promptBuilder';

// 服务状态
export enum AIServiceStatus {
  DISABLED = 'disabled',
  ENABLED = 'enabled',
  ERROR = 'error',
  RATE_LIMITED = 'rate_limited',
}

// 服务信息
export interface AIServiceInfo {
  status: AIServiceStatus;
  provider: 'deepseek' | 'openai' | 'other';
  model: string;
  configured: boolean;
  lastCheck?: Date;
  error?: string;
}