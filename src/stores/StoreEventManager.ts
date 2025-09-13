import { on, AppEventType } from '@/events/EventBus'
import { useAnalyticsStore } from './analyticsStore'
import { useWorksStore } from './worksStore'

// Store事件管理器 - 处理跨Store的业务逻辑
export class StoreEventManager {
  private static instance: StoreEventManager
  private cleanupFunctions: (() => void)[] = []

  private constructor() {}

  static getInstance(): StoreEventManager {
    if (!StoreEventManager.instance) {
      StoreEventManager.instance = new StoreEventManager()
    }
    return StoreEventManager.instance
  }

  // 初始化所有事件监听
  initialize() {
    this.setupTimerEventListeners()
    this.setupWorkEventListeners()
    this.setupDataEventListeners()
  }

  // 计时器事件监听
  private setupTimerEventListeners() {
    // 计时器开始 - 更新相关作品的统计
    const unsubscribeTimerStarted = on('timer:started', (event) => {
      const { workId } = event.payload
      if (workId) {
        // 可以在这里更新作品的实时统计
        console.log('Timer started for work:', workId)
      }
    })

    // 计时器完成 - 更新作品统计和分析数据
    const unsubscribeTimerCompleted = on('timer:completed', (event) => {
      const { workId, mode, duration } = event.payload
      
      // 更新相关作品的统计信息
      if (workId) {
        const worksStore = useWorksStore.getState()
        const currentWork = worksStore.currentWork
        
        // 如果是当前作品，更新其统计
        if (currentWork && currentWork.id === workId) {
          worksStore.fetchWorkStats(workId)
        }
      }
    })

    this.cleanupFunctions.push(unsubscribeTimerStarted, unsubscribeTimerCompleted)
  }

  // 作品事件监听
  private setupWorkEventListeners() {
    // 作品创建 - 初始化分析数据
    const unsubscribeWorkCreated = on('work:created', (event) => {
      const { work } = event.payload
      
      // 为新作品初始化统计数据
      if (work && work.id) {
        const analyticsStore = useAnalyticsStore.getState()
        // 只更新与该作品相关的数据
        analyticsStore.fetchData('timeDistribution', {
          work_ids: [work.id],
          date_range: analyticsStore.filters.date_range
        })
      }
    })

    // 作品选择 - 更新分析数据
    const unsubscribeWorkSelected = on('work:selected', (event) => {
      const { work } = event.payload
      
      // 当选择新作品时，更新相关分析数据
      if (work) {
        const analyticsStore = useAnalyticsStore.getState()
        analyticsStore.setFilters({
          work_ids: [work.id]
        })
      }
    })

    this.cleanupFunctions.push(unsubscribeWorkCreated, unsubscribeWorkSelected)
  }

  // 数据事件监听
  private setupDataEventListeners() {
    // 数据同步完成 - 更新UI状态
    const unsubscribeDataRefreshed = on('data:refreshed', (event) => {
      const { dataType } = event.payload
      
      // 可以在这里更新UI状态，比如显示"数据已更新"提示
      console.log('Data refreshed:', dataType)
    })

    // 数据错误 - 统一错误处理
    const unsubscribeDataError = on('data:error', (event) => {
      const { error, dataType } = event.payload
      
      // 统一的错误处理逻辑
      console.error(`Data error for ${dataType}:`, error)
      
      // 可以在这里显示用户友好的错误提示
      // 或者触发重试机制
    })

    this.cleanupFunctions.push(unsubscribeDataRefreshed, unsubscribeDataError)
  }

  // 清理所有事件监听
  cleanup() {
    this.cleanupFunctions.forEach(cleanup => {
      try {
        cleanup()
      } catch (error) {
        console.error('Error cleaning up event listener:', error)
      }
    })
    this.cleanupFunctions = []
  }

  // 获取事件统计信息
  getStats() {
    return {
      activeListeners: this.cleanupFunctions.length,
      registeredEventTypes: [
        'timer:started',
        'timer:completed', 
        'work:created',
        'work:selected',
        'data:refreshed',
        'data:error'
      ]
    }
  }
}

// 导出单例实例
export const storeEventManager = StoreEventManager.getInstance()