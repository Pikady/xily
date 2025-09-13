// 数据同步事件系统
export type DataEventType = 
  | 'timer_started'
  | 'timer_completed' 
  | 'timer_stopped'
  | 'work_created'
  | 'work_updated'
  | 'work_deleted'
  | 'work_archived'
  | 'session_paused'
  | 'session_resumed'

export interface DataEvent {
  type: DataEventType
  payload?: any
  timestamp: number
}

export type DataUpdateType = 
  | 'timeRecords'
  | 'timeDistribution' 
  | 'dailyStats'
  | 'weeklyStats'
  | 'monthlyStats'
  | 'trendData'

// 事件到数据类型的映射
export const EVENT_TO_DATA_TYPES: Record<DataEventType, DataUpdateType[]> = {
  timer_started: ['timeDistribution'],
  timer_completed: ['timeRecords', 'timeDistribution', 'dailyStats'],
  timer_stopped: ['timeRecords', 'timeDistribution', 'dailyStats'],
  work_created: ['timeDistribution'],
  work_updated: ['timeDistribution'],
  work_deleted: ['timeDistribution'],
  work_archived: ['timeDistribution'],
  session_paused: [],
  session_resumed: []
}

// 数据类型的优先级和缓存时间
export const DATA_TYPE_CONFIG: Record<DataUpdateType, {
  priority: number
  cacheTime: number
  batchSize: number
}> = {
  timeRecords: { priority: 1, cacheTime: 5000, batchSize: 50 },      // 5秒缓存
  timeDistribution: { priority: 2, cacheTime: 10000, batchSize: 10 }, // 10秒缓存
  dailyStats: { priority: 3, cacheTime: 30000, batchSize: 30 },        // 30秒缓存
  weeklyStats: { priority: 4, cacheTime: 60000, batchSize: 7 },        // 1分钟缓存
  monthlyStats: { priority: 5, cacheTime: 300000, batchSize: 12 },      // 5分钟缓存
  trendData: { priority: 6, cacheTime: 120000, batchSize: 30 }         // 2分钟缓存
}