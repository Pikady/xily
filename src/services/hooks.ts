import { useWorksStore } from '@/stores/worksStore'
import { useTimerStore } from '@/stores/timerStore'
import { useUIStore } from '@/stores/uiStore'
import { useAppStore } from '@/stores/appStore'
import { WorksAPI, TimerAPI, AnalyticsAPI, SettingsAPI, SystemAPI } from './api'
import { Work, WorkFormData, WorkStats } from '@/types/work'
import { TimerSession, TimerConfig } from '@/types/timer'
import { AnalyticsData } from '@/types/analytics'

// 通用Hook类型
interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: (...args: any[]) => Promise<T>
  reset: () => void
}

// 作品管理Hooks
export const useWorks = () => {
  const store = useWorksStore()
  
  // 创建作品
  const createWork = async (workData: WorkFormData) => {
    try {
      await store.addWork(workData)
      // TODO: 调用API
      // const newWork = await WorksAPI.createWork(workData)
      // store.addWork(newWork)
    } catch (error) {
      console.error('Failed to create work:', error)
      throw error
    }
  }
  
  // 更新作品
  const updateWork = async (id: string, workData: Partial<WorkFormData>) => {
    try {
      await store.updateWork(id, workData)
      // TODO: 调用API
      // const updatedWork = await WorksAPI.updateWork(id, workData)
      // store.updateWork(id, updatedWork)
    } catch (error) {
      console.error('Failed to update work:', error)
      throw error
    }
  }
  
  // 删除作品
  const deleteWork = async (id: string) => {
    try {
      await store.deleteWork(id)
      // TODO: 调用API
      // await WorksAPI.deleteWork(id)
    } catch (error) {
      console.error('Failed to delete work:', error)
      throw error
    }
  }
  
  // 获取作品统计
  const getWorkStats = async (workId?: string) => {
    try {
      await store.fetchWorkStats(workId)
      // TODO: 调用API
      // const stats = workId 
      //   ? await WorksAPI.getWorkStats(workId)
      //   : await WorksAPI.getAllWorksStats()
      // store.setStats(stats)
    } catch (error) {
      console.error('Failed to get work stats:', error)
      throw error
    }
  }
  
  return {
    works: store.works,
    currentWork: store.currentWork,
    stats: store.stats,
    loading: false, // TODO: 从store获取loading状态
    error: null, // TODO: 从store获取error状态
    createWork,
    updateWork,
    deleteWork,
    setCurrentWork: store.setCurrentWork,
    getWorkStats,
    refreshWorks: store.fetchWorks
  }
}

// 计时器Hooks
export const useTimer = () => {
  const store = useTimerStore()
  
  // 开始计时
  const startTimer = (mode: 'explore' | 'utilize', workId?: string) => {
    try {
      store.startTimer(mode, workId)
      // TODO: 调用API
      // TimerAPI.startTimer({ mode, workId, duration: store.config.focusTime * 60 })
    } catch (error) {
      console.error('Failed to start timer:', error)
      throw error
    }
  }
  
  // 暂停计时
  const pauseTimer = () => {
    try {
      store.pauseTimer()
      // TODO: 调用API
      // if (store.currentSession) {
      //   await TimerAPI.pauseTimer(store.currentSession.id)
      // }
    } catch (error) {
      console.error('Failed to pause timer:', error)
      throw error
    }
  }
  
  // 恢复计时
  const resumeTimer = () => {
    try {
      store.resumeTimer()
      // TODO: 调用API
      // if (store.currentSession) {
      //   await TimerAPI.resumeTimer(store.currentSession.id)
      // }
    } catch (error) {
      console.error('Failed to resume timer:', error)
      throw error
    }
  }
  
  // 停止计时
  const stopTimer = async () => {
    try {
      await store.stopTimer()
      // TODO: 调用API
      // if (store.currentSession) {
      //   await TimerAPI.stopTimer(store.currentSession.id)
      // }
    } catch (error) {
      console.error('Failed to stop timer:', error)
      throw error
    }
  }
  
  // 更新配置
  const updateConfig = async (config: Partial<TimerConfig>) => {
    try {
      store.updateConfig(config)
      // TODO: 调用API
      // await TimerAPI.updateTimerConfig(config)
    } catch (error) {
      console.error('Failed to update timer config:', error)
      throw error
    }
  }
  
  return {
    state: store.state,
    mode: store.mode,
    config: store.config,
    currentSession: store.currentSession,
    remainingTime: store.remainingTime,
    isRunning: store.isRunning,
    sessionHistory: store.sessionHistory,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer: store.resetTimer,
    updateConfig,
    setMode: store.setMode,
    tick: store.tick
  }
}

