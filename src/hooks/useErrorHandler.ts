import { useCallback } from 'react';
import { toast } from 'sonner';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  fallbackMessage?: string;
}

export function useErrorHandler() {
  const handleError = useCallback((
    error: Error | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logToConsole = true,
      fallbackMessage = '操作失败，请稍后重试'
    } = options;

    // 获取错误信息
    const errorMessage = error instanceof Error ? error.message : fallbackMessage;
    
    // 控制台日志
    if (logToConsole) {
      console.error('Error caught by handler:', error);
    }

    // 显示提示
    if (showToast) {
      toast.error(errorMessage);
    }

    return {
      handled: true,
      message: errorMessage,
      originalError: error
    };
  }, []);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    options: ErrorHandlerOptions = {}
  ): Promise<any> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, options);
      throw error; // 重新抛出错误以便调用者处理
    }
  }, [handleError]);

  const createSafeHandler = useCallback((
    handler: (...args: any[]) => any,
    options: ErrorHandlerOptions = {}
  ) => {
    return (...args: any[]) => {
      try {
        return handler(...args);
      } catch (error) {
        return handleError(error, options);
      }
    };
  }, [handleError]);

  const createSafeAsyncHandler = useCallback((
    handler: (...args: any[]) => Promise<any>,
    options: ErrorHandlerOptions = {}
  ) => {
    return async (...args: any[]) => {
      try {
        return await handler(...args);
      } catch (error) {
        handleError(error, options);
        throw error;
      }
    };
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    createSafeHandler,
    createSafeAsyncHandler
  };
}

// 错误类型检查工具
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const isNetworkError = (error: unknown): boolean => {
  if (!isError(error)) return false;
  
  // 检查常见的网络错误特征
  return (
    error.message.includes('Network Error') ||
    error.message.includes('fetch') ||
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('timeout') ||
    error.name === 'NetworkError'
  );
};

export const isApiError = (error: unknown): boolean => {
  if (!isError(error)) return false;
  
  // 检查API错误特征
  return (
    error.message.includes('API') ||
    error.message.includes('Request') ||
    error.message.includes('Response')
  );
};

export const isValidationError = (error: unknown): boolean => {
  if (!isError(error)) return false;
  
  // 检查验证错误特征
  return (
    error.message.includes('validation') ||
    error.message.includes('invalid') ||
    error.message.includes('required')
  );
};