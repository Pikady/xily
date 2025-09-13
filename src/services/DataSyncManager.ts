import { useAnalyticsStore } from '@/stores/analyticsStore'
import { DataEvent, DataEventType, DataUpdateType, EVENT_TO_DATA_TYPES, DATA_TYPE_CONFIG } from '@/events/DataSyncEvents'
import { errorHandler, ErrorCodes, ErrorCategory } from '@/errors/ErrorHandler'

interface PendingUpdate {
  type: DataUpdateType
  priority: number
  timestamp: number
  filters?: any
}

export class DataSyncManager {
  private static instance: DataSyncManager
  private updateQueue: PendingUpdate[] = []
  private isProcessing = false
  private lastUpdateTime: Record<DataUpdateType, number> = {
    timeRecords: 0,
    timeDistribution: 0,
    dailyStats: 0,
    weeklyStats: 0,
    monthlyStats: 0,
    trendData: 0
  }
  private cache: Map<string, { data: any; timestamp: number }> = new Map()

  private constructor() {}

  static getInstance(): DataSyncManager {
    if (!DataSyncManager.instance) {
      DataSyncManager.instance = new DataSyncManager()
    }
    return DataSyncManager.instance
  }

  // 触发数据更新事件
  async triggerEvent(eventType: DataEventType, payload?: any) {
    const dataTypes = EVENT_TO_DATA_TYPES[eventType]
    
    if (dataTypes.length === 0) return

    // 为每个需要更新的数据类型创建待处理更新
    dataTypes.forEach(dataType => {
      const config = DATA_TYPE_CONFIG[dataType]
      const now = Date.now()
      
      // 检查是否在缓存时间内，避免重复更新
      if (now - this.lastUpdateTime[dataType] < config.cacheTime) {
        return
      }

      const update: PendingUpdate = {
        type: dataType,
        priority: config.priority,
        timestamp: now,
        filters: payload?.filters
      }

      this.addUpdateToQueue(update)
    })

    // 处理队列
    this.processQueue()
  }

  // 添加更新到队列，按优先级排序
  private addUpdateToQueue(update: PendingUpdate) {
    // 移除相同类型的旧更新
    this.updateQueue = this.updateQueue.filter(u => u.type !== update.type)
    
    // 按优先级插入
    let insertIndex = 0
    for (let i = 0; i < this.updateQueue.length; i++) {
      if (this.updateQueue[i].priority > update.priority) {
        insertIndex = i
        break
      }
      insertIndex = i + 1
    }
    
    this.updateQueue.splice(insertIndex, 0, update)
  }

  // 处理更新队列
  private async processQueue() {
    if (this.isProcessing || this.updateQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      while (this.updateQueue.length > 0) {
        const update = this.updateQueue.shift()!
        
        // 检查缓存时间
        const now = Date.now()
        if (now - this.lastUpdateTime[update.type] < DATA_TYPE_CONFIG[update.type].cacheTime) {
          continue
        }

        await this.executeUpdate(update)
        this.lastUpdateTime[update.type] = now
      }
    } catch (error) {
      await errorHandler.handleError(error as Error, {
        source: 'DataSyncManager.processQueue',
        payload: { queueLength: this.updateQueue.length }
      })
    } finally {
      this.isProcessing = false
    }
  }

  // 执行单个更新
  private async executeUpdate(update: PendingUpdate) {
    const store = useAnalyticsStore.getState()
    
    try {
      // 检查缓存
      const cacheKey = this.getCacheKey(update.type, update.filters)
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < DATA_TYPE_CONFIG[update.type].cacheTime) {
        // 使用缓存数据更新store
        this.updateStoreFromCache(update.type, cached.data)
        return
      }

      // 获取新数据
      await store.fetchData(update.type, update.filters)
      
      // 更新缓存
      const data = this.getDataFromStore(update.type)
      if (data) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      await errorHandler.handleError(error as Error, {
        source: 'DataSyncManager.executeUpdate',
        payload: { updateType: update.type, filters: update.filters }
      })
    }
  }

  // 获取缓存键
  private getCacheKey(type: DataUpdateType, filters?: any): string {
    return `${type}_${JSON.stringify(filters || {})}`
  }

  // 从缓存更新store
  private updateStoreFromCache(type: DataUpdateType, data: any) {
    const store = useAnalyticsStore.getState()
    
    switch (type) {
      case 'timeRecords':
        store.setTimeRecords(data)
        break
      case 'timeDistribution':
        store.setTimeDistribution(data)
        break
      case 'dailyStats':
        store.setDailyStats(data)
        break
      case 'weeklyStats':
        store.setWeeklyStats(data)
        break
      case 'monthlyStats':
        store.setMonthlyStats(data)
        break
      case 'trendData':
        store.setTrendData(data)
        break
    }
  }

  // 从store获取数据
  private getDataFromStore(type: DataUpdateType): any {
    const store = useAnalyticsStore.getState()
    
    switch (type) {
      case 'timeRecords':
        return store.timeRecords
      case 'timeDistribution':
        return store.timeDistribution
      case 'dailyStats':
        return store.dailyStats
      case 'weeklyStats':
        return store.weeklyStats
      case 'monthlyStats':
        return store.monthlyStats
      case 'trendData':
        return store.trendData
      default:
        return null
    }
  }

  // 手动刷新特定数据类型
  async refreshDataTypes(types: DataUpdateType[], filters?: any) {
    const now = Date.now()
    
    for (const type of types) {
      // 强制更新，忽略缓存
      this.lastUpdateTime[type] = 0
      
      const update: PendingUpdate = {
        type,
        priority: 0, // 最高优先级
        timestamp: now,
        filters
      }
      
      this.addUpdateToQueue(update)
    }
    
    await this.processQueue()
  }

  // 清除缓存
  clearCache(type?: DataUpdateType) {
    if (type) {
      // 清除特定类型的缓存
      for (const [key] of this.cache) {
        if (key.startsWith(type)) {
          this.cache.delete(key)
        }
      }
    } else {
      // 清除所有缓存
      this.cache.clear()
    }
  }

  // 获取同步状态
  getSyncStatus() {
    return {
      queueLength: this.updateQueue.length,
      isProcessing: this.isProcessing,
      lastUpdateTime: { ...this.lastUpdateTime },
      cacheSize: this.cache.size
    }
  }
}

// 导出单例实例
export const dataSyncManager = DataSyncManager.getInstance()

// 便捷的事件触发函数
export const triggerDataSync = (eventType: DataEventType, payload?: any) => {
  dataSyncManager.triggerEvent(eventType, payload)
}

// 便捷的数据刷新函数
export const refreshDataTypes = (types: DataUpdateType[], filters?: any) => {
  return dataSyncManager.refreshDataTypes(types, filters)
}