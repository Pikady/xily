import { useEffect, useRef, useCallback, useState } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { dataSyncManager } from '@/services/DataSyncManager';
import type { DataUpdateType } from '@/events/DataSyncEvents';

interface UseDataSyncOptions {
  interval?: number; // 自动更新间隔（毫秒）
  enabled?: boolean; // 是否启用自动更新
  retryCount?: number; // 重试次数
  retryDelay?: number; // 重试延迟（毫秒）
}

export function useDataSync(options: UseDataSyncOptions = {}) {
  const {
    interval = 30000, // 默认30秒
    enabled = true,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const {
    filters,
    loading,
    error,
    fetchData,
    setLoading,
    setError
  } = useAnalyticsStore();

  const intervalRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const lastSyncTimeRef = useRef<Date>(new Date());

  // 手动刷新数据
  const refresh = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      await fetchData('all');
      lastSyncTimeRef.current = new Date();
      retryCountRef.current = 0;
    } catch (error) {
      console.error('数据刷新失败:', error);
      setError(error instanceof Error ? error.message : '刷新失败');
      
      // 重试逻辑
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(refresh, retryDelay * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, fetchData, setLoading, setError, retryCount, retryDelay]);

  // 自动更新逻辑
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      return;
    }

    // 立即执行一次
    refresh();

    // 设置定时器
    intervalRef.current = setInterval(refresh, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, refresh]);

  // 页面可见性变化时的处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        // 页面变为可见时，如果距离上次更新超过间隔时间，则立即刷新
        const now = new Date();
        const timeSinceLastSync = now.getTime() - lastSyncTimeRef.current.getTime();
        
        if (timeSinceLastSync > interval) {
          refresh();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, interval, refresh]);

  // 网络状态变化时的处理
  useEffect(() => {
    const handleOnline = () => {
      if (enabled) {
        refresh();
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [enabled, refresh]);

  return {
    refresh,
    loading,
    error,
    lastSyncTime: lastSyncTimeRef.current,
    isAutoUpdateEnabled: enabled
  };
}

// 智能数据同步Hook - 使用DataSyncManager
export function useSmartDataSync(options: {
  enabled?: boolean;
  interval?: number;
  autoRefreshTypes?: DataUpdateType[];
} = {}) {
  const { 
    enabled = true, 
    interval = 30000,
    autoRefreshTypes = ['dailyStats', 'timeDistribution'] as DataUpdateType[]
  } = options;

  const intervalRef = useRef<NodeJS.Timeout>();
  const [syncStatus, setSyncStatus] = useState(() => dataSyncManager.getSyncStatus());

  // 更新同步状态
  const updateSyncStatus = useCallback(() => {
    setSyncStatus(dataSyncManager.getSyncStatus());
  }, []);

  // 智能刷新函数
  const smartRefresh = useCallback(async (types?: DataUpdateType[]) => {
    const targetTypes = types || autoRefreshTypes;
    try {
      await dataSyncManager.refreshDataTypes(targetTypes);
      updateSyncStatus();
    } catch (error) {
      console.error('Smart refresh failed:', error);
    }
  }, [autoRefreshTypes, updateSyncStatus]);

  // 自动刷新逻辑
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      return;
    }

    // 设置定时器
    intervalRef.current = setInterval(() => {
      smartRefresh();
    }, interval);

    // 立即执行一次
    smartRefresh();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, smartRefresh]);

  // 定期更新状态
  useEffect(() => {
    const statusInterval = setInterval(updateSyncStatus, 1000);
    return () => clearInterval(statusInterval);
  }, [updateSyncStatus]);

  return {
    refresh: smartRefresh,
    syncStatus,
    isProcessing: syncStatus.isProcessing,
    queueLength: syncStatus.queueLength,
    lastUpdateTime: syncStatus.lastUpdateTime
  };
}

// 性能优化的数据获取Hook
export function useOptimizedDataFetch<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = [],
  options: {
    enabled?: boolean;
    staleTime?: number;
    cacheKey?: string;
  } = {}
) {
  const { enabled = true, staleTime = 30000, cacheKey } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // 检查缓存
    if (cacheKey) {
      const cached = cacheRef.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < staleTime) {
        setData(cached.data);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
      
      // 更新缓存
      if (cacheKey) {
        cacheRef.current.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, enabled, staleTime, cacheKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidateCache: () => {
      if (cacheKey) {
        cacheRef.current.delete(cacheKey);
      }
    }
  };
}