// 分析Hooks
export const useAnalytics = () => {
  const [data, setData] = React.useState<AnalyticsData | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  
  const getAnalytics = async (params: {
    startDate?: string
    endDate?: string
    workId?: string
    mode?: 'explore' | 'utilize'
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: 调用API
      // const analyticsData = await AnalyticsAPI.getAnalytics(params)
      // setData(analyticsData)
      
      setLoading(false)
    } catch (err) {
      setError(err as Error)
      setLoading(false)
    }
  }
  
  const exportData = async (params: {
    format: 'json' | 'csv' | 'excel'
    startDate?: string
    endDate?: string
    workId?: string
  }) => {
    try {
      setLoading(true)
      
      // TODO: 调用API
      // const exportData = await AnalyticsAPI.exportData(params)
      // 处理文件下载
      
      setLoading(false)
    } catch (err) {
      setError(err as Error)
      setLoading(false)
    }
  }
  
  return {
    data,
    loading,
    error,
    getAnalytics,
    exportData
  }
}

// 设置Hooks
export const useSettings = () => {
  const appStore = useAppStore()
  const uiStore = useUIStore()
  
  const updatePreferences = async (preferences: any) => {
    try {
      appStore.updatePreferences(preferences)
      // TODO: 调用API
      // await SettingsAPI.updatePreferences(preferences)
    } catch (error) {
      console.error('Failed to update preferences:', error)
      throw error
    }
  }
  
  const updateSettings = async (settings: any) => {
    try {
      appStore.updateSettings(settings)
      // TODO: 调用API
      // await SettingsAPI.updateSettings(settings)
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  }
  
  const backupData = async () => {
    try {
      // TODO: 调用API
      // const backupPath = await SettingsAPI.backupData()
      // return backupPath
    } catch (error) {
      console.error('Failed to backup data:', error)
      throw error
    }
  }
  
  const restoreData = async (backupPath: string) => {
    try {
      // TODO: 调用API
      // await SettingsAPI.restoreData(backupPath)
    } catch (error) {
      console.error('Failed to restore data:', error)
      throw error
    }
  }
  
  return {
    preferences: appStore.preferences,
    settings: appStore.settings,
    updatePreferences,
    updateSettings,
    backupData,
    restoreData
  }
}

// 系统Hooks
export const useSystem = () => {
  const [updateInfo, setUpdateInfo] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  
  const checkForUpdates = async () => {
    try {
      setLoading(true)
      
      // TODO: 调用API
      // const info = await SystemAPI.checkForUpdates()
      // setUpdateInfo(info)
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to check for updates:', error)
      setLoading(false)
    }
  }
  
  const downloadUpdate = async () => {
    try {
      setLoading(true)
      
      // TODO: 调用API
      // await SystemAPI.downloadUpdate()
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to download update:', error)
      setLoading(false)
    }
  }
  
  const installUpdate = async () => {
    try {
      // TODO: 调用API
      // await SystemAPI.installUpdate()
    } catch (error) {
      console.error('Failed to install update:', error)
    }
  }
  
  const showNotification = async (title: string, body: string) => {
    try {
      // TODO: 调用API
      // await SystemAPI.showNotification(title, body)
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }
  
  return {
    updateInfo,
    loading,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    showNotification
  }
}

// 通用异步Hook
export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = false
): UseAsyncState<T> {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  
  const execute = React.useCallback(async (...args: any[]) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await asyncFunction(...args)
      setData(result)
      
      setLoading(false)
      return result
    } catch (err) {
      setError(err as Error)
      setLoading(false)
      throw err
    }
  }, [asyncFunction])
  
  const reset = React.useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
  }, [])
  
  React.useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])
  
  return { data, loading, error, execute, reset }
}