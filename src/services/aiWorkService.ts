import { invoke } from '@tauri-apps/api/core';
import {
  ChatMessage,
  AIResponse,
  AISession,
  ExtractedWorkData,
  MotivationData,
  CreateWorkFromAIParams,
  DialogueStage,
  AIError
} from '@/types/ai-work';
import {
  conversationManager,
  AIServiceStatus,
  type ConversationResult,
  type AIServiceInfo
} from './ai';

export class AIWorkService {
  private static instance: AIWorkService;
  private useRealAI: boolean = false; // 控制是否使用真实AI
  private serviceStatus: AIServiceStatus = AIServiceStatus.DISABLED;

  private constructor() {
    // 检查是否配置了真实的AI API
    const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

    if (deepseekApiKey) {
      this.useRealAI = true;
      this.serviceStatus = AIServiceStatus.ENABLED;
      console.log('真实AI服务已启用 (DeepSeek)');
    } else {
      console.warn('AI API密钥未配置，使用模拟模式。设置 VITE_DEEPSEEK_API_KEY 环境变量以启用真实AI。');
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
      if (this.useRealAI) {
        // 使用真实的AI服务
        const session = await conversationManager.startSession();
        return session;
      } else {
        // 使用模拟模式
        const response = await invoke<AISession>('start_ai_session');
        return response;
      }
    } catch (error) {
      throw this.handleError(error, 'startSession');
    }
  }

