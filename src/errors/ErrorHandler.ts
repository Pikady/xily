// 统一错误处理系统

export enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning', 
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  API = 'api',
  DATABASE = 'database',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  UI = 'ui',
  UNKNOWN = 'unknown'
}

export interface AppError {
  id: string
  code: string
  message: string
  level: ErrorLevel
  category: ErrorCategory
  timestamp: number
  source: string
  stack?: string
  payload?: any
  retryable: boolean
  handled: boolean
}

export interface ErrorHandlingStrategy {
  shouldRetry: (error: AppError) => boolean
  maxRetries: number
  retryDelay: number
  onRetry?: (error: AppError, attempt: number) => void
  onFail?: (error: AppError) => void
  onSuccess?: () => void
}

// 默认错误处理策略
const DEFAULT_STRATEGIES: Record<ErrorCategory, ErrorHandlingStrategy> = {
  [ErrorCategory.NETWORK]: {
    shouldRetry: () => true,
    maxRetries: 3,
    retryDelay: 1000,
    onRetry: (error, attempt) => {
      console.log(`Retrying network request (attempt ${attempt}):`, error.message)
    }
  },
  [ErrorCategory.API]: {
    shouldRetry: (error) => error.code === 'TIMEOUT' || error.code === 'RATE_LIMIT',
    maxRetries: 2,
    retryDelay: 2000
  },
  [ErrorCategory.DATABASE]: {
    shouldRetry: () => false,
    maxRetries: 0,
    retryDelay: 0
  },
  [ErrorCategory.VALIDATION]: {
    shouldRetry: () => false,
    maxRetries: 0,
    retryDelay: 0
  },
  [ErrorCategory.BUSINESS_LOGIC]: {
    shouldRetry: () => false,
    maxRetries: 0,
    retryDelay: 0
  },
  [ErrorCategory.UI]: {
    shouldRetry: () => false,
    maxRetries: 0,
    retryDelay: 0
  },
  [ErrorCategory.UNKNOWN]: {
    shouldRetry: () => false,
    maxRetries: 1,
    retryDelay: 1000
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errors: AppError[] = []
  private handlers: Map<string, (error: AppError) => void> = new Map()
  private maxErrors = 100

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // 创建标准化的应用错误
  createError(
    code: string,
    message: string,
    options: {
      level?: ErrorLevel
      category?: ErrorCategory
      source?: string
      stack?: string
      payload?: any
      retryable?: boolean
    } = {}
  ): AppError {
    const {
      level = ErrorLevel.ERROR,
      category = ErrorCategory.UNKNOWN,
      source = 'unknown',
      stack,
      payload,
      retryable = false
    } = options

    const error: AppError = {
      id: this.generateErrorId(),
      code,
      message,
      level,
      category,
      timestamp: Date.now(),
      source,
      stack,
      payload,
      retryable,
      handled: false
    }

    return error
  }

  // 处理错误
  async handleError(error: AppError | Error | string, context?: any): Promise<AppError> {
    // 标准化错误对象
    const appError = this.normalizeError(error, context)
    
    // 记录错误
    this.logError(appError)
    
    // 通知处理器
    await this.notifyHandlers(appError)
    
    // 尝试恢复
    await this.attemptRecovery(appError)
    
    return appError
  }

  // 包装异步操作，提供自动错误处理
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    options: {
      code?: string
      message?: string
      category?: ErrorCategory
      source?: string
      strategy?: Partial<ErrorHandlingStrategy>
      fallback?: () => Promise<T>
    } = {}
  ): Promise<T> {
    try {
      return await operation()
    } catch (rawError) {
      const error = this.createError(
        options.code || 'OPERATION_FAILED',
        options.message || 'Operation failed',
        {
          level: ErrorLevel.ERROR,
          category: options.category || ErrorCategory.UNKNOWN,
          source: options.source || 'withErrorHandling',
          payload: { rawError, context: options }
        }
      )

      // 如果提供了fallback，尝试使用
      if (options.fallback) {
        try {
          return await options.fallback()
        } catch (fallbackError) {
          await this.handleError(error)
          throw fallbackError
        }
      }

      // 否则使用策略处理
      const strategy = { ...DEFAULT_STRATEGIES[error.category], ...options.strategy }
      
      if (strategy.shouldRetry(error)) {
        return this.retryOperation(operation, strategy, error)
      }

      await this.handleError(error)
      throw error
    }
  }

  // 重试操作
  private async retryOperation<T>(
    operation: () => Promise<T>,
    strategy: ErrorHandlingStrategy,
    originalError: AppError
  ): Promise<T> {
    let lastError: AppError = originalError
    
    for (let attempt = 1; attempt <= strategy.maxRetries; attempt++) {
      try {
        const result = await operation()
        strategy.onSuccess?.()
        return result
      } catch (rawError) {
        lastError = this.createError(
          originalError.code,
          `${originalError.message} (attempt ${attempt})`,
          {
            ...originalError,
            payload: { ...originalError.payload, attempt, rawError }
          }
        )
        
        strategy.onRetry?.(lastError, attempt)
        
        if (attempt < strategy.maxRetries) {
          await this.delay(strategy.retryDelay * attempt)
        }
      }
    }
    
    strategy.onFail?.(lastError)
    throw lastError
  }

  // 注册错误处理器
  registerHandler(errorCode: string, handler: (error: AppError) => void): () => void {
    this.handlers.set(errorCode, handler)
    
    return () => {
      this.handlers.delete(errorCode)
    }
  }

  // 获取错误历史
  getErrors(filter?: {
    level?: ErrorLevel
    category?: ErrorCategory
    source?: string
    since?: number
    limit?: number
  }): AppError[] {
    let errors = [...this.errors]
    
    if (filter) {
      if (filter.level) {
        errors = errors.filter(e => e.level === filter.level)
      }
      if (filter.category) {
        errors = errors.filter(e => e.category === filter.category)
      }
      if (filter.source) {
        errors = errors.filter(e => e.source === filter.source)
      }
      if (filter.since) {
        errors = errors.filter(e => e.timestamp >= filter.since)
      }
      if (filter.limit) {
        errors = errors.slice(-filter.limit)
      }
    }
    
    return errors
  }

  // 清除错误历史
  clearErrors(filter?: { level?: ErrorLevel; category?: ErrorCategory }): void {
    if (filter) {
      this.errors = this.errors.filter(e => {
        if (filter.level && e.level !== filter.level) return true
        if (filter.category && e.category !== filter.category) return true
        return false
      })
    } else {
      this.errors = []
    }
  }

  // 私有方法
  private normalizeError(error: AppError | Error | string, context?: any): AppError {
    if (typeof error === 'string') {
      return this.createError('GENERIC_ERROR', error, { payload: context })
    }
    
    if (error instanceof Error) {
      return this.createError('JS_ERROR', error.message, {
        level: ErrorLevel.ERROR,
        category: ErrorCategory.UNKNOWN,
        stack: error.stack,
        payload: context
      })
    }
    
    return error
  }

  private logError(error: AppError): void {
    // 添加到错误历史
    this.errors.push(error)
    
    // 保持错误历史大小限制
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }
    
    // 根据级别输出到控制台
    const logMethod = {
      [ErrorLevel.DEBUG]: console.debug,
      [ErrorLevel.INFO]: console.info,
      [ErrorLevel.WARNING]: console.warn,
      [ErrorLevel.ERROR]: console.error,
      [ErrorLevel.CRITICAL]: console.error
    }[error.level]
    
    logMethod(`[${error.category.toUpperCase()}] ${error.code}: ${error.message}`, {
      source: error.source,
      payload: error.payload,
      timestamp: new Date(error.timestamp).toISOString()
    })
  }

  private async notifyHandlers(error: AppError): Promise<void> {
    const handler = this.handlers.get(error.code)
    if (handler) {
      try {
        await handler(error)
        error.handled = true
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    }
  }

  private async attemptRecovery(error: AppError): Promise<void> {
    // 这里可以实现自动恢复逻辑
    // 比如重新连接网络、刷新数据等
    if (error.retryable && !error.handled) {
      console.log(`Attempting recovery for ${error.code}...`)
      // 实现具体的恢复逻辑
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance()

// 便捷的错误处理函数
export const handleError = (error: AppError | Error | string, context?: any) => {
  return errorHandler.handleError(error, context)
}

export const withErrorHandling = <T>(
  operation: () => Promise<T>,
  options?: Parameters<typeof errorHandler['withErrorHandling']>[1]
) => {
  return errorHandler.withErrorHandling(operation, options)
}

// 预定义的错误代码
export const ErrorCodes = {
  // 网络错误
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  RATE_LIMIT: 'RATE_LIMIT',
  
  // API错误
  API_ERROR: 'API_ERROR',
  API_TIMEOUT: 'API_TIMEOUT',
  API_VALIDATION: 'API_VALIDATION',
  
  // 数据库错误
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_CONNECTION: 'DATABASE_CONNECTION',
  DATABASE_QUERY: 'DATABASE_QUERY',
  
  // 业务逻辑错误
  INVALID_TIMER_STATE: 'INVALID_TIMER_STATE',
  WORK_NOT_FOUND: 'WORK_NOT_FOUND',
  INVALID_WORK_DATA: 'INVALID_WORK_DATA',
  
  // UI错误
  UI_COMPONENT_ERROR: 'UI_COMPONENT_ERROR',
  USER_INPUT_ERROR: 'USER_INPUT_ERROR'
} as const