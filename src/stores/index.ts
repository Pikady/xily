// 导出所有Store
export { useWorksStore } from './worksStore'
export { useTimerStore } from './timerStore'
export { useUIStore } from './uiStore'
export { useAppStore } from './appStore'
export { useAnalyticsStore } from './analyticsStore'

// 导出Store类型
export type { WorksState } from './worksStore'
export type { TimerStoreState } from './timerStore'
export type { UIStoreState } from './uiStore'
export type { AppStoreState } from './appStore'
export type { AnalyticsState } from './analyticsStore'

// Store初始化函数
export const initializeStores = async () => {
  const { useAppStore } = await import('./appStore')
  const { useWorksStore } = await import('./worksStore')
  const { useTimerStore } = await import('./timerStore')
  const { useUIStore } = await import('./uiStore')
  const { useAnalyticsStore } = await import('./analyticsStore')
  
  // 初始化应用状态
  await useAppStore.getState().initializeApp()
  
  // 初始化作品数据
  await useWorksStore.getState().fetchWorks()
  
  // 初始化计时器配置
  await useTimerStore.getState().fetchTimerConfig()
  
  // 应用主题设置
  const theme = useUIStore.getState().theme
  document.documentElement.setAttribute('data-theme', theme)
}

// 重置所有Store
export const resetAllStores = () => {
  const { useAppStore } = require('./appStore')
  const { useWorksStore } = require('./worksStore')
  const { useTimerStore } = require('./timerStore')
  const { useUIStore } = require('./uiStore')
  const { useAnalyticsStore } = require('./analyticsStore')
  
  useAppStore.getState().resetApp()
  useWorksStore.getState().clearWorks()
  useTimerStore.getState().resetTimer()
  useTimerStore.getState().clearHistory()
  useUIStore.getState().resetUI()
  useAnalyticsStore.getState().reset()
}