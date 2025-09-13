// 应用事件总线 - 解耦Store之间的依赖
export type AppEventType = 
  // 计时器事件
  | 'timer:started'
  | 'timer:paused' 
  | 'timer:resumed'
  | 'timer:completed'
  | 'timer:stopped'
  
  // 作品事件
  | 'work:created'
  | 'work:updated'
  | 'work:deleted'
  | 'work:selected'
  | 'work:archived'
  | 'work:unarchived'
  
  // 数据事件
  | 'data:sync_required'
  | 'data:refreshed'
  | 'data:error'
  
  // UI事件
  | 'ui:theme_changed'
  | 'ui:language_changed'
  | 'ui:window_focused'
  | 'ui:window_blurred'
  
  // 应用事件
  | 'app:initialized'
  | 'app:reset'
  | 'app:error'

export interface AppEvent {
  type: AppEventType
  payload?: any
  timestamp: number
  source?: string
}

type EventHandler = (event: AppEvent) => void | Promise<void>

export class EventBus {
  private static instance: EventBus
  private handlers: Map<AppEventType, EventHandler[]> = new Map()
  private history: AppEvent[] = []
  private maxHistory = 100

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  // 订阅事件
  subscribe(eventType: AppEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, [])
    }
    
    this.handlers.get(eventType)!.push(handler)
    
    // 返回取消订阅函数
    return () => {
      const handlers = this.handlers.get(eventType)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }
  }

  // 发布事件
  async publish(eventType: AppEventType, payload?: any, source?: string): Promise<void> {
    const event: AppEvent = {
      type: eventType,
      payload,
      timestamp: Date.now(),
      source
    }

    // 记录历史
    this.history.push(event)
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }

    // 获取处理器
    const handlers = this.handlers.get(eventType) || []
    
    // 异步执行所有处理器
    const promises = handlers.map(async (handler) => {
      try {
        await handler(event)
      } catch (error) {
        // 使用统一的错误处理，但不中断其他处理器
        import('@/errors/ErrorHandler').then(({ errorHandler }) => {
          errorHandler.handleError(error as Error, {
            source: 'EventBus.publish',
            payload: { eventType, eventSource: source }
          }).catch(console.error)
        })
      }
    })

    await Promise.allSettled(promises)
  }

  // 获取事件历史
  getHistory(eventType?: AppEventType, limit?: number): AppEvent[] {
    let events = this.history
    
    if (eventType) {
      events = events.filter(e => e.type === eventType)
    }
    
    if (limit) {
      events = events.slice(-limit)
    }
    
    return events
  }

  // 清除历史
  clearHistory(): void {
    this.history = []
  }

  // 获取订阅统计
  getSubscriptionStats(): Record<AppEventType, number> {
    const stats: Record<AppEventType, number> = {} as any
    
    for (const [eventType, handlers] of this.handlers) {
      stats[eventType] = handlers.length
    }
    
    return stats
  }

  // 取消所有订阅
  unsubscribeAll(eventType?: AppEventType): void {
    if (eventType) {
      this.handlers.delete(eventType)
    } else {
      this.handlers.clear()
    }
  }
}

// 导出单例实例
export const eventBus = EventBus.getInstance()

// 便捷的发布函数
export const emit = (eventType: AppEventType, payload?: any, source?: string) => {
  return eventBus.publish(eventType, payload, source)
}

// 便捷的订阅函数
export const on = (eventType: AppEventType, handler: EventHandler) => {
  return eventBus.subscribe(eventType, handler)
}

// 便捷的一次性订阅函数
export const once = (eventType: AppEventType, handler: EventHandler) => {
  const unsubscribe = eventBus.subscribe(eventType, async (event) => {
    unsubscribe()
    await handler(event)
  })
  return unsubscribe
}