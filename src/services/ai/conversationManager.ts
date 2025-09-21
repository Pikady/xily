import {
  ChatMessage,
  DialogueStage,
  ExtractedWorkData,
  MotivationData,
  AISession
} from '@/types/ai-work';
import { PromptBuilder, PromptContext } from './promptBuilder';
import { deepSeekClient } from './deepseekClient';
import { AIServiceError } from './config';

export interface ConversationResult {
  message: string;
  stage?: DialogueStage;
  extractedData?: ExtractedWorkData;
  motivationData?: MotivationData;
  suggestions?: {
    quickReplies?: string[];
    actions?: string[];
  };
  metadata?: {
    processingTime?: number;
    tokensUsed?: number;
    model?: string;
  };
}

export interface ConversationManagerConfig {
  maxHistoryLength?: number;
  enableAutoExtraction?: boolean;
  enableStageTransition?: boolean;
  streamResponse?: boolean;
}

export class ConversationManager {
  private config: Required<ConversationManagerConfig>;
  private sessionCache: Map<string, {
    session: AISession;
    messages: ChatMessage[];
    context: PromptContext;
  }> = new Map();

  constructor(config?: ConversationManagerConfig) {
    this.config = {
      maxHistoryLength: config?.maxHistoryLength ?? 50,
      enableAutoExtraction: config?.enableAutoExtraction ?? true,
      enableStageTransition: config?.enableStageTransition ?? true,
      streamResponse: config?.streamResponse ?? false,
    };
  }

  // 开始新的会话
  async startSession(
    userId?: string,
    userPreferences?: PromptContext['userPreferences']
  ): Promise<AISession> {
    const sessionId = this.generateSessionId();
    const now = new Date();

    const session: AISession = {
      id: Date.now(), // 使用数字ID而不是字符串
      session_id: sessionId,
      user_id: userId,
      current_stage: 'greeting',
      status: 'active',
      context: {
        user_preferences: userPreferences,
        conversation_history: [],
        temporary_data: {
          ideas: [],
          keywords: [],
          emotions: [],
        },
      },
      message_count: 0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const context: PromptContext = {
      stage: 'greeting',
      messages: [],
      userPreferences,
    };

    this.sessionCache.set(sessionId, {
      session,
      messages: [],
      context,
    });

    return session;
  }

  // 发送消息并获取AI响应
  async sendMessage(
    sessionId: string,
    content: string,
    options?: {
      metadata?: Record<string, any>;
      forceStage?: DialogueStage;
      skipExtraction?: boolean;
    }
  ): Promise<ConversationResult> {
    const startTime = Date.now();

    // 获取会话信息
    let sessionData = this.sessionCache.get(sessionId);
    if (!sessionData) {
      // 如果会话不存在，自动创建新会话
      console.log(`会话 ${sessionId} 不存在，自动创建新会话`);
      const newSession = await this.startSession();
      sessionData = this.sessionCache.get(newSession.session_id);

      if (!sessionData) {
        throw new Error('无法创建新会话');
      }
    }

    const { session, messages, context } = sessionData;

    // 创建用户消息
    const userMessage: ChatMessage = {
      id: this.generateMessageId(),
      session_id: sessionId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        ...options?.metadata,
        type: 'text',
      },
    };

    // 添加到消息历史
    messages.push(userMessage);
    session.message_count += 1;

    // 更新上下文
    context.messages = messages;
    context.stage = options?.forceStage || session.current_stage;

    try {
      // 构建AI请求
      const aiMessages = PromptBuilder.buildMessages(context);

      // 发送请求到AI
      let aiResponseContent: string;
      let tokensUsed = 0;

      if (this.config.streamResponse) {
        // 流式响应（暂不实现，保留接口）
        const response = await deepSeekClient.chat(aiMessages);
        aiResponseContent = response.choices[0].message.content;
        tokensUsed = response.usage.total_tokens;
      } else {
        // 普通响应
        const response = await deepSeekClient.chat(aiMessages);
        aiResponseContent = response.choices[0].message.content;
        tokensUsed = response.usage.total_tokens;
      }

      // 创建AI消息
      const aiMessage: ChatMessage = {
        id: this.generateMessageId(),
        session_id: sessionId,
        role: 'assistant',
        content: aiResponseContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          type: 'text',
          stage: session.current_stage,
        },
      };

      // 添加到消息历史
      messages.push(aiMessage);
      session.message_count += 1;

      // 自动数据提取
      let extractedData: ExtractedWorkData | undefined;
      let motivationData: MotivationData | undefined;

      if (this.config.enableAutoExtraction && !options?.skipExtraction) {
        const extracted = await this.performDataExtraction(sessionId, context);
        extractedData = extracted.extractedData;
        motivationData = extracted.motivationData;

        // 更新上下文
        if (extractedData) {
          context.extractedData = extractedData;
          session.context.extracted_data = extractedData;
        }
        if (motivationData) {
          context.motivationData = motivationData;
          session.context.motivation_data = motivationData;
        }
      }

      // 自动阶段转换
      if (this.config.enableStageTransition) {
        const newStage = this.determineNextStage(
          session.current_stage,
          context,
          aiResponseContent
        );

        if (newStage !== session.current_stage) {
          session.current_stage = newStage;
          context.stage = newStage;
          aiMessage.metadata!.stage = newStage;
        }
      }

      // 生成快捷回复建议
      const quickReplies = PromptBuilder.buildQuickReplySuggestions(
        session.current_stage,
        content
      );

      // 更新会话时间
      session.updated_at = new Date().toISOString();

      // 清理过长的历史记录
      this.trimHistoryIfNeeded(sessionId);

      const processingTime = Date.now() - startTime;

      return {
        message: aiResponseContent,
        stage: session.current_stage,
        extractedData,
        motivationData,
        suggestions: {
          quickReplies,
        },
        metadata: {
          processingTime,
          tokensUsed,
          model: deepSeekClient.getConfig().model,
        },
      };

    } catch (error) {
      // 处理AI服务错误
      console.error('AI服务调用失败:', error);

      // 创建错误消息
      const errorMessage: ChatMessage = {
        id: this.generateMessageId(),
        session_id: sessionId,
        role: 'assistant',
        content: this.getErrorMessage(error as AIServiceError),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          type: 'text',
          stage: session.current_stage,
        } as any,
      };

