// AI服务配置
export interface AIServiceConfig {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  // DeepSeek特定配置
  baseURL?: string;
  organization?: string;
}

// DeepSeek API配置
export const DEEPSEEK_CONFIG: Partial<AIServiceConfig> = {
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  maxTokens: 4000,
  temperature: 0.7,
  timeout: 30000, // 30秒
};

// 默认配置
export const DEFAULT_AI_CONFIG: AIServiceConfig = {
  apiEndpoint: '/v1/chat/completions',
  apiKey: '',
  model: 'deepseek-chat',
  maxTokens: 4000,
  temperature: 0.7,
  timeout: 30000,
  baseURL: 'https://api.deepseek.com/v1',
};

// AI响应格式
export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface DeepSeekChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// AI服务错误类型
export interface AIServiceError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  timestamp: Date;
}

// 错误代码枚举
export enum AIServiceErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}