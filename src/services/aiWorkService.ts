import { invoke } from '@tauri-apps/api/core';
import {
  ChatMessage,
  AIResponse,
  AISession,
  ExtractedWorkData,
  MotivationData,
  CreateWorkFromAIParams,
  DialogueStage,
  QuickReplyOption,
  AIError
} from '@/types/ai-work';

export class AIWorkService {
  private static instance: AIWorkService;
  private apiKey: string;

  private constructor() {
    // 从环境变量获取API密钥
    this.apiKey = (import.meta as any).env.VITE_AI_API_KEY || '';

    if (!this.apiKey) {
      console.warn('AI API key not found. Please set VITE_AI_API_KEY environment variable.');
    }
  }

  static getInstance(): AIWorkService {
    if (!AIWorkService.instance) {
      AIWorkService.instance = new AIWorkService();
    }
    return AIWorkService.instance;
  }

  // 开始新的AI会话
  async startSession(): Promise<AISession> {
    try {
      const response = await invoke<AISession>('start_ai_session');
      return response;
    } catch (error) {
      throw this.handleError(error, 'startSession');
    }
  }

  // 发送消息并获取AI响应
  async sendMessage(
    sessionId: string,
    message: string,
    context: any
  ): Promise<AIResponse> {
    try {
      const response = await invoke<AIResponse>('send_ai_message', {
        sessionId,
        message,
        context: JSON.stringify(context)
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'sendMessage');
    }
  }

  // 提取作品信息
  async extractWorkInfo(
    sessionId: string,
    conversationHistory: ChatMessage[]
  ): Promise<ExtractedWorkData> {
    try {
      const response = await invoke<ExtractedWorkData>('extract_work_information', {
        sessionId,
        conversationHistory: JSON.stringify(conversationHistory)
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'extractWorkInfo');
    }
  }

  // 生成动机策略
  async generateMotivationStrategies(
    sessionId: string,
    workInfo: string
  ): Promise<MotivationData> {
    try {
      const response = await invoke<MotivationData>('generate_motivation_strategies', {
        sessionId,
        workInfo
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'generateMotivationStrategies');
    }
  }

  // 创建作品
  async createWorkFromAI(data: CreateWorkFromAIParams): Promise<any> {
    try {
      const response = await invoke<any>('create_work_from_ai', { ...data });
      return response;
    } catch (error) {
      throw this.handleError(error, 'createWorkFromAI');
    }
  }

  // 获取快捷回复建议
  getQuickRepliesForStage(stage: DialogueStage): QuickReplyOption[] {
    const quickRepliesMap: Record<DialogueStage, QuickReplyOption[]> = {
      greeting: [
        { id: 'greeting-1', text: '我想写一本书', action: 'send' },
        { id: 'greeting-2', text: '我想开发一个应用', action: 'send' },
        { id: 'greeting-3', text: '我想学习新技能', action: 'send' },
        { id: 'greeting-4', text: '我还不太确定', action: 'send' }
      ],
      discovery: [
        { id: 'discovery-1', text: '详细说说你的想法', action: 'send' },
        { id: 'discovery-2', text: '是什么激发了你的灵感？', action: 'send' },
        { id: 'discovery-3', text: '你希望达到什么目标？', action: 'send' },
        { id: 'discovery-4', text: '这对你很重要吗？', action: 'send' }
      ],
      information_gathering: [
        { id: 'info-1', text: '我想调整一下', action: 'send' },
        { id: 'info-2', text: '看起来不错', action: 'send' },
        { id: 'info-3', text: '继续动机分析', action: 'motivate' }
      ],
      motivation: [
        { id: 'motivation-1', text: '这个计划很好', action: 'send' },
        { id: 'motivation-2', text: '我想修改承诺', action: 'send' },
        { id: 'motivation-3', text: '确认创建', action: 'confirm' }
      ],
      confirmation: [
        { id: 'confirm-1', text: '确认创建作品', action: 'confirm' },
        { id: 'confirm-2', text: '调整信息', action: 'send' },
        { id: 'confirm-3', text: '重新开始', action: 'send' }
      ],
      completed: []
    };

    return quickRepliesMap[stage] || [];
  }

  // 验证提取的数据
  validateExtractedData(data: ExtractedWorkData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 1) {
      errors.push('作品名称不能为空');
    }

    if (data.name && data.name.length > 100) {
      errors.push('作品名称不能超过100个字符');
    }

    if (data.target_hours < 0.5 || data.target_hours > 1000) {
      errors.push('目标时间应在0.5-1000小时之间');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 格式化对话历史用于AI分析
  formatConversationHistory(messages: ChatMessage[]): string {
    return messages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`)
      .join('\n');
  }

  // 错误处理
  private handleError(error: any, operation: string): AIError {
    console.error(`AI Work Service error in ${operation}:`, error);

    let errorMessage = '操作失败';
    let errorCode = 'UNKNOWN_ERROR';
    let retryable = true;

    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      }
      if ('code' in error) {
        errorCode = String(error.code);
      }

      // 根据错误类型判断是否可重试
      if (errorCode.includes('NETWORK') || errorCode.includes('TIMEOUT')) {
        retryable = true;
      } else if (errorCode.includes('AUTH') || errorCode.includes('PERMISSION')) {
        retryable = false;
      }
    }

    const aiError: AIError = {
      code: errorCode,
      message: errorMessage,
      details: error,
      retryable,
      timestamp: new Date()
    };

    return aiError;
  }

  // 重试机制
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: AIError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = (error as any).code && (error as any).retryable !== undefined ? error as AIError : this.handleError(error as any, 'retry');

        if (!lastError.retryable || attempt === maxRetries) {
          throw lastError;
        }

        // 指数退避
        const delay = delayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // 检查API状态
  async checkAPIStatus(): Promise<{ available: boolean; message: string }> {
    try {
      // 简单的健康检查
      const testSession = await this.startSession();
      return {
        available: true,
        message: 'AI服务正常'
      };
    } catch (error) {
      return {
        available: false,
        message: `AI服务不可用: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 清理资源
  cleanup(): void {
    // 清理任何需要清理的资源
    console.log('AI Work Service cleaned up');
  }
}

// 导出单例实例
export const aiWorkService = AIWorkService.getInstance();