      messages.push(errorMessage);
      session.message_count += 1;
      session.updated_at = new Date().toISOString();

      throw error;
    }
  }

  // 执行数据提取
  private async performDataExtraction(
    sessionId: string,
    context: PromptContext
  ): Promise<{ extractedData?: ExtractedWorkData; motivationData?: MotivationData }> {
    try {
      const result: { extractedData?: ExtractedWorkData; motivationData?: MotivationData } = {};

      // 根据当前阶段决定提取什么数据
      if (context.stage === 'information_gathering' || context.stage === 'discovery') {
        // 提取作品信息
        const extractionPrompt = PromptBuilder.buildDataExtractionPrompt(context, 'work');
        const response = await deepSeekClient.chat([
          { role: 'system', content: extractionPrompt },
          ...PromptBuilder.buildMessages(context).filter(msg => msg.role !== 'system')
        ]);

        try {
          const extracted = JSON.parse(response.choices[0].message.content);
          if (extracted.name && extracted.target_hours) {
            result.extractedData = extracted;
          }
        } catch (parseError) {
          console.warn('作品信息解析失败:', parseError);
        }
      }

      if (context.stage === 'motivation' || context.stage === 'confirmation') {
        // 提取动机数据
        const motivationPrompt = PromptBuilder.buildDataExtractionPrompt(context, 'motivation');
        const response = await deepSeekClient.chat([
          { role: 'system', content: motivationPrompt },
          ...PromptBuilder.buildMessages(context).filter(msg => msg.role !== 'system')
        ]);

        try {
          const motivation = JSON.parse(response.choices[0].message.content);
          if (motivation.woop || motivation.implementation_intentions) {
            result.motivationData = motivation;
          }
        } catch (parseError) {
          console.warn('动机数据解析失败:', parseError);
        }
      }

      return result;

    } catch (error) {
      console.warn('数据提取失败:', error);
      return {};
    }
  }

  // 确定下一阶段
  private determineNextStage(
    currentStage: DialogueStage,
    context: PromptContext,
    aiResponse: string
  ): DialogueStage {
    const stages: DialogueStage[] = [
      'greeting', 'discovery', 'information_gathering',
      'motivation', 'confirmation', 'completed'
    ];

    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex === -1) return currentStage;

    // 检查是否满足转换条件
    const transitionRules = {
      greeting: () => context.messages.length >= 2,
      discovery: () => {
        const userMessages = context.messages.filter(m => m.role === 'user');
        return userMessages.length >= 2 && context.messages.length >= 4;
      },
      information_gathering: () => {
        return context.extractedData?.name && context.extractedData.target_hours > 0;
      },
      motivation: () => {
        return context.motivationData?.woop || context.motivationData?.implementation_intentions;
      },
      confirmation: () => {
        return context.extractedData && context.motivationData;
      },
      completed: () => false,
    };

    const shouldTransition = transitionRules[currentStage as keyof typeof transitionRules];
    if (shouldTransition && shouldTransition()) {
      const nextIndex = Math.min(currentIndex + 1, stages.length - 1);
      return stages[nextIndex];
    }

    return currentStage;
  }

  // 获取会话信息
  getSession(sessionId: string): { session: AISession; messages: ChatMessage[] } | null {
    const sessionData = this.sessionCache.get(sessionId);
    return sessionData ? {
      session: sessionData.session,
      messages: [...sessionData.messages],
    } : null;
  }

  // 更新会话数据
  updateSessionData(
    sessionId: string,
    data: {
      extractedData?: ExtractedWorkData;
      motivationData?: MotivationData;
    }
  ): boolean {
    const sessionData = this.sessionCache.get(sessionId);
    if (!sessionData) return false;

    if (data.extractedData) {
      sessionData.context.extractedData = data.extractedData;
      sessionData.session.context.extracted_data = data.extractedData;
    }

    if (data.motivationData) {
      sessionData.context.motivationData = data.motivationData;
      sessionData.session.context.motivation_data = data.motivationData;
    }

    sessionData.session.updated_at = new Date().toISOString();
    return true;
  }

  // 结束会话
  endSession(sessionId: string): boolean {
    const sessionData = this.sessionCache.get(sessionId);
    if (!sessionData) return false;

    sessionData.session.status = 'completed';
    sessionData.session.updated_at = new Date().toISOString();

    // 可以选择保留会话记录或立即清理
    // this.sessionCache.delete(sessionId);

    return true;
  }

  // 清理会话缓存
  clearSession(sessionId: string): void {
    this.sessionCache.delete(sessionId);
  }

  // 获取所有活跃会话
  getActiveSessions(): AISession[] {
    return Array.from(this.sessionCache.values())
      .filter(data => data.session.status === 'active')
      .map(data => data.session);
  }

  // 清理过长的历史记录
  private trimHistoryIfNeeded(sessionId: string): void {
    const sessionData = this.sessionCache.get(sessionId);
    if (!sessionData) return;

    const { messages } = sessionData;
    if (messages.length > this.config.maxHistoryLength) {
      // 保留最新的消息，删除较旧的消息
      const keepCount = Math.floor(this.config.maxHistoryLength * 0.8);
      sessionData.messages = messages.slice(-keepCount);
      sessionData.context.messages = sessionData.messages;
    }
  }

  // 生成会话ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 生成消息ID
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取错误消息
  private getErrorMessage(error: AIServiceError): string {
    const errorMessages = {
      'NETWORK_ERROR': '网络连接失败，请检查网络连接后重试。',
      'API_ERROR': 'AI服务暂时不可用，请稍后重试。',
      'AUTH_ERROR': 'AI服务认证失败，请联系客服。',
      'RATE_LIMIT_ERROR': '请求过于频繁，请稍后重试。',
      'TIMEOUT_ERROR': '请求超时，请稍后重试。',
      'VALIDATION_ERROR': '请求数据格式错误。',
      'UNKNOWN_ERROR': '未知错误，请稍后重试。',
    };

    return errorMessages[error.code as keyof typeof errorMessages] ||
           '服务暂时不可用，请稍后重试。';
  }

  // 检查AI服务是否可用
  async checkAvailability(): Promise<{ available: boolean; message: string }> {
    try {
      if (!deepSeekClient.isConfigured()) {
        return {
          available: false,
          message: 'AI服务未配置，请设置API密钥'
        };
      }

      // 发送测试请求
      await deepSeekClient.chat([
        { role: 'system', content: '请回复"OK"' },
        { role: 'user', content: '测试' }
      ]);

      return {
        available: true,
        message: 'AI服务正常'
      };
    } catch (error) {
      return {
        available: false,
        message: `AI服务不可用: ${(error as AIServiceError).message}`
      };
    }
  }
}

// 导出单例实例
export const conversationManager = new ConversationManager();