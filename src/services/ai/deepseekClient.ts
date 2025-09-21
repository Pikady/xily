import {
  AIServiceConfig,
  DeepSeekMessage,
  DeepSeekChatResponse,
  AIServiceError,
  AIServiceErrorCode,
  DEFAULT_AI_CONFIG
} from './config';

export class DeepSeekClient {
  private config: AIServiceConfig;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor(config?: Partial<AIServiceConfig>) {
    // 从环境变量获取API密钥
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY ||
                   (window as any).__TAURI__?.import_meta_env?.VITE_DEEPSEEK_API_KEY ||
                   config?.apiKey ||
                   '';

    this.config = {
      ...DEFAULT_AI_CONFIG,
      ...config,
      apiKey,
    };
  }

  // 发送聊天请求
  async chat(
    messages: DeepSeekMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ): Promise<DeepSeekChatResponse> {
    if (!this.config.apiKey) {
      throw this.createError(
        AIServiceErrorCode.AUTH_ERROR,
        'DeepSeek API密钥未配置，请设置环境变量 VITE_DEEPSEEK_API_KEY'
      );
    }

    const requestConfig = {
      ...this.config,
      temperature: options?.temperature ?? this.config.temperature,
      maxTokens: options?.maxTokens ?? this.config.maxTokens,
      stream: options?.stream ?? false,
    };

    return this.withRetry(async () => {
      try {
        const response = await fetch(`${this.config.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'User-Agent': 'Xily-App/1.0.0',
          },
          body: JSON.stringify({
            model: requestConfig.model,
            messages,
            temperature: requestConfig.temperature,
            max_tokens: requestConfig.maxTokens,
            stream: requestConfig.stream,
          }),
        });

        if (!response.ok) {
          await this.handleErrorResponse(response);
        }

        const data: DeepSeekChatResponse = await response.json();

        // 验证响应格式
        if (!data.choices || !data.choices.length || !data.choices[0].message) {
          throw this.createError(
            AIServiceErrorCode.API_ERROR,
            '无效的AI响应格式'
          );
        }

        return data;
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && 'retryable' in error) {
          throw error;
        }

        if (error instanceof Error && error.name === 'AbortError') {
          throw this.createError(
            AIServiceErrorCode.TIMEOUT_ERROR,
            '请求超时，请稍后重试'
          );
        }

        if (error instanceof Error && error.message?.includes('NetworkError')) {
          throw this.createError(
            AIServiceErrorCode.NETWORK_ERROR,
            '网络连接失败，请检查网络连接'
          );
        }

        throw this.createError(
          AIServiceErrorCode.UNKNOWN_ERROR,
          `未知错误: ${(error as Error).message ?? String(error)}`
        );
      }
    });
  }

  // 流式聊天
  async *chatStream(
    messages: DeepSeekMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): AsyncGenerator<string, void, unknown> {
    if (!this.config.apiKey) {
      throw this.createError(
        AIServiceErrorCode.AUTH_ERROR,
        'DeepSeek API密钥未配置，请设置环境变量 VITE_DEEPSEEK_API_KEY'
      );
    }

    const requestConfig = {
      ...this.config,
      temperature: options?.temperature ?? this.config.temperature,
      maxTokens: options?.maxTokens ?? this.config.maxTokens,
      stream: true,
    };

    try {
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': 'Xily-App/1.0.0',
        },
        body: JSON.stringify({
          model: requestConfig.model,
          messages,
          temperature: requestConfig.temperature,
          max_tokens: requestConfig.maxTokens,
          stream: true,
        }),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      if (!response.body) {
        throw this.createError(
          AIServiceErrorCode.API_ERROR,
          '流式响应不支持'
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                yield content;
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
              console.warn('流式响应解析警告:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && 'retryable' in error) {
        throw error;
      }

      throw this.createError(
        AIServiceErrorCode.UNKNOWN_ERROR,
        `流式聊天错误: ${error.message}`
      );
    }
  }

  // 处理错误响应
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;

    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    let errorCode = AIServiceErrorCode.API_ERROR;
    let errorMessage = errorData.message || '请求失败';

    // 根据状态码设置错误类型
    switch (response.status) {
      case 401:
      case 403:
        errorCode = AIServiceErrorCode.AUTH_ERROR;
        errorMessage = 'API密钥无效或已过期';
        break;
      case 429:
        errorCode = AIServiceErrorCode.RATE_LIMIT_ERROR;
        errorMessage = '请求过于频繁，请稍后重试';
        break;
      case 408:
      case 504:
        errorCode = AIServiceErrorCode.TIMEOUT_ERROR;
        errorMessage = '请求超时，请稍后重试';
        break;
      case 500:
      case 502:
      case 503:
        errorCode = AIServiceErrorCode.NETWORK_ERROR;
        errorMessage = '服务暂时不可用，请稍后重试';
        break;
    }

    throw this.createError(errorCode, errorMessage, errorData);
  }

  // 创建错误对象
  private createError(
    code: AIServiceErrorCode,
    message: string,
    details?: any
  ): AIServiceError {
    return {
      code,
      message,
      details,
      retryable: this.isRetryableError(code),
      timestamp: new Date(),
    };
  }

  // 判断错误是否可重试
  private isRetryableError(code: AIServiceErrorCode): boolean {
    const retryableCodes = [
      AIServiceErrorCode.NETWORK_ERROR,
      AIServiceErrorCode.TIMEOUT_ERROR,
      AIServiceErrorCode.RATE_LIMIT_ERROR,
      AIServiceErrorCode.API_ERROR,
    ];
    return retryableCodes.includes(code);
  }

  // 重试机制
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.retryAttempts,
    delay: number = this.retryDelay
  ): Promise<T> {
    let lastError: AIServiceError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as AIServiceError;

        if (!lastError.retryable || attempt === maxRetries) {
          throw lastError;
        }

        // 指数退避
        const waitTime = delay * Math.pow(2, attempt - 1);
        await this.sleep(waitTime);
      }
    }

    throw lastError!;
  }

  // 延迟函数
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 检查API密钥是否配置
  isConfigured(): boolean {
    return Boolean(this.config.apiKey && this.config.apiKey.trim());
  }

  // 获取配置信息
  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  // 更新配置
  updateConfig(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// 导出单例实例
export const deepSeekClient = new DeepSeekClient();