  // 恢复现有会话
  async resumeSession(sessionId: string): Promise<AISession> {
    try {
      if (this.useRealAI) {
        // 尝试从缓存中获取会话
        const sessionData = conversationManager.getSession(sessionId);
        if (sessionData) {
          return sessionData.session;
        }

        // 如果缓存中没有，创建新会话
        const session = await conversationManager.startSession();
        return session;
      } else {
        // 模拟模式下，返回一个模拟的会话对象
        const mockSession: AISession = {
          id: Date.now(),
          session_id: sessionId,
          user_id: 'user',
          current_stage: 'greeting',
          status: 'active',
          context: {
            user_preferences: {},
            conversation_history: [],
            temporary_data: {
              ideas: [],
              keywords: [],
              emotions: []
            }
          },
          message_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return mockSession;
      }
    } catch (error) {
      throw this.handleError(error, 'resumeSession');
    }
  }

  // 发送消息并获取AI响应
  async sendMessage(
    sessionId: string,
    message: string,
    context: any,
    onStream?: (content: string) => void
  ): Promise<AIResponse> {
    try {
      if (this.useRealAI) {
        // 首先检查会话是否存在
        let sessionData = conversationManager.getSession(sessionId);
        let isNewSession = false;

        if (!sessionData) {
          // 如果会话不存在，重新创建会话
          console.log(`会话 ${sessionId} 不存在，重新创建会话`);
          const newSession = await conversationManager.startSession();
          sessionData = conversationManager.getSession(newSession.session_id);

          if (!sessionData) {
            throw new Error('无法创建新会话');
          }

          // 使用新会话ID
          sessionId = newSession.session_id;
          isNewSession = true;
        }

        // 发送消息
        const result: ConversationResult = await conversationManager.sendMessage(sessionId, message, {
          onStream
        });

        // 转换为AIResponse格式
        return {
          message: result.message,
          stage: result.stage,
          extracted_data: result.extractedData,
          motivation_data: result.motivationData,
          suggestions: {
            actions: result.suggestions?.actions,
          },
          metadata: {
            processing_time: result.metadata?.processingTime,
            model: result.metadata?.model,
            new_session_id: isNewSession ? sessionId : undefined
          }
        };
      } else {
        // 使用模拟模式
        const response = await invoke<AIResponse>('send_ai_message', {
          sessionId,
          message,
          context: JSON.stringify(context)
        });
        return response;
      }
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
      if (this.useRealAI) {
        // 使用真实的AI服务 - 从conversationManager获取会话数据
        const sessionData = conversationManager.getSession(sessionId);
        if (sessionData && sessionData.session.context.extracted_data) {
          return sessionData.session.context.extracted_data;
        }

        // 如果没有提取的数据，抛出错误
        throw new Error('未找到作品信息，请先进行对话');
      } else {
        // 使用模拟模式
        const response = await invoke<ExtractedWorkData>('extract_work_information', {
          sessionId,
          conversationHistory: JSON.stringify(conversationHistory)
        });
        return response;
      }
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
      if (this.useRealAI) {
        // 使用真实的AI服务 - 从conversationManager获取会话数据
        const sessionData = conversationManager.getSession(sessionId);
        if (sessionData && sessionData.session.context.motivation_data) {
          return sessionData.session.context.motivation_data;
        }

        // 如果没有动机数据，抛出错误
        throw new Error('未找到动机策略，请先进行对话');
      } else {
        // 使用模拟模式
        const response = await invoke<MotivationData>('generate_motivation_strategies', {
          sessionId,
          workInfo
        });
        return response;
      }
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
      if (this.useRealAI) {
        // 使用真实的AI服务检查
        const status = await conversationManager.checkAvailability();
        return {
          available: status.available,
          message: status.message
        };
      } else {
        // 简单的健康检查
        const testSession = await this.startSession();
        return {
          available: true,
          message: 'AI服务正常（模拟模式）'
        };
      }
    } catch (error) {
      return {
        available: false,
        message: `AI服务不可用: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 获取AI服务信息
  async getServiceInfo(): Promise<AIServiceInfo> {
    if (this.useRealAI) {
      const status = await conversationManager.checkAvailability();
      return {
        status: status.available ? AIServiceStatus.ENABLED : AIServiceStatus.ERROR,
        provider: 'deepseek',
        model: 'deepseek-chat',
        configured: true,
        lastCheck: new Date(),
        error: status.available ? undefined : status.message
      };
    } else {
      return {
        status: AIServiceStatus.DISABLED,
        provider: 'deepseek',
        model: 'mock-model',
        configured: false,
        lastCheck: new Date(),
        error: 'API密钥未配置'
      };
    }
  }

  // 更新会话数据
  async updateSessionData(
    sessionId: string,
    data: {
      extractedData?: ExtractedWorkData;
      motivationData?: MotivationData;
    }
  ): Promise<boolean> {
    if (this.useRealAI) {
      return conversationManager.updateSessionData(sessionId, data);
    } else {
      // 模拟模式下直接返回成功
      return true;
    }
  }

  // 结束会话
  async endSession(sessionId: string): Promise<boolean> {
    if (this.useRealAI) {
      return conversationManager.endSession(sessionId);
    } else {
      try {
        await invoke('end_ai_session', { sessionId });
        return true;
      } catch (error) {
        console.error('结束会话失败:', error);
        return false;
      }
    }
  }

  // 清理会话
  async clearSession(sessionId: string): Promise<void> {
    if (this.useRealAI) {
      conversationManager.clearSession(sessionId);
    }
    // 模拟模式不需要清理
  }

  // 获取会话信息
  async getSession(sessionId: string): Promise<{ session: AISession; messages: ChatMessage[] } | null> {
    if (this.useRealAI) {
      return conversationManager.getSession(sessionId);
    } else {
      // 模拟模式返回null，由前端自己管理
      return null;
    }
  }

  // 检查是否使用真实AI
  isUsingRealAI(): boolean {
    return this.useRealAI;
  }

  // 获取服务状态
  getServiceStatus(): AIServiceStatus {
    return this.serviceStatus;
  }

  // 清理资源
  cleanup(): void {
    // 清理任何需要清理的资源
    console.log('AI Work Service cleaned up');
  }
}

// 导出单例实例
export const aiWorkService = AIWorkService.getInstance();